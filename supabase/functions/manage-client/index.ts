import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageClientRequest {
  action: "create" | "delete" | "invite";
  workspaceId: string;
  clientId?: string;
  name?: string;
  email?: string;
  questions?: Array<{
    question_text?: string;
    question_type?: string;
    is_required?: boolean;
    placeholder?: string | null;
    question_order?: number;
    options_json?: string[] | null;
  }>;
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

    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
    if (!bearerToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: ManageClientRequest = await req.json();
    const { action, workspaceId, clientId, name, email, questions } = body;

    console.log("manage-client action:", action, "workspaceId:", workspaceId);

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: "workspaceId is required" }),
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

    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (memberError) {
      console.error("workspace_members lookup failed:", memberError);
    }

    const isOwner = Boolean(member?.role === "owner");
    let isCoach = false;
    if (!isOwner) {
      const { data: coachRole, error: coachError } = await supabase
        .from("portal_roles")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .eq("role", "coach")
        .maybeSingle();
      if (coachError) {
        console.error("portal_roles coach lookup failed:", coachError);
      } else {
        isCoach = Boolean(coachRole);
      }
    }

    if (!member && !isCoach) {
      return new Response(
        JSON.stringify({ error: "You do not have access to this workspace" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isOwner && !isCoach) {
      return new Response(
        JSON.stringify({ error: "Only workspace owners or coaches can manage clients" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify workspace exists
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("id", workspaceId)
      .single();

    if (wsError || !workspace) {
      console.error("Workspace not found:", wsError);
      return new Response(
        JSON.stringify({ error: "Workspace not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create") {
      if (!name?.trim()) {
        return new Response(
          JSON.stringify({ error: "Client name is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create client using service role (bypasses RLS)
      const { data: newClient, error: insertError } = await supabase
        .from("clients")
        .insert({
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          name: name.trim(),
          email: email?.trim() || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating client:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create client: " + insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const questionRows = Array.isArray(questions)
        ? questions
            .map((question, index) => ({
              id: crypto.randomUUID(),
              client_id: newClient.id,
              workspace_id: workspaceId,
              question_order: Number.isFinite(Number(question.question_order))
                ? Number(question.question_order)
                : index,
              question_text: String(question.question_text || "").trim(),
              question_type: String(question.question_type || "text").trim() || "text",
              is_required: true,
              placeholder: String(question.placeholder || "").trim() || null,
              options_json: Array.isArray(question.options_json)
                ? question.options_json.map((v) => String(v || "").trim()).filter(Boolean)
                : null,
            }))
            .filter((question) => question.question_text.length > 0)
        : [];

      if (questionRows.length > 0) {
        let { error: questionInsertError } = await supabase
          .from("client_onboarding_questions")
          .insert(questionRows);

        // Compatibility fallback for older schemas that do not have options_json yet.
        if (questionInsertError && /options_json/i.test(String(questionInsertError.message || ""))) {
          const rowsWithoutOptions = questionRows.map((row) => ({
            id: row.id,
            client_id: row.client_id,
            workspace_id: row.workspace_id,
            question_order: row.question_order,
            question_text: row.question_text,
            question_type: row.question_type,
            is_required: row.is_required,
            placeholder: row.placeholder,
          }));
          const retry = await supabase
            .from("client_onboarding_questions")
            .insert(rowsWithoutOptions as any);
          questionInsertError = retry.error;
        }

        if (questionInsertError) {
          console.error("Error creating onboarding questions:", questionInsertError);
          // Cleanup client if onboarding questions fail
          await supabase
            .from("clients")
            .delete()
            .eq("id", newClient.id)
            .eq("workspace_id", workspaceId);

          return new Response(
            JSON.stringify({ error: "Failed to create onboarding questions: " + questionInsertError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      console.log("Client created successfully:", newClient.id);

      return new Response(
        JSON.stringify({ success: true, client: newClient }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: "clientId is required for delete" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete client and all related data
      // First delete related records
      await supabase.from("client_tasks").delete().eq("client_id", clientId);
      await supabase.from("client_files").delete().eq("client_id", clientId);
      await supabase.from("client_onboarding_questions").delete().eq("client_id", clientId);
      await supabase.from("client_onboarding_responses").delete().eq("client_id", clientId);
      await supabase.from("portal_roles").delete().eq("client_id", clientId);

      // Delete client
      const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId)
        .eq("workspace_id", workspaceId);

      if (deleteError) {
        console.error("Error deleting client:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete client: " + deleteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Client deleted successfully:", clientId);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "invite") {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: "clientId is required for invite" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!normalizedEmail) {
        return new Response(
          JSON.stringify({ error: "email is required for invite" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existingClient, error: clientLookupError } = await supabase
        .from("clients")
        .select("id,name,email")
        .eq("id", clientId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (clientLookupError || !existingClient) {
        return new Response(
          JSON.stringify({ error: "Client not found in workspace" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Keep client record in sync with invite email.
      const currentEmail = String(existingClient.email || "").trim().toLowerCase();
      if (currentEmail !== normalizedEmail) {
        await supabase
          .from("clients")
          .update({ email: normalizedEmail })
          .eq("id", clientId)
          .eq("workspace_id", workspaceId);
      }

      const inviteToken = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
      let { error: inviteInsertError } = await supabase
        .from("invites")
        .insert({
          workspace_id: workspaceId,
          client_id: clientId,
          invite_type: "client",
          email: normalizedEmail,
          role: "setter",
          token: inviteToken,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      // Compatibility fallback for environments where invite_type/client_id columns are not migrated yet.
      if (inviteInsertError && /(invite_type|client_id)/i.test(String(inviteInsertError.message || ""))) {
        const retry = await supabase
          .from("invites")
          .insert({
            workspace_id: workspaceId,
            email: normalizedEmail,
            role: "setter",
            token: inviteToken,
            invited_by: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        inviteInsertError = retry.error;
      }

      if (inviteInsertError) {
        console.error("Error creating invite:", inviteInsertError);
        return new Response(
          JSON.stringify({ error: "Failed to create invite: " + inviteInsertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          inviteToken,
          workspaceName: workspace.name,
          clientName: existingClient.name,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in manage-client:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
