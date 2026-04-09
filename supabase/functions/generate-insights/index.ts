// Supabase Edge Function: generate-insights
// Model: claude-haiku-4-5-20251001 — fast gallery/shoot analysis insights
//
// Invoke via: supabase.functions.invoke('generate-insights', { body: { stats, projectId, photographerNiche } })

import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalleryStats {
  totalPhotos: number
  categoryCounts: Record<string, number>
  qualityDistribution: { high: number; medium: number; low: number }
  duplicateCount?: number
  blurryCount?: number
  overexposedCount?: number
}

interface InsightsRequest {
  stats: GalleryStats
  projectId?: string
  photographerNiche?: string
}

interface ErrorResponse {
  error: string
  code: string
}

/* ------------------------------------------------------------------ */
/*  Rate limiter (in-memory, 10 req/min)                              */
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
/*  In-memory response cache (1 hour TTL)                             */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  insights: string[]
  expiresAt: number
}

const insightsCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getStatsHash(stats: GalleryStats, projectId?: string): string {
  const raw = JSON.stringify({ stats, projectId })
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `insights:${hash}`
}

function getCached(key: string): string[] | null {
  const entry = insightsCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    insightsCache.delete(key)
    return null
  }
  return entry.insights
}

function setCache(key: string, insights: string[]): void {
  if (insightsCache.size > 200) {
    const now = Date.now()
    for (const [k, v] of insightsCache) {
      if (now > v.expiresAt) insightsCache.delete(k)
    }
  }
  insightsCache.set(key, { insights, expiresAt: Date.now() + CACHE_TTL_MS })
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

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: InsightsRequest = await req.json()
    const { stats, projectId, photographerNiche } = body

    // ── Input validation ──
    if (!stats) {
      return errorResponse('stats object is required', 'INVALID_INPUT', 400)
    }

    if (typeof stats.totalPhotos !== 'number' || stats.totalPhotos <= 0) {
      return errorResponse('stats.totalPhotos must be a positive number', 'INVALID_INPUT', 400)
    }

    if (!stats.qualityDistribution || typeof stats.qualityDistribution.high !== 'number') {
      return errorResponse('stats.qualityDistribution is required with high/medium/low fields', 'INVALID_INPUT', 400)
    }

    if (!stats.categoryCounts || typeof stats.categoryCounts !== 'object') {
      return errorResponse('stats.categoryCounts is required', 'INVALID_INPUT', 400)
    }

    // ── Rate limiting ──
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
    const cacheKey = getStatsHash(stats, projectId)
    const cached = getCached(cacheKey)
    if (cached) {
      return new Response(
        JSON.stringify({ insights: cached, source: 'cache' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── API key check ──
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return errorResponse('ANTHROPIC_API_KEY not configured', 'API_KEY_MISSING', 500)
    }

    const client = new Anthropic({ apiKey })

    // ── Build analysis prompt ──
    const highPct = Math.round((stats.qualityDistribution.high / stats.totalPhotos) * 100)
    const medPct = Math.round((stats.qualityDistribution.medium / stats.totalPhotos) * 100)
    const lowPct = Math.round((stats.qualityDistribution.low / stats.totalPhotos) * 100)

    const categoryBreakdown = Object.entries(stats.categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => `  ${cat}: ${count} (${Math.round((count / stats.totalPhotos) * 100)}%)`)
      .join('\n')

    const topCategory = Object.entries(stats.categoryCounts)
      .sort(([, a], [, b]) => b - a)[0]

    const systemPrompt = [
      `You are an AI business analyst for a professional photographer.`,
      photographerNiche ? `The photographer specializes in: ${photographerNiche}` : '',
      ``,
      `Generate actionable, data-driven insights — not generic observations.`,
      `Each insight should:`,
      `- Reference specific numbers from the data`,
      `- Suggest a concrete action the photographer can take`,
      `- Be relevant to a professional photographer's business`,
      ``,
      `Return ONLY a valid JSON array of 3-5 insight strings.`,
      `Example: ["82% of your portrait shots scored high confidence — your lighting technique is consistent. Consider raising portrait session prices by 10-15%."]`,
    ].filter(Boolean).join('\n')

    const userPrompt = [
      `Analyze this photography shoot/portfolio and provide 3-5 actionable business insights.`,
      ``,
      `Stats:`,
      `- Total photos: ${stats.totalPhotos}`,
      `- High confidence (>=90%): ${stats.qualityDistribution.high} (${highPct}%)`,
      `- Medium confidence (70-90%): ${stats.qualityDistribution.medium} (${medPct}%)`,
      `- Low confidence (<70%): ${stats.qualityDistribution.low} (${lowPct}%)`,
      stats.duplicateCount ? `- Duplicates detected: ${stats.duplicateCount}` : '',
      stats.blurryCount ? `- Blurry photos: ${stats.blurryCount}` : '',
      stats.overexposedCount ? `- Overexposed photos: ${stats.overexposedCount}` : '',
      ``,
      `Category breakdown:`,
      categoryBreakdown,
      ``,
      topCategory ? `Top category: ${topCategory[0]} (${topCategory[1]} photos)` : '',
      ``,
      `Return ONLY a valid JSON array of insight strings. No explanation.`,
    ].filter(Boolean).join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 768,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '[]'
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const insights = JSON.parse(cleaned) as string[]

    // Cache the result
    setCache(cacheKey, insights)

    return new Response(
      JSON.stringify({ insights, source: 'claude' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-insights]', msg)
    return errorResponse(msg, 'INTERNAL_ERROR', 500)
  }
})
