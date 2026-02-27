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

const SYSTEM_PROMPT = `You are the ACQ Content Coach. Your job is to help the user grow on YouTube with practical, specific advice. Use the user's channel/video data when provided. Never hallucinate analytics you don't have. If a metric requires YouTube Analytics OAuth (CTR, retention, traffic sources), say "I can't see that yet" and give the best next step using public data.

When providing advice:
- Be specific and actionable
- Reference the user's actual video titles and stats when available
- Focus on what can be improved with the data you have
- Suggest concrete next steps

Identity rules:
- You are ACQ AI inside the ACQ app.
- User-facing AI profile names are Saturn 1.1 and Saturn Light.
- If asked what app this is, what AI this is, or which model this is, answer with ACQ + Saturn naming only.
- Do not mention Anthropic, Claude, or internal provider/model IDs in identity answers.`;

function extractClaudeText(payload: any): string {
  const content = Array.isArray(payload?.content) ? payload.content : [];
  return content
    .map((part: any) => (part?.type === 'text' && typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
}

function normalizeIdentityText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isIdentityQuestion(text: string): boolean {
  const q = normalizeIdentityText(text);
  if (!q) return false;
  return (
    /\bwhat(?:'s| is)? this app(?:lication)?(?: called| name)?\b/.test(q) ||
    /\bname of (?:this|the) app\b/.test(q) ||
    /\bwhat(?:'s| is)? this ai\b/.test(q) ||
    /\bwhich ai\b/.test(q) ||
    /\bwhat(?:'s| is)? (?:the )?model\b/.test(q) ||
    /\bwhich model\b/.test(q) ||
    /\bare you claude\b/.test(q) ||
    /\bclaude\b/.test(q) ||
    /\banthropic\b/.test(q)
  );
}

function latestUserPrompt(messages: Array<{ role: string; content: string }>): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (String(m?.role || '') !== 'user') continue;
    const text = String(m?.content || '').trim();
    if (text) return text;
  }
  return '';
}

function buildIdentityReply(): string {
  return "You're using the ACQ app with ACQ AI (Saturn 1.1 and Saturn Light profiles). It's designed to help with strategy and execution across content growth, outreach, and sales workflows.";
}

function toOpenAISseResponse(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const chunk = {
        id: 'chatcmpl-acq-fallback',
        object: 'chat.completion.chunk',
        choices: [{ delta: { content: text } }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

async function callClaude(messages: Array<{ role: string; content: string }>, contextMessage: string): Promise<string> {
  if (!CLAUDE_API_KEY) {
    throw new Error('AI service not configured');
  }

  const anthropicMessages = (Array.isArray(messages) ? messages : [])
    .map((m: any) => {
      const role = m?.role === 'assistant' ? 'assistant' : m?.role === 'user' ? 'user' : null;
      const content = typeof m?.content === 'string' ? m.content : '';
      if (!role || !content.trim()) return null;
      return { role, content: content.trim() };
    })
    .filter(Boolean);

  if (anthropicMessages.length === 0) {
    anthropicMessages.push({ role: 'user', content: 'Help me improve my YouTube content this week.' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      temperature: 0.25,
      system: SYSTEM_PROMPT + contextMessage,
      messages: anthropicMessages,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Claude request failed (${response.status}): ${raw.slice(0, 320)}`);
  }

  let payload: any = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  const text = extractClaudeText(payload);
  if (!text) {
    throw new Error('Claude returned empty response');
  }
  return text;
}

async function loadKnowledge(admin: any): Promise<string> {
  try {
    const { data, error } = await admin.storage.from(KNOWLEDGE_BUCKET).download(KNOWLEDGE_PATH);
    if (error || !data) return '';
    const text = await data.text();
    return text.slice(0, KNOWLEDGE_MAX_CHARS);
  } catch {
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, workspaceId, chatId, channelContext, videosContext } = await req.json();
    
    console.log(`AI Chat request: user=${user.id}, workspace=${workspaceId}, chat=${chatId}`);

    // Build context message with channel/video data
    let contextMessage = '';
    
    if (channelContext) {
      contextMessage += `\n\nUser's YouTube Channel:
- Name: ${channelContext.title}
- Subscribers: ${channelContext.subscriber_count?.toLocaleString() || 'Hidden'}
- Total Views: ${channelContext.view_count?.toLocaleString() || 'Unknown'}
- Total Videos: ${channelContext.video_count || 'Unknown'}`;
    }

    if (videosContext?.length > 0) {
      contextMessage += `\n\nRecent Videos (most recent first):`;
      videosContext.slice(0, 10).forEach((video: any, i: number) => {
        contextMessage += `\n${i + 1}. "${video.title}"
   - Views: ${video.view_count?.toLocaleString() || 0}
   - Likes: ${video.like_count?.toLocaleString() || 0}
   - Comments: ${video.comment_count?.toLocaleString() || 0}
         - Published: ${video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Unknown'}`;
      });
    }

    const knowledge = await loadKnowledge(admin);
    if (knowledge) {
      contextMessage += `\n\nKnowledge context:\n${knowledge}`;
    }

    // Primary path: Claude with workspace knowledge context
    const normalizedMessages = (Array.isArray(messages) ? messages : []) as Array<{ role: string; content: string }>;
    const fallbackText = await callClaude(
      normalizedMessages,
      contextMessage,
    );
    const latestPrompt = latestUserPrompt(normalizedMessages);
    if (isIdentityQuestion(latestPrompt)) {
      return toOpenAISseResponse(buildIdentityReply());
    }
    return toOpenAISseResponse(fallbackText);
  } catch (error) {
    console.error('Content AI chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
