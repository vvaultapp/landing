import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptInviteRequest {
  token: string;
  userId: string;
  clientId?: string; // For client invites
  fullName?: string;
  displayName?: string;
}

async function ensurePortalRole(params: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  workspaceId: string;
  role: "client" | "setter" | "coach";
  clientId?: string | null;
}) {
  const { supabase, userId, workspaceId, role, clientId } = params;

  // 1) Prefer updating an existing deterministic row for this user+workspace.
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
    const { error: updateExactError } = await supabase
      .from("portal_roles")
      .update({
        role,
        client_id: clientId ?? null,
      })
      .eq("id", existingExact.id);

    if (!updateExactError) return;
    // Fall through to insert/update fallback.
    console.warn("portal_roles updateExact failed, falling back:", updateExactError);
  }

  // 2) Insert a fresh row with an explicit id (some deployments have id defaults drifted).
  const { error: insertError } = await supabase
    .from("portal_roles")
    .insert({
      id: crypto.randomUUID(),
      user_id: userId,
      workspace_id: workspaceId,
      role,
      client_id: clientId ?? null,
    });

  if (!insertError) return;

  // 3) Fallback for drifted schemas that accidentally enforce unique(user_id) only:
  // reuse any existing row for this user and move it to this workspace/client.
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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: AcceptInviteRequest = await req.json();
    const { token, userId, clientId, fullName, displayName: requestedDisplayName } = body;

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: "Token and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find invite
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

    const inviteType = String((invite as { invite_type?: string | null }).invite_type || "").trim() || "team";
    const inviteClientId = String((invite as { client_id?: string | null }).client_id || "").trim() || null;
    const requestedClientId = String(clientId || "").trim() || null; // legacy URL path parameter, no longer trusted.

    if (inviteClientId && requestedClientId && inviteClientId !== requestedClientId) {
      return new Response(
        JSON.stringify({ error: "Invitation link does not match target client" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resolvedClientId = inviteClientId || requestedClientId;
    const isClientInvite = inviteType === "client" || Boolean(resolvedClientId);

    if (inviteType === "client" && !resolvedClientId) {
      return new Response(
        JSON.stringify({ error: "Invalid client invitation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: invitedUser, error: invitedUserError } = await supabase.auth.admin.getUserById(userId);
    if (invitedUserError || !invitedUser?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid user session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = (invitedUser.user.email || "").trim().toLowerCase();
    const inviteEmail = (invite.email || "").trim().toLowerCase();
    if (!userEmail || !inviteEmail || userEmail !== inviteEmail) {
      return new Response(
        JSON.stringify({ error: "This invitation is for a different email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", invite.workspace_id)
      .maybeSingle();

    // Get the workspace name for display name
    const workspaceName = workspace?.name || "Client";

    if (isClientInvite && resolvedClientId) {
      // Handle client invite - create portal_role and link to client
      console.log("Processing client invite for clientId:", resolvedClientId);

      // Verify client exists
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", resolvedClientId)
        .eq("workspace_id", invite.workspace_id)
        .single();

      if (clientError || !client) {
        console.error("Client not found:", clientError);
        return new Response(
          JSON.stringify({ error: "Client record not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        await ensurePortalRole({
          supabase,
          userId,
          workspaceId: invite.workspace_id,
          role: "client",
          clientId: resolvedClientId,
        });
      } catch (roleError: unknown) {
        console.error("Error creating portal role:", roleError);
        return new Response(
          JSON.stringify({
            error: `Failed to grant portal access: ${
              (roleError as { message?: string } | null)?.message || "unknown error"
            }`,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Link user to client record.
      const { error: linkClientError } = await supabase
        .from("clients")
        .update({ user_id: userId })
        .eq("id", resolvedClientId)
        .eq("workspace_id", invite.workspace_id);

      if (linkClientError) {
        console.error("Error linking client user:", linkClientError);
        return new Response(
          JSON.stringify({ error: `Failed to link client user: ${linkClientError.message || "unknown error"}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark invite as accepted.
      const { error: acceptInviteError } = await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      if (acceptInviteError) {
        console.error("Error marking invite as accepted:", acceptInviteError);
        return new Response(
          JSON.stringify({ error: `Failed to mark invite accepted: ${acceptInviteError.message || "unknown error"}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const clientDisplayName = String(
        fullName || client.name || userEmail.split("@")[0] || "Client"
      ).trim();

      // Update user profile.
      const { error: profileUpsertError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          display_name: clientDisplayName || null,
          full_name: clientDisplayName || null,
          current_workspace_id: invite.workspace_id,
          onboarding_completed: true, // Client will do portal onboarding instead
        }, {
          onConflict: "id",
        });

      if (profileUpsertError) {
        console.error("Error updating client profile:", profileUpsertError);
        return new Response(
          JSON.stringify({ error: `Failed to update profile: ${profileUpsertError.message || "unknown error"}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          workspaceId: invite.workspace_id,
          workspaceName: workspaceName,
          role: "client",
          redirectTo: "/portal",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Standard setter/team invite
    const metadata = (invitedUser.user.user_metadata || {}) as Record<string, unknown>;
    const requestedName = String(fullName || requestedDisplayName || '').trim();
    const metadataName = String(
      (metadata.full_name as string | undefined) ||
      (metadata.fullName as string | undefined) ||
      (metadata.display_name as string | undefined) ||
      (metadata.displayName as string | undefined) ||
      ''
    ).trim();

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("full_name,display_name")
      .eq("id", userId)
      .maybeSingle();

    const existingFullName = String(existingProfile?.full_name || '').trim();
    const existingDisplayName = String(existingProfile?.display_name || '').trim();
    const normalizedFullName = requestedName || metadataName || existingFullName || '';
    const emailPrefix = userEmail.split('@')[0] || '';
    const memberDisplayName = normalizedFullName || existingDisplayName || emailPrefix || 'Team Member';

    // Add (or update) user workspace membership.
    const { error: memberError } = await supabase
      .from("workspace_members")
      .upsert({
        workspace_id: invite.workspace_id,
        user_id: userId,
        role: invite.role,
        display_name: memberDisplayName,
      }, {
        onConflict: "workspace_id,user_id",
      });

    if (memberError) {
      console.error("Error adding workspace member:", memberError);
      return new Response(
        JSON.stringify({ error: "Failed to join workspace" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      await ensurePortalRole({
        supabase,
        userId,
        workspaceId: invite.workspace_id,
        role: "setter",
        clientId: null,
      });
    } catch (setterRoleError) {
      console.warn("portal_roles setter ensure failed:", setterRoleError);
    }

    // Mark invite as accepted
    await supabase
      .from("invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Update user profile with current workspace
    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        // Keep profile naming consistent with what the user entered during signup.
        display_name: memberDisplayName || null,
        full_name: normalizedFullName || null,
        current_workspace_id: invite.workspace_id,
        onboarding_completed: true,
      }, {
        onConflict: "id",
      });

    try {
      const currentMetadata = (invitedUser.user.user_metadata || {}) as Record<string, unknown>;
      if (String(currentMetadata.acq_role_hint || "").trim().toLowerCase() !== "setter") {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...currentMetadata,
            acq_role_hint: "setter",
          },
        });
        if (metadataError) {
          console.warn("Failed to persist setter metadata hint:", metadataError);
        }
      }
    } catch (metadataPatchError) {
      console.warn("Setter metadata hint patch failed:", metadataPatchError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        workspaceId: invite.workspace_id,
        workspaceName: workspaceName,
        role: invite.role,
        redirectTo: "/messages",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in accept-invite:", error);
    return new Response(
      JSON.stringify({ error: "Failed to accept invitation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
