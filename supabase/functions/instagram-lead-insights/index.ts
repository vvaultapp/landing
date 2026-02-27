import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-3-5-sonnet-20240620';
const KNOWLEDGE_BUCKET = Deno.env.get('AI_KNOWLEDGE_BUCKET') || 'uploads';
const KNOWLEDGE_PATH = Deno.env.get('AI_KNOWLEDGE_PATH') || 'ai/knowledge.txt';
const KNOWLEDGE_MAX_CHARS = Number(Deno.env.get('AI_KNOWLEDGE_MAX_CHARS') || 12000);

const loadKnowledge = async (): Promise<string> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey) {
    console.warn('Knowledge load skipped: missing Supabase URL or key');
    return '';
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await admin.storage.from(KNOWLEDGE_BUCKET).download(KNOWLEDGE_PATH);
    if (error || !data) {
      console.warn('Knowledge load failed:', error?.message || 'No data');
      return '';
    }
    const text = await data.text();
    const trimmed = text.slice(0, KNOWLEDGE_MAX_CHARS);
    console.log(`Knowledge loaded (${trimmed.length} chars) from ${KNOWLEDGE_BUCKET}/${KNOWLEDGE_PATH}`);
    return trimmed;
  } catch (err) {
    console.warn('Knowledge load exception:', err);
    return '';
  }
};

const normalizeStage = (value: string | undefined, allowed: string[], fallback: string) => {
  if (!value) return fallback;
  const lower = value.toLowerCase().trim();
  return allowed.includes(lower) ? lower : fallback;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { workspaceId, instagramUserId, messages } = await req.json();

    if (!workspaceId || !instagramUserId) {
      return new Response(JSON.stringify({ error: 'Missing workspaceId or instagramUserId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messageList: any[] = Array.isArray(messages) ? messages : [];
    const recentMessages = messageList.slice(-30);
    const MAX_MESSAGE_CHARS = 600;

    const formatted = recentMessages.map((msg) => {
      const rawText = msg.text || msg.message_text || msg.message || '';
      const text = String(rawText).replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE_CHARS);
      const direction = msg.direction || (msg.sender_id && msg.instagram_account_id && msg.sender_id === msg.instagram_account_id ? 'outbound' : 'inbound');
      const timestamp = msg.message_timestamp || msg.created_at || msg.timestamp || '';
      const label = direction === 'outbound' ? 'Setter' : 'Lead';
      return `[${label}${timestamp ? ` @ ${timestamp}` : ''}] ${text || '(no text)'}`;
    }).join('\n');

    const knowledge = await loadKnowledge();

    const systemPrompt = `You are an appointment setter assistant. Analyze Instagram DMs and help move the lead toward booking.

Return ONLY valid JSON with this schema:
{
  "lead_stage": "cold" | "warm" | "hot",
  "funnel_stage": "new" | "engaged" | "qualified" | "booked",
  "summary": "1-2 sentences",
  "recommended_next_message": "short DM reply",
  "follow_up_message": "short DM follow-up",
  "confidence": 0-100
}

Rules:
- Use the provided context in knowledge.txt.
- Keep messages concise and natural.
- No emojis.
- Do not invent facts not present in the conversation.`;

    const userPrompt = `Context:
${knowledge || 'No additional context provided.'}

Conversation:
${formatted || 'No messages available.'}
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.content?.[0]?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(JSON.stringify({ error: 'Invalid AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const leadStage = normalizeStage(parsed.lead_stage, ['cold', 'warm', 'hot'], 'cold');
    const funnelStage = normalizeStage(parsed.funnel_stage, ['new', 'engaged', 'qualified', 'booked'], 'new');

    const latestTimestamp = recentMessages
      .map((m) => m.message_timestamp || m.created_at || m.timestamp)
      .filter(Boolean)
      .sort()
      .pop() || null;

    const insightRecord = {
      workspace_id: workspaceId,
      instagram_user_id: instagramUserId,
      lead_stage: leadStage,
      funnel_stage: funnelStage,
      summary: parsed.summary || null,
      recommended_next_message: parsed.recommended_next_message || null,
      follow_up_message: parsed.follow_up_message || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
      last_message_at: latestTimestamp,
    };

    const { error: upsertError } = await supabase
      .from('instagram_lead_insights')
      .upsert(insightRecord, { onConflict: 'workspace_id,instagram_user_id' });

    if (upsertError) {
      console.error('Failed to upsert lead insight:', upsertError);
    }

    return new Response(JSON.stringify({ insight: insightRecord }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Instagram lead insights error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
