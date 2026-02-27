import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ClientFileUploadUrlRequest = {
  workspaceId: string;
  clientId: string;
  filename: string;
};

function sanitizeFilename(name: string): string {
  // Avoid path traversal and keep it reasonably clean for URLs.
  const trimmed = String(name || "").trim();
  const withoutSlashes = trimmed.replace(/[\\/]/g, "-");
  const collapsed = withoutSlashes.replace(/\s+/g, " ").trim();
  // Limit length to avoid extremely long object names.
  return collapsed.slice(0, 180) || "file";
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

    const body = (await req.json()) as Partial<ClientFileUploadUrlRequest>;
    const workspaceId = String(body.workspaceId || "").trim();
    const clientId = String(body.clientId || "").trim();
    const filename = sanitizeFilename(String(body.filename || ""));

    if (!workspaceId || !clientId || !filename) {
      return new Response(JSON.stringify({ error: "workspaceId, clientId, and filename are required" }), {
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

    // Ensure the client exists in the workspace.
    const { data: clientRow, error: clientError } = await supabase
      .from("clients")
      .select("id,workspace_id")
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
    // - Workspace members can upload to any client in their workspace.
    // - Portal clients can upload only to their own client folder.
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
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Storage path convention: {workspace_id}/{client_id}/{uuid}-{filename}
    const storagePath = `${workspaceId}/${clientId}/${crypto.randomUUID()}-${filename}`;

    const { data: signed, error: signedError } = await supabase.storage
      .from("uploads")
      .createSignedUploadUrl(storagePath);

    if (signedError || !signed) {
      console.error("createSignedUploadUrl failed:", signedError);
      return new Response(JSON.stringify({ error: "Failed to create upload URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        path: signed.path,
        token: signed.token,
        signedUrl: signed.signedUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("client-file-upload-url error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

