import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runWorkspaceAutoPhase } from '../_shared/auto-phase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-auto-phase-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get('AUTO_PHASE_CRON_SECRET') || '';
    const provided = req.headers.get('X-AUTO-PHASE-SECRET') || req.headers.get('x-auto-phase-secret') || '';

    if (!secret || provided !== secret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: rows, error } = await admin
      .from('instagram_phase_automation_settings')
      .select('workspace_id,enabled,backfill_state')
      .eq('enabled', true)
      .order('updated_at', { ascending: true })
      .limit(1000);

    if (error) {
      throw new Error(error.message || 'Failed to load auto-phase workspaces');
    }

    const workspaces = (Array.isArray(rows) ? rows : [])
      .map((r: any) => ({
        workspaceId: r?.workspace_id ? String(r.workspace_id) : '',
        backfillState: r?.backfill_state ? String(r.backfill_state) : 'pending',
      }))
      .filter((x) => x.workspaceId);

    const summaries: any[] = [];

    for (const ws of workspaces) {
      try {
        const source = ws.backfillState === 'completed' ? 'catchup' : 'backfill';
        const summary = await runWorkspaceAutoPhase(admin, {
          workspaceId: ws.workspaceId,
          source,
          actorUserId: null,
          actorRole: 'owner',
        });
        summaries.push(summary);
      } catch (runError: any) {
        const message = String(runError?.message || runError || 'auto-phase cron run failed');
        summaries.push({
          workspaceId: ws.workspaceId,
          source: ws.backfillState === 'completed' ? 'catchup' : 'backfill',
          error: message,
        });

        await admin
          .from('instagram_phase_automation_settings')
          .update({
            last_error: message.slice(0, 1200),
            last_catchup_run_at: new Date().toISOString(),
          })
          .eq('workspace_id', ws.workspaceId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedWorkspaces: workspaces.length,
        summaries,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    console.error('auto-phase-cron error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
