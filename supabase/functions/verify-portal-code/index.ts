import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for code verification
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface VerifyCodeRequest {
  email: string;
  code: string;
  type: 'client' | 'setter';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: VerifyCodeRequest = await req.json();
    const { email, code, type } = body;

    if (!email || !code || !type) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, code, and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying ${type} code for email:`, email);

    const hashedCode = await hashCode(code);
    let userId: string | null = null;
    let setterWorkspaceId: string | null = null;

    if (type === 'client') {
      // Find client by email
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id, user_id, workspace_id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (clientError) {
        console.error("Error finding client:", clientError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!client || !client.user_id) {
        console.log("Client not found or no user_id");
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get code for this client
      const { data: codeData, error: codeError } = await supabase
        .from("client_pins")
        .select("pin_hash")
        .eq("client_id", client.id)
        .maybeSingle();

      if (codeError) {
        console.error("Error finding code:", codeError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!codeData) {
        console.log("No code set for this client");
        return new Response(
          JSON.stringify({ success: false, error: "No secure code set. Please use the link from your email." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify code
      if (hashedCode !== codeData.pin_hash) {
        console.log("Code mismatch");
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = client.user_id;
    } else {
      // Setter verification
      // NOTE: a setter can (in theory) exist in multiple workspaces which creates
      // multiple rows for the same email. Using maybeSingle() here can throw a
      // "multiple rows" error, which breaks portal login after logout.
      const { data: setterCodes, error: setterError } = await supabase
        .from("setter_codes")
        .select("user_id, workspace_id, code_hash")
        .eq("email", email.toLowerCase().trim())
        .limit(50);

      if (setterError) {
        console.error("Error finding setter code:", setterError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!setterCodes || setterCodes.length === 0) {
        console.log("Setter not found");
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify code
      const matching = setterCodes.find((row) => row.code_hash === hashedCode) ?? null;
      if (!matching) {
        console.log("Code mismatch");
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = matching.user_id;
      setterWorkspaceId = matching.workspace_id ? String(matching.workspace_id) : null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Account not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Code verified, generating session for user:", userId);

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Account error. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link and verify it to create session
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email!,
    });

    if (linkError || !linkData) {
      console.error("Error generating session:", linkError);
      return new Response(
        JSON.stringify({ success: false, error: "Session error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the OTP token to create session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (sessionError || !sessionData.session) {
      console.error("Session verification error:", sessionError);
      // Fallback to redirect approach
      const actionLink = linkData.properties.action_link;
      return new Response(
        JSON.stringify({ 
          success: true, 
          redirect: actionLink,
          message: "Redirecting to complete login"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Session created successfully");

    // Setter portal hardening:
    // Ensure the setter is actually a workspace member for the workspace tied to their secure code.
    // Without this, RLS on inbox tables blocks access and the UI falls back to the owner dashboard.
    if (type === 'setter' && setterWorkspaceId) {
      try {
        const { data: existingMember, error: memberCheckError } = await supabase
          .from("workspace_members")
          .select("id,role")
          .eq("workspace_id", setterWorkspaceId)
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (memberCheckError) {
          console.warn("workspace_members lookup failed during setter login:", memberCheckError);
        }

        if (!existingMember) {
          const metadata = (userData.user.user_metadata || {}) as Record<string, unknown>;
          const metadataName = String(
            (metadata.full_name as string | undefined) ||
              (metadata.fullName as string | undefined) ||
              (metadata.display_name as string | undefined) ||
              (metadata.displayName as string | undefined) ||
              ""
          ).trim();
          const emailPrefix = String(userData.user.email || "").split("@")[0] || "";
          const displayName = metadataName || emailPrefix || "Setter";

          const { error: memberInsertError } = await supabase
            .from("workspace_members")
            .insert({
              workspace_id: setterWorkspaceId,
              user_id: userId,
              role: "setter",
              display_name: displayName || null,
            });

          if (memberInsertError) {
            console.warn("Failed to ensure workspace_members row for setter:", memberInsertError);
          }
        }
      } catch (err) {
        console.warn("Failed to ensure setter workspace membership:", err);
      }

      // Keep profile workspace selection aligned with the workspace tied to this setter code.
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              current_workspace_id: setterWorkspaceId,
              onboarding_completed: true,
            },
            { onConflict: "id" }
          );
        if (profileError) {
          console.warn("Failed to update profiles.current_workspace_id during setter login:", profileError);
        }
      } catch (err) {
        console.warn("Failed to upsert profile during setter login:", err);
      }

      // Ensure a portal_roles row exists for setter portal routing (best-effort).
      try {
        const { data: existingRole } = await supabase
          .from("portal_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("workspace_id", setterWorkspaceId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!existingRole?.id) {
          const { error: roleInsertError } = await supabase
            .from("portal_roles")
            .insert({
              id: crypto.randomUUID(),
              user_id: userId,
              workspace_id: setterWorkspaceId,
              role: "setter",
              client_id: null,
            });
          if (roleInsertError) {
            console.warn("Failed to insert portal_roles setter row during login:", roleInsertError);
          }
        }
      } catch (err) {
        console.warn("Failed to ensure portal_roles row for setter:", err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        type,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in verify-portal-code:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
