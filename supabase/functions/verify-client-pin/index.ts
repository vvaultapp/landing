import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for PIN verification
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface VerifyPinRequest {
  email: string;
  pin: string;
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

    const body: VerifyPinRequest = await req.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and PIN are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying PIN for email:", email);

    // Find client by email
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, user_id, workspace_id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (clientError) {
      console.error("Error finding client:", clientError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or PIN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!client || !client.user_id) {
      console.log("Client not found or no user_id");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or PIN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PIN for this client
    const { data: pinData, error: pinError } = await supabase
      .from("client_pins")
      .select("pin_hash")
      .eq("client_id", client.id)
      .maybeSingle();

    if (pinError) {
      console.error("Error finding PIN:", pinError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or PIN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pinData) {
      console.log("No PIN set for this client");
      return new Response(
        JSON.stringify({ success: false, error: "No PIN set. Please use the link from your email." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify PIN
    const hashedPin = await hashPin(pin);
    if (hashedPin !== pinData.pin_hash) {
      console.log("PIN mismatch");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or PIN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("PIN verified, generating session for user:", client.user_id);

    // Generate a session for the user using admin API
    // We need to sign in the user programmatically
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(client.user_id);
    
    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Account error. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link and extract tokens (this creates a new session)
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

    // The link data contains the tokens we need
    // We need to use the token from the link to create a session
    const actionLink = linkData.properties.action_link;
    const url = new URL(actionLink);
    const hashParams = new URLSearchParams(url.hash.substring(1));
    
    // For OTP-based session creation, we'll use a different approach
    // Generate an OTP that we immediately verify
    const { data: otpData, error: otpError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: userData.user.email!,
    });

    if (otpError) {
      console.error("Error with OTP:", otpError);
    }

    // Actually, let's use the magic link token to exchange for a session
    // Extract the token from the magic link
    const token = url.searchParams.get("token") || hashParams.get("access_token");
    
    if (!token) {
      // Fallback: Return info so client can redirect to magic link
      return new Response(
        JSON.stringify({ 
          success: true, 
          redirect: actionLink,
          message: "Redirecting to complete login"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For the verification to work, we'll verify the OTP token
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (sessionError || !sessionData.session) {
      console.error("Session verification error:", sessionError);
      // Fallback to redirect approach
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

    return new Response(
      JSON.stringify({ 
        success: true,
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in verify-client-pin:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
