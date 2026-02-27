import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCORING_PROMPT = `You are a YouTube title optimization expert. Analyze the provided video title and generate a comprehensive score and suggestions.

Rules:
- Do not mention "VidIQ" or any competitor tools
- Focus on clarity, curiosity, and promise
- Use hooks relevant to the user's niche inferred from channel/video context
- Be specific and actionable

Return ONLY valid JSON with this shape:
{
  "score": 0-100,
  "why": ["reason1","reason2","reason3"],
  "fixes": ["fix1","fix2","fix3"],
  "new_titles": {
    "safe": ["..."],
    "curiosity": ["..."],
    "authority": ["..."],
    "short": ["..."]
  }
}`;

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

    const { videoId, workspaceId, title, description, tags, channelContext } = await req.json();
    
    console.log(`Score video request: videoId=${videoId}, workspace=${workspaceId}`);

    // Check for existing optimization
    const { data: existingOpt } = await supabase
      .from('video_optimizations')
      .select('*')
      .eq('video_id', videoId)
      .eq('workspace_id', workspaceId)
      .single();

    if (existingOpt && existingOpt.score !== null) {
      console.log('Returning cached optimization');
      return new Response(JSON.stringify({ 
        cached: true,
        optimization: existingOpt 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build context for AI
    let contextInfo = '';
    if (channelContext) {
      contextInfo = `Channel: "${channelContext.title}" with ${channelContext.subscriber_count?.toLocaleString() || 'unknown'} subscribers in the ${channelContext.description?.slice(0, 200) || 'general'} niche.`;
    }

    const knowledge = await loadKnowledge();
    const userPrompt = `Context:
${knowledge || 'No additional context provided.'}

Analyze this YouTube video and provide scoring/suggestions:

Title: "${title}"
Description: ${description?.slice(0, 500) || 'No description'}
Tags: ${Array.isArray(tags) ? tags.join(', ') : 'No tags'}
${contextInfo}

Score the title 0-100 and provide:
1. 3 reasons why it scores this way
2. 3 specific fixes to improve it
3. Alternative titles in 4 categories:
   - safe: Broad appeal, clear value proposition (3-5 titles)
   - curiosity: Creates intrigue, open loops (3-5 titles)  
   - authority: Shows expertise, social proof (3-5 titles)
   - short: Under 45 characters (3-5 titles)`;

    // Call AI with tool for structured output
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: SCORING_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
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

    const aiResult = await response.json();
    const content = aiResult.content?.[0]?.text || '';
    console.log('AI result:', content);

    let scoreData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scoreData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    if (!scoreData) {
      return new Response(JSON.stringify({ error: 'No scoring data received' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save optimization to DB
    const optimizationData = {
      workspace_id: workspaceId,
      video_id: videoId,
      score: scoreData.score,
      why_json: scoreData.why,
      fixes_json: scoreData.fixes,
      titles_json: scoreData.new_titles,
    };

    let optimization;
    if (existingOpt) {
      const { data, error } = await supabase
        .from('video_optimizations')
        .update(optimizationData)
        .eq('id', existingOpt.id)
        .select()
        .single();
      
      if (error) throw error;
      optimization = data;
    } else {
      const { data, error } = await supabase
        .from('video_optimizations')
        .insert(optimizationData)
        .select()
        .single();
      
      if (error) throw error;
      optimization = data;
    }

    console.log(`Saved optimization for video ${videoId}: score=${scoreData.score}`);

    return new Response(JSON.stringify({ 
      cached: false,
      optimization 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Score video error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
