// Supabase Edge Function: generate-captions
// Model: claude-sonnet-4-6 — social media caption generation for photographers
//
// Invoke via: supabase.functions.invoke('generate-captions', { body: { platform, tone, imageDescription, photographerStyle } })

import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

const VALID_PLATFORMS = ['instagram', 'facebook', 'tiktok', 'pinterest'] as const
type ValidPlatform = (typeof VALID_PLATFORMS)[number]

const PLATFORM_CHAR_LIMITS: Record<ValidPlatform, number> = {
  instagram: 2200,
  facebook: 63206, // effectively no limit
  tiktok: 2200,
  pinterest: 500,
}

interface CaptionRequest {
  platform: string
  tone?: string
  imageDescription?: string
  photographerStyle?: string
}

interface ErrorResponse {
  error: string
  code: string
}

/* ------------------------------------------------------------------ */
/*  Rate limiter (in-memory, per-user, 10 req/min)                    */
/* ------------------------------------------------------------------ */

const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

/* ------------------------------------------------------------------ */
/*  Response cache (in-memory, 1 hour TTL)                            */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  data: Record<string, unknown>
  expiresAt: number
}

const responseCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getCacheKey(platform: string, tone: string, imageDescription: string): string {
  // Simple hash: combine the three fields
  const raw = `${platform}|${tone}|${imageDescription}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32-bit int
  }
  return `captions:${hash}`
}

function getCached(key: string): Record<string, unknown> | null {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: Record<string, unknown>): void {
  // Evict expired entries periodically (keep map bounded)
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

function isValidPlatform(p: string): p is ValidPlatform {
  return (VALID_PLATFORMS as readonly string[]).includes(p.toLowerCase())
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: CaptionRequest = await req.json()
    const { platform, tone = 'warm', imageDescription = '', photographerStyle = '' } = body

    // ── Input validation ──
    if (!platform || typeof platform !== 'string') {
      return errorResponse('platform is required', 'INVALID_INPUT', 400)
    }

    if (!isValidPlatform(platform)) {
      return errorResponse(
        `Invalid platform "${platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        'INVALID_PLATFORM',
        400,
      )
    }

    const normalizedPlatform = platform.toLowerCase() as ValidPlatform
    const charLimit = PLATFORM_CHAR_LIMITS[normalizedPlatform]

    // ── Rate limiting ──
    // Extract user from auth header if available, fall back to IP-based
    const authHeader = req.headers.get('authorization') ?? ''
    const userId = authHeader ? `auth:${authHeader.slice(-16)}` : 'anon'

    if (!checkRateLimit(userId)) {
      return errorResponse(
        'Rate limit exceeded. Maximum 10 requests per minute.',
        'RATE_LIMIT_EXCEEDED',
        429,
      )
    }

    // ── Check cache ──
    const cacheKey = getCacheKey(normalizedPlatform, tone, imageDescription)
    const cached = getCached(cacheKey)
    if (cached) {
      return new Response(
        JSON.stringify({ ...cached, source: 'cache' }),
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
    const systemPrompt = [
      `You are a professional photographer's social media assistant specializing in creating engaging, authentic captions.`,
      photographerStyle ? `The photographer's brand voice and style: ${photographerStyle}` : '',
      ``,
      `RULES:`,
      `- Generate exactly 3 caption variants with these tones: professional, warm, storytelling`,
      `- Each caption must include 3-5 relevant hashtags naturally woven in or appended`,
      `- Platform: ${normalizedPlatform} — max ${charLimit} characters per caption`,
      normalizedPlatform === 'tiktok' ? `- TikTok: keep captions punchy, use trending language and emojis` : '',
      normalizedPlatform === 'instagram' ? `- Instagram: use emojis sparingly but strategically, focus on storytelling` : '',
      normalizedPlatform === 'pinterest' ? `- Pinterest: focus on SEO-friendly descriptive keywords` : '',
      normalizedPlatform === 'facebook' ? `- Facebook: conversational tone, encourage engagement with questions` : '',
      `- Write captions that feel authentic, emotional, and on-brand for professional photography`,
      `- Never use generic filler. Every word should serve the narrative.`,
      ``,
      `Return ONLY valid JSON matching this exact schema:`,
      `{`,
      `  "professional": "caption text with #hashtags",`,
      `  "warm": "caption text with #hashtags",`,
      `  "storytelling": "caption text with #hashtags"`,
      `}`,
    ].filter(Boolean).join('\n')

    const userPrompt = [
      `Platform: ${normalizedPlatform} (max ${charLimit} chars)`,
      `Preferred tone: ${tone}`,
      imageDescription ? `Image/scene context: ${imageDescription}` : 'General photography post — use your best judgment for context.',
      ``,
      `Generate 3 caption variants (professional, warm, storytelling) for this photographer's ${normalizedPlatform} post.`,
      `Return ONLY valid JSON.`,
    ].filter(Boolean).join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '{}'

    // Extract JSON from potential markdown fences
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let toneVariants: Record<string, string>
    try {
      toneVariants = JSON.parse(cleaned) as Record<string, string>
    } catch {
      // Fallback if Claude doesn't return clean JSON
      toneVariants = {
        professional: rawText.slice(0, charLimit),
        warm: rawText.slice(0, charLimit),
        storytelling: rawText.slice(0, charLimit),
      }
    }

    // Enforce character limits
    for (const key of Object.keys(toneVariants)) {
      if (toneVariants[key] && toneVariants[key].length > charLimit) {
        toneVariants[key] = toneVariants[key].slice(0, charLimit)
      }
    }

    const captions = [
      toneVariants.professional ?? '',
      toneVariants.warm ?? '',
      toneVariants.storytelling ?? '',
    ].filter(Boolean)

    const responseData = { captions, tone_variants: toneVariants, source: 'claude' as const }

    // Cache the result (without the source field — we add it on retrieval)
    setCache(cacheKey, { captions, tone_variants: toneVariants })

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-captions]', msg)
    return errorResponse(msg, 'INTERNAL_ERROR', 500)
  }
})
