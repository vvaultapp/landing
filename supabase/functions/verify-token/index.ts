import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyTokenRequest {
  token: string;
  type: "email" | "password-reset" | "invite";
  newPassword?: string;
  clientId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: VerifyTokenRequest = await req.json();
    const { token, type, newPassword, clientId } = body;

    if (!token || !type) {
      return new Response(
        JSON.stringify({ error: "Token and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "email") {
      // Find and verify email verification token
      const { data: verification, error: findError } = await supabase
        .from("email_verifications")
        .select("*")
        .eq("token", token)
        .is("verified_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (findError || !verification) {
        console.error("Token not found or expired:", findError);
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark token as verified
      const { error: updateTokenError } = await supabase
        .from("email_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", verification.id);

      if (updateTokenError) {
        console.error("Error updating token:", updateTokenError);
      }

      // Update profile email_verified status
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", verification.user_id);

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
        return new Response(
          JSON.stringify({ error: "Failed to verify email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, userId: verification.user_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "password-reset") {
      if (!newPassword || newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 8 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find password reset token
      const { data: resetToken, error: findError } = await supabase
        .from("password_resets")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (findError || !resetToken) {
        console.error("Reset token not found or expired:", findError);
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update user's password
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        resetToken.user_id,
        { password: newPassword }
      );

      if (updateAuthError) {
        console.error("Error updating password:", updateAuthError);
        return new Response(
          JSON.stringify({ error: "Failed to update password" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark token as used
      await supabase
        .from("password_resets")
        .update({ used_at: new Date().toISOString() })
        .eq("id", resetToken.id);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "invite") {
      // Find invite token
      let { data: invite, error: findError } = await supabase
        .from("invites")
        .select("id,email,role,workspace_id,expires_at,accepted_at,created_at,invite_type,client_id")
        .eq("token", token)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Compatibility fallback for environments where invite_type/client_id columns are not migrated yet.
      if (findError && /(invite_type|client_id)/i.test(String(findError.message || ""))) {
        const retry = await supabase
          .from("invites")
          .select("id,email,role,workspace_id,expires_at,accepted_at,created_at")
          .eq("token", token)
          .is("accepted_at", null)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        invite = retry.data as typeof invite;
        findError = retry.error;
      }

      if (findError || !invite) {
        console.error("Invite not found or expired:", findError);
        return new Response(
          JSON.stringify({ error: "Invalid or expired invitation" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: workspace } = await supabase
        .from("workspaces")
        .select("name")
        .eq("id", invite.workspace_id)
        .maybeSingle();
      const workspaceName = workspace?.name || "The ACQ Workspace";

      // Client invites are now resolved from invite row. URL clientId is only fallback for legacy links.
      const inviteClientId = String((invite as { client_id?: string | null }).client_id || "").trim() || null;
      const inviteType = String((invite as { invite_type?: string | null }).invite_type || "").trim() || "team";
      const resolvedClientId = inviteClientId || (clientId ? String(clientId).trim() : null);
      const isClientInvite = inviteType === "client" || Boolean(inviteClientId) || Boolean(clientId);

      let clientName = undefined;
      if (isClientInvite && resolvedClientId) {
        const { data: client } = await supabase
          .from("clients")
          .select("name")
          .eq("id", resolvedClientId)
          .eq("workspace_id", invite.workspace_id)
          .maybeSingle();
        clientName = client?.name;
      }

      return new Response(
        JSON.stringify({
          success: true,
          invite: {
            email: invite.email,
            role: invite.role,
            workspaceId: invite.workspace_id,
            workspaceName,
            inviteType,
            clientId: resolvedClientId,
            clientName,
            isClientInvite,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid token type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-token:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
