// Supabase Edge Function: vision-classify
// Model: claude-haiku-4-5 with vision — second-pass reasoning for hard/abnormal photos
//
// Called as the fallback when CLIP confidence is low or neighbors disagree.
// Claude *looks* at the photo, describes it, picks the best category or flags
// it as abnormal and suggests a new category name.
//
// Invoke via: supabase.functions.invoke('vision-classify', {
//   body: { photoUrl, preset, categories, existingDescription? }
// })

import Anthropic from 'npm:@anthropic-ai/sdk'
import { checkRateLimit, getUserKey } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

const VALID_PRESETS = ['wedding', 'real-estate', 'commercial', 'fashion', 'travel', 'event'] as const
type ValidPreset = (typeof VALID_PRESETS)[number]

interface VisionRequest {
  photoUrl: string
  preset: string
  categories: string[]
  existingDescription?: string
}

interface VisionResult {
  description: string
  category: string
  confidence: number
  isAbnormal: boolean
  suggestedCategory?: string
  source: 'claude' | 'cache'
}

interface ErrorResponse {
  error: string
  code: string
}

/* ------------------------------------------------------------------ */
/*  Rate limiter — see ../_shared/rate-limit.ts (durable, Postgres-backed) */
/*  Higher than captions because this fires on escalation only        */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_FUNCTION = 'vision-classify'
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_SECONDS = 60

/* ------------------------------------------------------------------ */
/*  Response cache (in-memory, 1 hour TTL)                            */
/*  Keyed on photoUrl+preset — same photo re-sorted hits cache        */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  data: Omit<VisionResult, 'source'>
  expiresAt: number
}

const responseCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000

function getCacheKey(photoUrl: string, preset: string, categories: string[]): string {
  const raw = `${photoUrl}|${preset}|${categories.sort().join(',')}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `vision:${hash}`
}

function getCached(key: string): Omit<VisionResult, 'source'> | null {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: Omit<VisionResult, 'source'>): void {
  if (responseCache.size > 500) {
    const now = Date.now()
    for (const [k, v] of responseCache) {
      if (now > v.expiresAt) responseCache.delete(k)
    }
  }
  responseCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

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

function isValidPreset(p: string): p is ValidPreset {
  return (VALID_PRESETS as readonly string[]).includes(p)
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: VisionRequest = await req.json()
    const { photoUrl, preset, categories, existingDescription } = body

    // ── Input validation ──
    if (!photoUrl || typeof photoUrl !== 'string' || !isValidHttpUrl(photoUrl)) {
      return errorResponse('photoUrl must be a valid http(s) URL', 'INVALID_INPUT', 400)
    }

    if (!preset || !isValidPreset(preset)) {
      return errorResponse(
        `Invalid preset. Must be one of: ${VALID_PRESETS.join(', ')}`,
        'INVALID_PRESET',
        400,
      )
    }

    if (!Array.isArray(categories) || categories.length === 0 || categories.length > 30) {
      return errorResponse('categories must be a non-empty array (max 30)', 'INVALID_INPUT', 400)
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

    // ── Check cache ──
    const cacheKey = getCacheKey(photoUrl, preset, categories)
    const cached = getCached(cacheKey)
    if (cached) {
      return new Response(
        JSON.stringify({ ...cached, source: 'cache' } satisfies VisionResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── API key check ──
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return errorResponse('ANTHROPIC_API_KEY not configured', 'API_KEY_MISSING', 500)
    }

    const client = new Anthropic({ apiKey })

    // ── Build prompts ──
    const presetLabel = preset.replace('-', ' ')
    const categoryList = categories.map((c, i) => `  ${i + 1}. ${c}`).join('\n')

    const systemPrompt = [
      `You are a professional photography editor sorting a photographer's shoot into categories.`,
      `The shoot is a "${presetLabel}" shoot.`,
      ``,
      `AVAILABLE CATEGORIES:`,
      categoryList,
      ``,
      `YOUR JOB:`,
      `1. Look at the photo carefully.`,
      `2. Write a brief one-sentence description of what's happening.`,
      `3. Pick the single best category from the list above.`,
      `4. If the photo truly doesn't fit ANY listed category (e.g. a landscape at a wedding, a pet at a corporate event), flag it as ABNORMAL and suggest a short new category name (2-3 words) that would fit.`,
      `5. Give a confidence score 0.0-1.0 for your choice.`,
      ``,
      `RULES:`,
      `- Prefer an existing category if there's any reasonable fit. Only flag abnormal for genuine outliers.`,
      `- Category must match one from the list EXACTLY (case-sensitive) unless abnormal.`,
      `- suggestedCategory must be 2-3 words, title-case (e.g. "Venue Landscape", "Behind The Scenes").`,
      `- Description: 1 sentence, max 20 words, factual not poetic.`,
      ``,
      `Return ONLY valid JSON matching this exact schema:`,
      `{`,
      `  "description": "string",`,
      `  "category": "string (must match list, or empty if abnormal)",`,
      `  "confidence": 0.0-1.0,`,
      `  "isAbnormal": boolean,`,
      `  "suggestedCategory": "string (only if isAbnormal=true)"`,
      `}`,
    ].join('\n')

    const userContent: Anthropic.Messages.ContentBlockParam[] = [
      {
        type: 'image',
        source: { type: 'url', url: photoUrl },
      },
      {
        type: 'text',
        text: existingDescription
          ? `Additional context from a first-pass model: "${existingDescription}". Use this only as a hint — trust your own eyes first.\n\nAnalyze the photo and return JSON.`
          : `Analyze the photo and return JSON.`,
      },
    ]

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: userContent }],
      system: systemPrompt,
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    interface ClaudeVisionResponse {
      description?: string
      category?: string
      confidence?: number
      isAbnormal?: boolean
      suggestedCategory?: string
    }

    let parsed: ClaudeVisionResponse
    try {
      parsed = JSON.parse(cleaned) as ClaudeVisionResponse
    } catch {
      return errorResponse('Claude returned invalid JSON', 'PARSE_ERROR', 502)
    }

    // Validate Claude's response shape
    const category = typeof parsed.category === 'string' ? parsed.category : ''
    const isAbnormal = parsed.isAbnormal === true
    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5
    const description = typeof parsed.description === 'string'
      ? parsed.description.slice(0, 200)
      : ''

    // If not abnormal, category must match the list
    if (!isAbnormal && !categories.includes(category)) {
      // Claude hallucinated a category — treat as abnormal fallback
      const result: Omit<VisionResult, 'source'> = {
        description,
        category: '',
        confidence: confidence * 0.5,
        isAbnormal: true,
        suggestedCategory: category || 'Uncategorized',
      }
      setCache(cacheKey, result)
      return new Response(
        JSON.stringify({ ...result, source: 'claude' } satisfies VisionResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const result: Omit<VisionResult, 'source'> = {
      description,
      category: isAbnormal ? '' : category,
      confidence,
      isAbnormal,
      ...(isAbnormal && typeof parsed.suggestedCategory === 'string'
        ? { suggestedCategory: parsed.suggestedCategory.slice(0, 40) }
        : {}),
    }

    setCache(cacheKey, result)

    return new Response(
      JSON.stringify({ ...result, source: 'claude' } satisfies VisionResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[vision-classify]', msg)
    return errorResponse(msg, 'INTERNAL_ERROR', 500)
  }
})
