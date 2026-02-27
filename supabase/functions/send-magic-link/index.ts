import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Use esm.sh for Resend (same pattern as send-verification-email)
const resendModule = await import("https://esm.sh/resend@4.0.0");
const Resend = resendModule.Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMagicLinkRequest {
  email: string;
  clientId: string;
  clientName: string;
  workspaceName: string;
  redirectTo?: string;
}

async function ensurePortalRole(params: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  workspaceId: string;
  role: "client" | "setter" | "coach";
  clientId?: string | null;
}) {
  const { supabase, userId, workspaceId, role, clientId } = params;

  const { data: existingExact, error: exactError } = await supabase
    .from("portal_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exactError) throw exactError;

  if (existingExact?.id) {
    const { error: updateError } = await supabase
      .from("portal_roles")
      .update({
        role,
        client_id: clientId ?? null,
      })
      .eq("id", existingExact.id);

    if (!updateError) return;
    console.warn("portal_roles updateExact failed, falling back:", updateError);
  }

  const { error: insertError } = await supabase.from("portal_roles").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    workspace_id: workspaceId,
    role,
    client_id: clientId ?? null,
  });

  if (!insertError) return;

  const { data: anyRoleForUser, error: anyRoleError } = await supabase
    .from("portal_roles")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (anyRoleError) throw insertError;

  if (anyRoleForUser?.id) {
    const { error: updateAnyError } = await supabase
      .from("portal_roles")
      .update({
        workspace_id: workspaceId,
        role,
        client_id: clientId ?? null,
      })
      .eq("id", anyRoleForUser.id);

    if (!updateAnyError) return;
    throw updateAnyError;
  }

  throw insertError;
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

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
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
    const resend = new Resend(RESEND_API_KEY);

    const body: SendMagicLinkRequest = await req.json();
    const { email, clientId, clientName, workspaceName, redirectTo } = body;

    if (!email || !clientId) {
      return new Response(
        JSON.stringify({ error: "email and clientId are required" }),
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

    const { data: clientRecord, error: clientError } = await supabase
      .from("clients")
      .select("id,name,workspace_id")
      .eq("id", clientId)
      .maybeSingle();

    if (clientError || !clientRecord) {
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", clientRecord.workspace_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: "You do not have access to this client workspace" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: workspaceRecord } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", clientRecord.workspace_id)
      .maybeSingle();

    const resolvedWorkspaceName = workspaceRecord?.name || workspaceName || "Your coach";
    const normalizedEmail = email.trim().toLowerCase();
    const appOrigin = req.headers.get("origin") || "https://theacq.app";

    console.log("Sending magic link to:", email, "for client:", clientId);

    // Generate magic link using Supabase Auth
    // This creates a user if they don't exist and sends them a login link
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: {
        redirectTo: redirectTo || `${appOrigin}/portal/magic-callback?clientId=${clientId}`,
      },
    });

    if (magicLinkError) {
      console.error("Error generating magic link:", magicLinkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate magic link: " + magicLinkError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const magicLink = magicLinkData.properties.action_link;
    console.log("Magic link generated for user:", magicLinkData.user.id);

    // Update client with user_id now that we know who they are
    const userId = magicLinkData.user.id;
    
    // Update client email and potentially link user
    await supabase
      .from("clients")
      .update({ email: normalizedEmail })
      .eq("id", clientId)
      .eq("workspace_id", clientRecord.workspace_id);

    if (clientRecord.workspace_id) {
      // Pre-create portal_role so it's ready when they log in
      try {
        await ensurePortalRole({
          supabase,
          userId,
          workspaceId: clientRecord.workspace_id,
          role: "client",
          clientId,
        });
      } catch (roleError) {
        console.warn("Failed to pre-create portal role for magic link:", roleError);
      }

      // Link user to client
      await supabase
        .from("clients")
        .update({ user_id: userId })
        .eq("id", clientId);

      // Ensure profile exists with correct workspace
      await supabase
        .from("profiles")
        .upsert({
          id: userId,
          display_name: clientName || normalizedEmail.split("@")[0],
          current_workspace_id: clientRecord.workspace_id,
          onboarding_completed: true, // Will do portal onboarding
        }, {
          onConflict: "id",
        });
    }

    // Send beautiful email with the magic link
    const emailResult = await resend.emails.send({
      from: "The ACQ <noreply@theacq.app>",
      to: [normalizedEmail],
      subject: `${resolvedWorkspaceName || "Your coach"} invited you to their client portal`,
      html: `
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
                        Welcome${clientName ? `, ${clientName}` : ""}! 👋
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 0 32px 24px 32px;">
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                        <strong style="color: #ffffff;">${resolvedWorkspaceName || "Your coach"}</strong> has invited you to their client portal. Click below to access your dashboard, tasks, and files.
                      </p>
                      
                      <!-- Magic Link Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 8px 0;">
                            <a href="${magicLink}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 12px;">
                              Access Your Portal →
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0 0; font-size: 13px; color: #71717a; text-align: center;">
                        No password needed – just click the link above.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; border-top: 1px solid #2a2a2a;">
                      <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                        This link expires in 1 hour. If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Email sent:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: "Magic link sent successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-magic-link:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send magic link" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
