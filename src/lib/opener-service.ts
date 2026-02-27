import { CSVRow } from '@/types';
import { OpenerStyle } from '@/components/OpenerToggle';
import { supabase } from '@/integrations/supabase/client';

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

interface OpenerResult {
  rowId: string;
  opener: string;
  error?: string;
}

// Preset prompt templates for each style
const STYLE_TEMPLATES: Record<Exclude<OpenerStyle, 'custom' | 'randomize'>, string> = {
  'pain-driven': `Generate a DM opener using this exact template, replacing {{NAME}} with a simple, common first name (like Jake, Paul, Sarah, Emma - never business names or usernames):

"Hi {{NAME}}, not sure if you've been dealing with this but I've been speaking with other coaches and the biggest issue they're facing is getting consistent appointments on their calendar every day. If this is something you're going through I'd love to just give you some value and showcase a video on how this works."

Profile context (use to infer an appropriate first name):
Name: {{fullName}}
Username: {{username}}

Rules: Use the exact template above, only replace {{NAME}} with a realistic first name. If you cannot determine a first name, use a common name like "Jake" or "Sarah".`,

  'curiosity-driven': `Generate this exact DM opener:

"What's up I've been seeing you on my feed for the past few days now and im really intrigued in what you do, can I talk to you for a second?"

Rules: Return exactly this message, no changes.`,

  'ai-generated': `Write a simple, friendly one-sentence DM opener. Keep it generic and safe - do not reference specific details from the profile to avoid mistakes.

Rules: one sentence, max 18 words, no emojis, no exclamation marks, be friendly but vague.`,
};

const RANDOMIZABLE_STYLES: (keyof typeof STYLE_TEMPLATES)[] = ['pain-driven', 'curiosity-driven', 'ai-generated'];

// Map CSV row to lead object, handling various column name formats
function mapRowToLead(row: CSVRow, headers: string[], index: number): Lead {
  const findHeader = (names: string[]): string | undefined => {
    for (const name of names) {
      const header = headers.find((h) => h.toLowerCase() === name.toLowerCase());
      if (header && row[header]) return row[header];
    }
    return undefined;
  };

  return {
    rowId: index.toString(),
    username: findHeader(['username', 'user', 'handle']),
    fullName: findHeader(['fullname', 'full_name', 'name', 'displayname']),
    bio: findHeader(['bio', 'biography', 'description']),
    category: findHeader(['category', 'businesscategory', 'business_category', 'type']),
    website: findHeader(['website', 'url', 'site', 'externalurl']),
    followers: findHeader(['followers', 'follower_count', 'followers_count']),
    following: findHeader(['following', 'following_count']),
    posts: findHeader(['posts', 'post_count', 'media_count']),
    location: findHeader(['location', 'city', 'country']),
    email: findHeader(['email', 'public_email', 'contact_email']),
    phone: findHeader(['phone', 'public_phone', 'contact_phone']),
  };
}

export function getPromptTemplate(style: OpenerStyle, customScript?: string): string {
  if (style === 'custom') {
    return customScript || '';
  }
  if (style === 'randomize') {
    const randomStyle = RANDOMIZABLE_STYLES[Math.floor(Math.random() * RANDOMIZABLE_STYLES.length)];
    return STYLE_TEMPLATES[randomStyle];
  }
  return STYLE_TEMPLATES[style];
}

export async function generateOpeners(
  rows: CSVRow[],
  headers: string[],
  style: OpenerStyle,
  customScript: string,
  onProgress?: (current: number, total: number) => void
): Promise<Map<number, { opener: string; error?: string }>> {
  const results = new Map<number, { opener: string; error?: string }>();
  
  if (rows.length === 0) return results;

  const leads = rows.map((row, index) => mapRowToLead(row, headers, index));

  // Process in batches to show progress
  const BATCH_SIZE = 50;
  const batches: Lead[][] = [];
  
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    batches.push(leads.slice(i, i + BATCH_SIZE));
  }

  let processed = 0;

  for (const batch of batches) {
    // For randomize, each lead gets a random style
    const promptTemplate = style === 'randomize' 
      ? getPromptTemplate('randomize') 
      : getPromptTemplate(style, customScript);

    try {
      // Get the current user's access token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No authenticated session for opener generation');
        batch.forEach((lead) => {
          results.set(parseInt(lead.rowId), { opener: '', error: 'Authentication required' });
        });
        processed += batch.length;
        onProgress?.(processed, leads.length);
        continue;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-openers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            promptTemplate,
            leads: batch,
            style: style,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Opener generation failed:', errorText);
        
        // Mark all in batch as failed
        batch.forEach((lead) => {
          results.set(parseInt(lead.rowId), { opener: '', error: 'Generation failed' });
        });
      } else {
        const data = await response.json();
        
        if (data.results) {
          data.results.forEach((result: OpenerResult) => {
            results.set(parseInt(result.rowId), {
              opener: result.opener,
              error: result.error,
            });
          });
        }
      }
    } catch (error) {
      console.error('Error calling opener service:', error);
      batch.forEach((lead) => {
        results.set(parseInt(lead.rowId), { opener: '', error: 'Network error' });
      });
    }

    processed += batch.length;
    onProgress?.(processed, leads.length);
  }

  return results;
}

export async function testOpenerGeneration(
  row: CSVRow,
  headers: string[],
  style: OpenerStyle,
  customScript: string
): Promise<{ opener: string; error?: string }> {
  const lead = mapRowToLead(row, headers, 0);
  const promptTemplate = getPromptTemplate(style, customScript);

  try {
    // Get the current user's access token for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { opener: '', error: 'Authentication required' };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-openers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          promptTemplate,
          leads: [lead],
          style,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test opener generation failed:', errorText);
      return { opener: '', error: 'Generation failed' };
    }

    const data = await response.json();
    return data.results?.[0] || { opener: '', error: 'No result' };
  } catch (error) {
    console.error('Test opener generation error:', error);
    return { opener: '', error: 'Generation failed' };
  }
}
