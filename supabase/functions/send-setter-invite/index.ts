import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const resendModule = await import("https://esm.sh/resend@4.0.0");
const Resend = resendModule.Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendSetterInviteRequest {
  email: string;
  workspaceId: string;
  workspaceName: string;
  invitedBy: string;
  role?: "setter" | "closer";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
    if (!bearerToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

    const body: SendSetterInviteRequest = await req.json();
    const { email, workspaceId, role } = body;
    const requestedRole = role === "closer" ? "closer" : "setter";
    const inviteRole = "setter";
    const roleLabel = requestedRole === "closer" ? "Closer" : "Appointment Setter";

    if (!email || !workspaceId) {
      return new Response(
        JSON.stringify({ error: "email and workspaceId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(bearerToken);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let isOwner = false;
    let hasWorkspaceAccess = false;
    try {
      const { data: ownerFlag, error: ownerError } = await supabase.rpc("is_workspace_owner", {
        ws_id: workspaceId,
        p_user_id: user.id,
      });
      if (!ownerError) {
        isOwner = Boolean(ownerFlag);
      } else {
        console.warn("is_workspace_owner rpc failed, falling back to legacy checks:", ownerError.message);
      }
    } catch (rpcError) {
      console.warn("is_workspace_owner rpc threw, falling back to legacy checks:", rpcError);
    }

    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    hasWorkspaceAccess = Boolean(member);

    if (!isOwner) {
      isOwner = Boolean(member && member.role === "owner");
    }

    let isCoach = false;
    if (!isOwner) {
      const { data: coachRole } = await supabase
        .from("portal_roles")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .eq("role", "coach")
        .maybeSingle();
      isCoach = Boolean(coachRole);
      hasWorkspaceAccess = hasWorkspaceAccess || isCoach;
      isOwner = isOwner || isCoach;
    }

    // Team invites are workspace-scoped. Allow any workspace member (owner/coach/setter)
    // to send an invite, while still rejecting non-members.
    if (!hasWorkspaceAccess) {
      if (memberError || !member) {
        return new Response(
          JSON.stringify({ error: "You do not have access to this workspace" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Only workspace members can send team invites" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending setter invite to:", email, "for workspace:", workspaceId);

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure workspace exists and use its canonical name.
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id,name")
      .eq("id", workspaceId)
      .maybeSingle();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ error: "Workspace not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const workspaceName = workspace.name || "The ACQ Workspace";

    // Reuse active invite if one exists, otherwise create a new one.
    const { data: existingInvite } = await supabase
      .from("invites")
      .select("id,token")
      .eq("workspace_id", workspaceId)
      .eq("email", normalizedEmail)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let token = existingInvite?.token || "";
    if (!token) {
      token = crypto.randomUUID() + "-" + crypto.randomUUID();
      const { error: inviteError } = await supabase
        .from("invites")
        .insert({
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          email: normalizedEmail,
          role: inviteRole,
          token,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (inviteError) {
        console.error("Error creating invite:", inviteError);
        return new Response(
          JSON.stringify({ error: "Failed to create invite: " + inviteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const appOrigin = req.headers.get("origin") || "https://theacq.app";

    const inviteUrl = `${appOrigin.replace(/\/$/, "")}/accept-invite?token=${encodeURIComponent(token)}`;

    const inviteSubject = `${workspaceName || "A coach"} invited you as ${roleLabel}`;
    const inviteHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #141414; border-radius: 16px; border: 1px solid #2a2a2a; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px 32px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                        You're Invited! 🎯
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 0 32px 24px 32px;">
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                        <strong style="color: #ffffff;">${workspaceName || "A coach"}</strong> has invited you to join their team as a <strong style="color: #3b82f6;">${roleLabel}</strong>.
                      </p>
                      
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                        As an appointment setter, you'll have access to:
                      </p>
                      
                      <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #a1a1aa;">
                        <li>Instagram DMs & Lead Filtering</li>
                        <li>Task Management</li>
                        <li>Workspace inbox assignment</li>
                      </ul>
                      
                      <!-- Invite Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 8px 0;">
                            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 12px;">
                              Accept Invitation →
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0 0; font-size: 13px; color: #71717a; text-align: center;">
                        You'll create a secure code on your first login.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; border-top: 1px solid #2a2a2a;">
                      <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                        This link expires in 7 days. If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

    const fromPrimary = Deno.env.get("INVITES_FROM_EMAIL") || "The ACQ <noreply@theacq.app>";
    const fromFallback = Deno.env.get("INVITES_FROM_EMAIL_FALLBACK") || "ACQ <onboarding@resend.dev>";

    let emailResult: any = null;
    let emailError: unknown = null;

    if (!resend) {
      emailError = new Error("RESEND_API_KEY not configured");
      console.error("Invite email skipped because RESEND_API_KEY is missing");
    } else {
      try {
        emailResult = await resend.emails.send({
          from: fromPrimary,
          to: [normalizedEmail],
          subject: inviteSubject,
          html: inviteHtml,
        });
      } catch (err) {
        console.error("Primary invite email send failed, retrying fallback sender:", err);
        emailError = err;
        try {
          emailResult = await resend.emails.send({
            from: fromFallback,
            to: [normalizedEmail],
            subject: inviteSubject,
            html: inviteHtml,
          });
          emailError = null;
        } catch (fallbackErr) {
          emailError = fallbackErr;
          console.error("Fallback invite email send failed:", fallbackErr);
        }
      }
    }

    if (emailError) {
      // Keep invite creation successful so owner can still onboard setter with link.
      return new Response(
        JSON.stringify({
          success: true,
          token,
          inviteUrl,
          storedRole: inviteRole,
          role: requestedRole,
          emailDelivered: false,
          warning: "Invitation link created, but email delivery failed. Share the link manually.",
          message: "Invite created",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invite email sent:", emailResult);

    return new Response(
      JSON.stringify({
        success: true, 
        token,
        inviteUrl,
        storedRole: inviteRole,
        role: requestedRole,
        emailDelivered: true,
        message: "Team invite sent successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-setter-invite:", error);
    const message = error instanceof Error ? error.message : "Failed to send setter invite";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
