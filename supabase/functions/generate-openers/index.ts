import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") || "claude-3-5-sonnet-20240620";
const KNOWLEDGE_BUCKET = Deno.env.get("AI_KNOWLEDGE_BUCKET") || "uploads";
const KNOWLEDGE_PATH = Deno.env.get("AI_KNOWLEDGE_PATH") || "ai/knowledge.txt";
const KNOWLEDGE_MAX_CHARS = Number(Deno.env.get("AI_KNOWLEDGE_MAX_CHARS") || 12000);

// Validation constants
const MAX_PROMPT_LENGTH = 2000;
const MAX_LEADS_PER_REQUEST = 100;
const MAX_FIELD_LENGTH = 500;

interface Lead {
  rowId: string;
  username?: string;
  fullName?: string;
  bio?: string;
  category?: string;
  website?: string;
  followers?: string;
  following?: string;
  posts?: string;
  location?: string;
  email?: string;
  phone?: string;
}

interface RequestBody {
  promptTemplate: string;
  leads: Lead[];
  style: string;
}

// Fixed templates as per user requirements
const PAIN_DRIVEN_TEMPLATE = `Hi {{NAME}}, not sure if you've been dealing with this but I've been speaking with other coaches and the biggest issue they're facing is getting consistent appointments on their calendar every day. If this is something you're going through I'd love to just give you some value and showcase a video on how this works.`;

const CURIOSITY_DRIVEN_TEMPLATE = `What's up I've been seeing you on my feed for the past few days now and im really intrigued in what you do, can I talk to you for a second?`;

const AI_GENERATED_SYSTEM_PROMPT = `You are an Instagram DM writer. Write a simple, friendly one-sentence DM opener based on the profile information provided.

STRICT RULES:
- One sentence only, max 18 words
- NO emojis
- NO exclamation marks
- NO hashtags
- Be friendly but vague - do not reference specific details to avoid mistakes
- Do not invent facts about the lead
- Return plain text only - no JSON, no prefixes, no explanations`;

// Sanitize a string field to prevent injection and limit length
function sanitizeField(value: string | undefined, maxLength: number = MAX_FIELD_LENGTH): string {
  if (!value) return "";
  return value
    .substring(0, maxLength)
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim();
}

// Sanitize a lead object
function sanitizeLead(lead: Lead): Lead {
  return {
    rowId: sanitizeField(lead.rowId, 100),
    username: sanitizeField(lead.username),
    fullName: sanitizeField(lead.fullName),
    bio: sanitizeField(lead.bio),
    category: sanitizeField(lead.category),
    website: sanitizeField(lead.website, 200),
    followers: sanitizeField(lead.followers, 50),
    following: sanitizeField(lead.following, 50),
    posts: sanitizeField(lead.posts, 50),
    location: sanitizeField(lead.location),
    email: sanitizeField(lead.email, 254),
    phone: sanitizeField(lead.phone, 50),
  };
}

// Infer a simple first name from the profile
function inferFirstName(lead: Lead): string {
  // Common fallback names
  const fallbackNames = ["Jake", "Sarah", "Mike", "Emma", "Alex", "Chris", "Sam", "Jordan"];
  
  const fullName = lead.fullName?.trim();
  if (fullName) {
    // Split by space and get first part
    const parts = fullName.split(/\s+/);
    const firstName = parts[0];
    
    // Check if it looks like a real first name (not a business name)
    // Should be 2-15 chars, start with capital, rest lowercase, only letters
    if (firstName && /^[A-Z][a-z]{1,14}$/.test(firstName)) {
      return firstName;
    }
    
    // Try to extract a name-like word from the full name
    for (const part of parts) {
      if (/^[A-Z][a-z]{1,14}$/.test(part)) {
        return part;
      }
    }
  }
  
  // Return a random fallback name
  return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
}

// Simple hash for caching
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function extractClaudeText(payload: any): string {
  const content = Array.isArray(payload?.content) ? payload.content : [];
  const out: string[] = [];
  for (const item of content) {
    if (item?.type === "text" && typeof item?.text === "string") out.push(item.text);
  }
  return out.join("\n").trim();
}

