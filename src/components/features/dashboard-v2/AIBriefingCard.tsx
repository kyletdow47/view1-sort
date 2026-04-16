'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AIBriefingCardProps {
  userName?: string
  /** When true, skip the real stats fetch and use baked-in demo stats. */
  demoMode?: boolean
}

interface InsightsApiResponse {
  insights: string[]
  source: 'claude' | 'cache' | 'fallback'
}

interface DashboardAIStatsResponse {
  totalPhotos: number
  qualityDistribution: { high: number; medium: number; low: number }
  categoryCounts: Record<string, number>
  duplicateCount: number
  blurryCount: number
  photographerNiche?: string
}

const DEMO_STATS: DashboardAIStatsResponse = {
  totalPhotos: 2847,
  categoryCounts: {
    Portraits: 890,
    Ceremony: 620,
    Details: 540,
    Reception: 410,
    Candids: 387,
  },
  qualityDistribution: { high: 2100, medium: 580, low: 167 },
  duplicateCount: 45,
  blurryCount: 28,
  photographerNiche: 'wedding and portrait photography',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

function getInsightIcon(text: string) {
  const lower = text.toLowerCase()
  if (lower.includes('up') || lower.includes('improv') || lower.includes('increas') || lower.includes('best')) {
    return { Icon: TrendingUp, color: '#34D399' }
  }
  if (lower.includes('down') || lower.includes('drop') || lower.includes('decreas') || lower.includes('low')) {
    return { Icon: TrendingDown, color: '#FBBF24' }
  }
  if (lower.includes('pending') || lower.includes('overdue') || lower.includes('risk') || lower.includes('re-sort')) {
    return { Icon: AlertCircle, color: '#F87171' }
  }
  return { Icon: Lightbulb, color: '#A78BFA' }
}

const FALLBACK_INSIGHTS = [
  'Your portfolio has grown 12% this month with strong quality scores.',
  '3 galleries are pending client selection — consider sending a reminder.',
  'Portrait category dominates at 45% of your work — a great specialization signal.',
  'AI sorting saved an estimated 4 hours on your last 3 projects.',
]

/* ------------------------------------------------------------------ */
/*  Session-level cache (survives re-renders, not page refreshes)      */
/* ------------------------------------------------------------------ */

let sessionCache: { insights: string[]; source: string; timestamp: number } | null = null
const SESSION_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AIBriefingCard({ userName = 'there', demoMode = false }: AIBriefingCardProps) {
  const [open, setOpen] = useState(false)
  const [insights, setInsights] = useState<string[]>(sessionCache?.insights ?? [])
  const [loading, setLoading] = useState(!sessionCache)
  const [source, setSource] = useState<string>(sessionCache?.source ?? 'fallback')
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchInsights = useCallback(async (force = false) => {
    // Use session cache if fresh
    if (!force && sessionCache && Date.now() - sessionCache.timestamp < SESSION_CACHE_TTL) {
      setInsights(sessionCache.insights)
      setSource(sessionCache.source)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    try {
      // Fetch real per-user stats unless caller requested demo mode
      let stats: DashboardAIStatsResponse = DEMO_STATS
      if (!demoMode) {
        const statsRes = await fetch('/api/dashboard/ai-stats', { signal: controller.signal })
        if (statsRes.ok) {
          stats = (await statsRes.json()) as DashboardAIStatsResponse
        }
        // If the fetch failed (unauthed, network) we keep DEMO_STATS as a
        // last-resort fallback rather than erroring out the card.
      }

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats,
          photographerNiche: stats.photographerNiche ?? 'professional photography',
        }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = (await res.json()) as InsightsApiResponse

      if (mountedRef.current) {
        const items = data.insights.slice(0, 5)
        setInsights(items)
        setSource(data.source)
        sessionCache = { insights: items, source: data.source, timestamp: Date.now() }
      }
    } catch (err) {
      console.warn('[AIBriefingCard] Failed to fetch insights:', err)
      if (mountedRef.current) {
        setError('AI insights unavailable')
        setInsights(FALLBACK_INSIGHTS)
        setSource('fallback')
      }
    } finally {
      clearTimeout(timeout)
      if (mountedRef.current) setLoading(false)
    }
  }, [demoMode])

  useEffect(() => {
    mountedRef.current = true
    void fetchInsights()
    return () => { mountedRef.current = false }
  }, [fetchInsights])

  const greeting = getGreeting(userName)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50">
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
        }}
        title="AI Briefing"
      >
        <Sparkles className="h-5 w-5 text-white" />
      </button>

      {/* Popover panel */}
      {open && (
        <div
          className="absolute bottom-16 right-0 w-[380px] overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,35,0.97) 0%, rgba(15,15,30,0.98) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Gradient glow accent */}
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent)' }}
          />

          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">{greeting}</p>
                <p className="text-[11px] text-white/40">
                  AI Briefing
                  {source === 'claude' && <span className="ml-1 text-indigo-400/60">powered by Claude</span>}
                </p>
              </div>
            </div>
            <button
              onClick={() => void fetchInsights(true)}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] text-amber-300/80"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
              <button
                onClick={() => void fetchInsights(true)}
                className="ml-auto text-amber-300/60 underline transition-colors hover:text-amber-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-5 w-5 shrink-0 animate-pulse rounded-lg bg-white/10" />
                  <div className="flex-1">
                    <div className="mb-1 h-3 w-full animate-pulse rounded bg-white/[0.08]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insights list */}
          {!loading && insights.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {insights.map((text, i) => {
                const { Icon, color } = getInsightIcon(text)
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: color + '15' }}
                    >
                      <Icon className="h-3 w-3" style={{ color }} />
                    </div>
                    <p className="text-[12px] leading-relaxed text-white/65">{text}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
