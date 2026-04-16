// Supabase Edge Function: parse-vibe
// Model: claude-haiku-4-5-20251001 — fast structured extraction of style parameters
//
// Invoke via: supabase.functions.invoke('parse-vibe', { body: { description, projectId } })

import Anthropic from 'npm:@anthropic-ai/sdk'
import { checkRateLimit, getUserKey } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ErrorResponse {
  error: string
  code: string
}

/* ------------------------------------------------------------------ */
/*  Rate limiter — see ../_shared/rate-limit.ts (durable, Postgres-backed) */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_FUNCTION = 'parse-vibe'
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_SECONDS = 60

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function errorResponse(error: string, code: string, status: number): Response {
  const body: ErrorResponse = { error, code }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: { description: string; projectId?: string } = await req.json()
    const { description } = body

    // ── Input validation ──
    if (!description?.trim()) {
      return errorResponse('description is required', 'INVALID_INPUT', 400)
    }

    if (description.length > 500) {
      return errorResponse(
        'description must be 500 characters or fewer',
        'INPUT_TOO_LONG',
        400,
      )
    }

    // ── Rate limiting (durable, Postgres-backed) ──
    const userId = getUserKey(req)
    const allowed = await checkRateLimit(userId, RATE_LIMIT_FUNCTION, RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_MAX)
    if (!allowed) {
      return errorResponse(
        `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX} requests per minute.`,
        'RATE_LIMIT_EXCEEDED',
        429,
      )
    }

    // ── API key check ──
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return errorResponse('ANTHROPIC_API_KEY not configured', 'API_KEY_MISSING', 500)
    }

    const client = new Anthropic({ apiKey })

    const systemPrompt = `You are a photography style AI assistant that extracts structured style parameters from natural language descriptions.

RULES:
- Extract the most relevant style parameters from the description
- If the description is vague, short, or unclear, make your best inference and set confidence lower
- If the description is nonsensical or not related to photography, return a neutral "Custom Style" preset with low confidence
- Always return valid JSON matching the exact schema below
- The confidence field (0.0 to 1.0) indicates how well you understood the intent

SCHEMA:
{
  "presetName": "string — short evocative name for the style (2-4 words)",
  "confidence": 0.0-1.0,
  "styleParams": {
    "mood": "dramatic" | "joyful" | "editorial" | "natural" | "romantic" | "moody",
    "lighting": "low-key" | "high-key" | "natural" | "golden-hour" | "studio",
    "composition": "tight" | "wide" | "balanced" | "documentary",
    "colorTemp": "warm" | "cool" | "neutral",
    "subjects": ["array", "of", "focus", "subjects"],
    "avoidPatterns": ["array", "of", "patterns", "to", "avoid"]
  }
}

EXAMPLES:

Input: "moody dark editorial with deep shadows and tight crops on faces"
Output: {"presetName":"Dark Editorial","confidence":0.95,"styleParams":{"mood":"dramatic","lighting":"low-key","composition":"tight","colorTemp":"cool","subjects":["faces","emotion","detail"],"avoidPatterns":["overexposed","flat lighting","wide shots"]}}

Input: "bright airy wedding vibes"
Output: {"presetName":"Bright & Airy","confidence":0.85,"styleParams":{"mood":"joyful","lighting":"high-key","composition":"wide","colorTemp":"warm","subjects":["couples","ceremony","details"],"avoidPatterns":["harsh shadows","underexposed","dark corners"]}}

Input: "golden hour portraits with warm tones"
Output: {"presetName":"Golden Hour","confidence":0.9,"styleParams":{"mood":"romantic","lighting":"golden-hour","composition":"balanced","colorTemp":"warm","subjects":["faces","portraits","couples"],"avoidPatterns":["cool tones","harsh midday light","cluttered backgrounds"]}}

Input: "asdfghjkl"
Output: {"presetName":"Custom Style","confidence":0.1,"styleParams":{"mood":"natural","lighting":"natural","composition":"balanced","colorTemp":"neutral","subjects":["faces","details"],"avoidPatterns":["blurry","poor exposure"]}}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Extract style parameters from this photography description: "${description}"\n\nReturn ONLY valid JSON, no explanation.`,
        },
      ],
      system: systemPrompt,
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '{}'

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Ensure confidence field exists
    if (typeof parsed.confidence !== 'number') {
      parsed.confidence = 0.5
    }

    return new Response(
      JSON.stringify({ ...parsed, source: 'claude' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[parse-vibe]', message)
    return errorResponse(message, 'INTERNAL_ERROR', 500)
  }
})
