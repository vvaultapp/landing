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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, title, description, tags } = await req.json();

    if (!type || !['title', 'description', 'tags'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid optimization type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Optimizing ${type} for video: "${title}"`);

    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const knowledge = await loadKnowledge();
    const systemPrompt = type === 'title' 
      ? `You are a YouTube title optimization expert. Generate 3 click-worthy, SEO-optimized video titles based on the current title and description. Each title should be under 70 characters. Focus on curiosity, value, and searchability. Return ONLY a JSON object with format: {"titles": ["title1", "title2", "title3"]}.`
      : type === 'description'
      ? `You are a YouTube description optimization expert. Write an optimized video description based on the current title and description. Include relevant keywords naturally. Structure it with a hook in the first 2 lines, then key points, then a call-to-action. Keep it under 500 characters. Return ONLY a JSON object with format: {"description": "optimized description here"}.`
      : `You are a YouTube tags optimization expert. Generate 10-15 relevant, high-performing tags for this video. Include a mix of broad and specific keywords. Return ONLY a JSON object with format: {"tags": [{"tag": "tag name", "score": 65}]} where score is 1-100 representing potential performance based on search volume and competition.`;

    const userPrompt = `Context:\n${knowledge || 'No additional context provided.'}\n\nTitle: ${title || 'No title'}\nDescription: ${description || 'No description'}\nCurrent tags: ${(tags || []).join(', ')}`;

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
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'AI service error',
        status: response.status,
        details: errorText.slice(0, 500),
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`${type} optimization complete:`, parsed);

    return new Response(JSON.stringify({ 
      success: true,
      type,
      result: parsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Optimize video error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