async function callClaudeText(system: string, userPrompt: string, maxTokens = 180): Promise<string> {
  if (!CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature: 0.45,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Claude request failed (${response.status}): ${raw.slice(0, 320)}`);
  }

  const payload = raw ? JSON.parse(raw) : null;
  return extractClaudeText(payload);
}

async function loadKnowledge(admin: any): Promise<string> {
  try {
    const { data, error } = await admin.storage.from(KNOWLEDGE_BUCKET).download(KNOWLEDGE_PATH);
    if (error || !data) return "";
    const text = await data.text();
    return text.slice(0, KNOWLEDGE_MAX_CHARS);
  } catch {
    return "";
  }
}

async function generateAIOpener(
  lead: Lead,
  knowledge: string
): Promise<{ opener: string; error?: string }> {
  const userPrompt = `Profile info:
Name: ${lead.fullName || "Unknown"}
Username: ${lead.username || "Unknown"}
Bio: ${lead.bio || "No bio"}
Category: ${lead.category || "Unknown"}

Write a friendly DM opener for this person.`;

  try {
    const opener = await callClaudeText(
      `${AI_GENERATED_SYSTEM_PROMPT}\n\nKnowledge context:\n${knowledge || "(none)"}`,
      userPrompt,
      120,
    );
    
    // Clean up any potential issues
    const cleanOpener = (opener || "")
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/!+/g, ".") // Replace exclamation marks with periods
      .trim();

    return { opener: cleanOpener };
  } catch (error) {
    console.error("Error generating opener:", error);
    return { opener: "", error: "Generation failed" };
  }
}

function generatePainDrivenOpener(lead: Lead): string {
  const name = inferFirstName(lead);
  return PAIN_DRIVEN_TEMPLATE.replace("{{NAME}}", name);
}

function generateCuriosityDrivenOpener(): string {
  return CURIOSITY_DRIVEN_TEMPLATE;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT token using getClaims
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token using getUser
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("JWT validation failed:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!CLAUDE_API_KEY) {
      console.error("CLAUDE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const knowledge = await loadKnowledge(admin);

    // Parse and validate request body
    const body = await req.json() as RequestBody;
    const { promptTemplate, leads, style } = body;

    // Validate leads
    if (!leads || !Array.isArray(leads)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: leads array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (leads.length > MAX_LEADS_PER_REQUEST) {
      return new Response(
        JSON.stringify({ error: `Too many leads (max ${MAX_LEADS_PER_REQUEST} per request)` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (leads.length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize all leads
    const sanitizedLeads = leads.map(sanitizeLead);

    // Cache to avoid regenerating duplicates
    const cache = new Map<string, string>();
    const results: { rowId: string; opener: string; error?: string }[] = [];
    
    // Process in batches of 5 for concurrency control (only for AI-generated)
    const BATCH_SIZE = 5;
    
    for (let i = 0; i < sanitizedLeads.length; i += BATCH_SIZE) {
      const batch = sanitizedLeads.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(
        batch.map(async (lead) => {
          // Determine which style to use for this lead
          let currentStyle = style;
          if (style === "randomize") {
            const styles = ["pain-driven", "curiosity-driven", "ai-generated"];
            currentStyle = styles[Math.floor(Math.random() * styles.length)];
          }
          
          // For non-AI styles, generate directly without API call
          if (currentStyle === "pain-driven") {
            const opener = generatePainDrivenOpener(lead);
            return { rowId: lead.rowId, opener };
          }
          
          if (currentStyle === "curiosity-driven") {
            const opener = generateCuriosityDrivenOpener();
            return { rowId: lead.rowId, opener };
          }
          
          // AI-generated or custom: use caching
          const cacheKey = `${lead.username || ""}_${hashString(style)}_${hashString(lead.bio || "")}`;
          
          if (cache.has(cacheKey)) {
            return { rowId: lead.rowId, opener: cache.get(cacheKey)! };
          }

          // For custom scripts, use the provided template
          if (currentStyle === "custom" && promptTemplate) {
            const result = await generateCustomOpener(promptTemplate, lead, knowledge);
            if (result.opener && !result.error) {
              cache.set(cacheKey, result.opener);
            }
            return { rowId: lead.rowId, opener: result.opener, error: result.error };
          }

          // AI-generated
          const result = await generateAIOpener(lead, knowledge);
          
          if (result.opener && !result.error) {
            cache.set(cacheKey, result.opener);
          }
          
          // Retry once on failure
          if (result.error) {
            const retry = await generateAIOpener(lead, knowledge);
            if (retry.opener && !retry.error) {
              cache.set(cacheKey, retry.opener);
              return { rowId: lead.rowId, opener: retry.opener };
            }
            return { rowId: lead.rowId, opener: "", error: "Generation failed" };
          }
          
          return { rowId: lead.rowId, opener: result.opener };
        })
      );
      
      results.push(...batchResults);
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-openers error:", error);
    return new Response(
      JSON.stringify({ error: "Service error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generateCustomOpener(
  promptTemplate: string,
  lead: Lead,
  knowledge: string
): Promise<{ opener: string; error?: string }> {
  // Fill in template variables
  const filledPrompt = promptTemplate
    .replace(/\{\{username\}\}/gi, lead.username || "")
    .replace(/\{\{fullName\}\}/gi, lead.fullName || "")
    .replace(/\{\{bio\}\}/gi, lead.bio || "")
    .replace(/\{\{category\}\}/gi, lead.category || "")
    .replace(/\{\{NAME\}\}/gi, inferFirstName(lead));

  try {
    const opener = await callClaudeText(
      `You are a DM writer. Follow the user's template exactly. Return plain text only.\n\nKnowledge context:\n${knowledge || "(none)"}`,
      filledPrompt,
      220,
    );
    
    return { opener: (opener || "").replace(/^["']|["']$/g, "").trim() };
  } catch (error) {
    console.error("Error generating custom opener:", error);
    return { opener: "", error: "Generation failed" };
  }
}
