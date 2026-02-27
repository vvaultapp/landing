import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resendModule = await import("https://esm.sh/resend@4.0.0");
const Resend = resendModule.Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendLinkRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    const body: ResendLinkRequest = await req.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Resending magic link for email:", email);

    // Find client by email
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, workspace_id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (clientError || !client) {
      // Don't reveal if client exists or not
      console.log("Client not found or error:", clientError);
      return new Response(
        JSON.stringify({ success: true }), // Silent success
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get workspace name
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", client.workspace_id)
      .single();

    // Generate new magic link
    const origin = req.headers.get("origin") || "https://acqapp.lovable.app";
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim().toLowerCase(),
      options: {
        redirectTo: `${origin}/portal/magic-callback?clientId=${client.id}`,
      },
    });

    if (magicLinkError) {
      console.error("Error generating magic link:", magicLinkError);
      return new Response(
        JSON.stringify({ success: true }), // Silent success
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const magicLink = magicLinkData.properties.action_link;
    console.log("Magic link generated");

    // Send email
    await resend.emails.send({
      from: "The ACQ <noreply@theacq.app>",
      to: [email.trim()],
      subject: "Your new access link",
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
                  <tr>
                    <td style="padding: 32px 32px 24px 32px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                        New Access Link
                      </h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 0 32px 24px 32px;">
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                        You requested a new access link for your portal with <strong style="color: #ffffff;">${workspace?.name || "your coach"}</strong>. Click below to sign in.
                      </p>
                      
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
                        This link will let you create a new PIN.
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 24px 32px; border-top: 1px solid #2a2a2a;">
                      <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                        This link expires in 1 hour. If you didn't request this, you can safely ignore it.
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

    console.log("Email sent");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in resend-client-magic-link:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
