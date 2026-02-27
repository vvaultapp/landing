import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ClientFileDownloadUrlRequest = {
  workspaceId: string;
  clientId: string;
  fileId?: string;
  path?: string;
  expiresInSeconds?: number;
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = (await req.json()) as Partial<ClientFileDownloadUrlRequest>;
    const workspaceId = String(body.workspaceId || "").trim();
    const clientId = String(body.clientId || "").trim();
    const fileId = String(body.fileId || "").trim() || null;
    const path = String(body.path || "").trim() || null;
    const expiresInSeconds = clampInt(body.expiresInSeconds, 60, 3600, 300);

    if (!workspaceId || !clientId || (!fileId && !path)) {
      return new Response(JSON.stringify({ error: "workspaceId, clientId, and fileId (or path) are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(bearerToken);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure the client exists in the workspace (and pull user_id for fallback checks).
    const { data: clientRow, error: clientError } = await supabase
      .from("clients")
      .select("id,workspace_id,user_id")
      .eq("id", clientId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (clientError) {
      console.error("Client lookup failed:", clientError);
      return new Response(JSON.stringify({ error: "Failed to validate client" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!clientRow) {
      return new Response(JSON.stringify({ error: "Client not found in workspace" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Access control:
    // - Workspace members can download for any client in their workspace.
    // - Portal clients can download only their own client folder.
    // - Fallback: if portal_roles drifted, rely on clients.user_id linkage.
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    let allowed = Boolean(member);
    if (!allowed) {
      const { data: portalRole, error: portalError } = await supabase
        .from("portal_roles")
        .select("role,client_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (portalError) {
        console.error("portal_roles lookup failed:", portalError);
      }

      if (portalRole?.role === "coach") allowed = true;
      if (portalRole?.role === "client" && String(portalRole.client_id || "") === clientId) allowed = true;
    }

    if (!allowed) {
      const linkedUserId = String((clientRow as { user_id?: string | null }).user_id || "").trim();
      if (linkedUserId && linkedUserId === String(user.id)) {
        allowed = true;
      }
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve storage path from fileId when available to avoid client-side path tampering.
    let storagePath = path;
    if (fileId) {
      const { data: fileRow, error: fileError } = await supabase
        .from("client_files")
        .select("file_url,client_id,workspace_id")
        .eq("id", fileId)
        .eq("client_id", clientId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (fileError) {
        console.error("client_files lookup failed:", fileError);
        return new Response(JSON.stringify({ error: "Failed to locate file" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!fileRow?.file_url) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      storagePath = String(fileRow.file_url);
    }

    if (!storagePath) {
      return new Response(JSON.stringify({ error: "File path missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requiredPrefix = `${workspaceId}/${clientId}/`;
    if (!storagePath.startsWith(requiredPrefix)) {
      return new Response(JSON.stringify({ error: "Invalid file path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from("uploads")
      .createSignedUrl(storagePath, expiresInSeconds);

    if (signedError || !signed?.signedUrl) {
      console.error("createSignedUrl failed:", signedError);
      return new Response(JSON.stringify({ error: "Failed to create download URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        path: storagePath,
        signedUrl: signed.signedUrl,
        expiresInSeconds,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("client-file-download-url error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

