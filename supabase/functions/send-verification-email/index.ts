import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Use esm.sh for Resend
const resendModule = await import("https://esm.sh/resend@4.0.0");
const Resend = resendModule.Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  userId?: string;
  email: string;
  fullName?: string;
  type: "verification" | "password-reset" | "invite" | "client-invite";
  inviteToken?: string;
  workspaceName?: string;
  clientId?: string;
  clientName?: string;
  coachName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: VerificationEmailRequest = await req.json();
    const { userId, email, fullName, type, inviteToken, workspaceName, clientId, clientName, coachName } = body;

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Email and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a secure token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    const baseUrl = "https://theacq.app";
    
    let subject: string;
    let htmlContent: string;
    let verifyUrl: string;
    let actualUserId = userId;

    // For password reset, look up user by email server-side to prevent enumeration
    if (type === "password-reset") {
      // Use admin API to find user by email
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const foundUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!foundUser) {
        // Return success even if user doesn't exist (prevent enumeration)
        console.log("Password reset requested for non-existent email (returning success to prevent enumeration)");
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      actualUserId = foundUser.id;
    }

    if (type === "verification") {
      // Store verification token
      const { error: tokenError } = await supabase
        .from("email_verifications")
        .insert({
          user_id: userId,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (tokenError) {
        console.error("Error creating verification token:", tokenError);
        return new Response(
          JSON.stringify({ error: "Failed to create verification token" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      verifyUrl = `${baseUrl}/verify-email?token=${token}`;
      subject = "Verify your email - ACQ Dashboard";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            h1 { font-size: 24px; font-weight: 400; margin-bottom: 24px; }
            p { color: #999; line-height: 1.6; }
            .button { display: inline-block; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 500; margin: 24px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify your email</h1>
            <p>Hi${fullName ? ` ${fullName}` : ""},</p>
            <p>Thanks for signing up for ACQ Dashboard. Click the button below to verify your email address.</p>
            <a href="${verifyUrl}" class="button">Verify Email</a>
            <p class="footer">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
          </div>
        </body>
        </html>
      `;
    } else if (type === "password-reset") {
      // Store password reset token with the looked-up user ID
      const { error: tokenError } = await supabase
        .from("password_resets")
        .insert({
          user_id: actualUserId,
          token,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });

      if (tokenError) {
        console.error("Error creating reset token:", tokenError);
        // Return success anyway to prevent enumeration
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      verifyUrl = `${baseUrl}/reset-password?token=${token}`;
      subject = "Reset your password - ACQ Dashboard";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            h1 { font-size: 24px; font-weight: 400; margin-bottom: 24px; }
            p { color: #999; line-height: 1.6; }
            .button { display: inline-block; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 500; margin: 24px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset your password</h1>
            <p>Hi${fullName ? ` ${fullName}` : ""},</p>
            <p>We received a request to reset your password. Click the button below to choose a new password.</p>
            <a href="${verifyUrl}" class="button">Reset Password</a>
            <p class="footer">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
          </div>
        </body>
        </html>
      `;
    } else if (type === "invite") {
      verifyUrl = `${baseUrl}/accept-invite?token=${inviteToken}`;
      subject = `You've been invited to ${workspaceName || "ACQ Dashboard"}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            h1 { font-size: 24px; font-weight: 400; margin-bottom: 24px; }
            p { color: #999; line-height: 1.6; }
            .button { display: inline-block; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 500; margin: 24px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You've been invited</h1>
            <p>Hi,</p>
            <p>You've been invited to join <strong>${workspaceName || "a workspace"}</strong> on ACQ Dashboard as an Appointment Setter.</p>
            <a href="${verifyUrl}" class="button">Accept Invitation</a>
            <p class="footer">This invitation expires in 7 days.</p>
          </div>
        </body>
        </html>
      `;
    } else if (type === "client-invite") {
      verifyUrl = `${baseUrl}/accept-invite?token=${inviteToken}&clientId=${clientId}`;
      const coachDisplayName = coachName || "your coach";
      subject = `Join ${coachDisplayName} to be apart of the journey`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; }
            h1 { font-size: 24px; font-weight: 400; margin-bottom: 24px; }
            p { color: #999; line-height: 1.6; }
            .button { display: inline-block; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 500; margin: 24px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Join ${coachDisplayName} to be apart of the journey</h1>
            <p>Hi${clientName ? ` ${clientName}` : ""},</p>
            <p>${coachDisplayName} has invited you to access your personalized client portal. Here you'll find your tasks, files, and everything you need to work together on your growth.</p>
            <a href="${verifyUrl}" class="button">Accept Invitation</a>
            <p class="footer">This invitation expires in 7 days. If you have any questions, please contact your coach.</p>
          </div>
        </body>
        </html>
      `;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid email type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "ACQ Dashboard <noreply@theacq.app>",
      to: [email],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-verification-email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});