'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, ChevronRight, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, Star, Sparkles } from 'lucide-react'
import type { DateRange } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InsightType = 'opportunity' | 'warning' | 'trend' | 'achievement'

type Insight = {
  id: number
  type: InsightType
  title: string
  body: string
  impact: 'High' | 'Medium' | 'Low'
  cta: string
  color: string
}

interface InsightsApiResponse {
  insights: string[]
  source: 'claude' | 'cache' | 'fallback'
}

/* ------------------------------------------------------------------ */
/*  Mock fallback data                                                 */
/* ------------------------------------------------------------------ */

const FALLBACK_INSIGHTS: Insight[] = [
  {
    id: 1,
    type: 'opportunity',
    title: 'Upsell opportunity: Smith & James Wedding',
    body: 'This gallery has 340 views and 84 selections but no album order yet. Clients with this engagement level convert at 78% when prompted.',
    impact: 'High',
    cta: 'Send Offer',
    color: '#34D399',
  },
  {
    id: 2,
    type: 'warning',
    title: '3 invoices past due — $2,100 at risk',
    body: 'INV-042 (Chen Family, $650) is 35 days overdue. Automated reminders have not been sent. Sending now recovers payment in 4.2 days on average.',
    impact: 'High',
    cta: 'Send Reminders',
    color: '#FBBF24',
  },
  {
    id: 3,
    type: 'trend',
    title: 'Weekend shoots drive 68% of revenue',
    body: 'Saturday shoots average $2,400 vs $1,100 for weekdays. Consider prioritizing weekend availability in your booking calendar.',
    impact: 'Medium',
    cta: 'Adjust Calendar',
    color: '#60A5FA',
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Best revenue month in 12 months',
    body: 'March 2026 revenue of $6,200 is your highest since April 2025. This growth is driven primarily by wedding package upsells.',
    impact: 'Low',
    cta: 'View Report',
    color: '#A78BFA',
  },
  {
    id: 5,
    type: 'opportunity',
    title: 'Instagram engagement to bookings gap',
    body: 'Your Instagram posts get 3.2x your average engagement, but only 14% of inquiries mention social media. Connecting analytics could reveal hidden attribution.',
    impact: 'Medium',
    cta: 'Connect Instagram',
    color: '#F472B6',
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TYPE_ICONS: Record<InsightType, typeof Zap> = {
  opportunity: Lightbulb,
  warning: AlertTriangle,
  trend: TrendingUp,
  achievement: Star,
}

const IMPACT_COLORS = {
  High: 'text-red-400 bg-red-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  Low: 'text-emerald-400 bg-emerald-400/10',
}

/** Convert a raw insight string into a structured Insight object */
function parseInsightString(text: string, index: number): Insight {
  // Detect type by keywords
  const lower = text.toLowerCase()
  let type: InsightType = 'trend'
  let color = '#60A5FA'

  if (lower.includes('opportunity') || lower.includes('upsell') || lower.includes('consider') || lower.includes('could')) {
    type = 'opportunity'
    color = '#34D399'
  } else if (lower.includes('warning') || lower.includes('overdue') || lower.includes('risk') || lower.includes('drop')) {
    type = 'warning'
    color = '#FBBF24'
  } else if (lower.includes('best') || lower.includes('improved') || lower.includes('excellent') || lower.includes('above average')) {
    type = 'achievement'
    color = '#A78BFA'
  }

  // Extract impact: high if numbers > 50% or money mentioned
  let impact: 'High' | 'Medium' | 'Low' = 'Medium'
  if (lower.includes('high') || /\$\d{3,}/.test(text) || /\d{2,}%/.test(text)) {
    impact = 'High'
  } else if (lower.includes('low') || lower.includes('minor')) {
    impact = 'Low'
  }

  // Split on first period or dash for title/body
  const splitIdx = text.indexOf(' — ')
  const title = splitIdx > 0 ? text.slice(0, splitIdx) : text.slice(0, 60) + (text.length > 60 ? '...' : '')
  const body = splitIdx > 0 ? text.slice(splitIdx + 3) : text

  return {
    id: index + 1,
    type,
    title,
    body,
    impact,
    cta: type === 'opportunity' ? 'Take Action' : type === 'warning' ? 'Review' : 'View Details',
    color,
  }
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {children}
    </div>
  )
}

function InsightSkeleton() {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-white/10" />
        <div className="flex-1">
          <div className="mb-2 h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.06]" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-full animate-pulse rounded bg-white/[0.06]" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-2.5 w-3/5 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab component                                                      */
/* ------------------------------------------------------------------ */

interface AIInsightsTabProps {
  dateRange: DateRange
}

export function AIInsightsTab({ dateRange }: AIInsightsTabProps) {
  const [filter, setFilter] = useState<InsightType | 'all'>('all')
  const [insights, setInsights] = useState<Insight[]>(FALLBACK_INSIGHTS)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<'claude' | 'cache' | 'fallback'>('fallback')
  const [error, setError] = useState<string | null>(null)

  // Cache insights in ref to avoid re-fetch on tab switches
  const cachedRef = useRef<{ key: string; insights: Insight[]; source: 'claude' | 'cache' | 'fallback' } | null>(null)

  const cacheKey = `${dateRange.from}-${dateRange.to}`

  const fetchInsights = useCallback(async (force = false) => {
    // Use cache if not forced and same date range
    if (!force && cachedRef.current?.key === cacheKey) {
      setInsights(cachedRef.current.insights)
      setSource(cachedRef.current.source)
      return
    }

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    try {
      // Mock stats for the demo — in production these come from Supabase queries
      const stats = {
        totalPhotos: 1247,
        categoryCounts: {
          portraits: 420,
          ceremony: 310,
          details: 210,
          reception: 180,
          candid: 127,
        },
        qualityDistribution: { high: 890, medium: 280, low: 77 },
        duplicateCount: 23,
        blurryCount: 15,
      }

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = (await res.json()) as InsightsApiResponse
      const parsed = data.insights.map(parseInsightString)

      setInsights(parsed)
      setSource(data.source)
      cachedRef.current = { key: cacheKey, insights: parsed, source: data.source }
    } catch (err) {
      console.warn('[AIInsightsTab] Failed to fetch insights:', err)
      setError('Could not generate insights. Showing saved suggestions.')
      setInsights(FALLBACK_INSIGHTS)
      setSource('fallback')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [cacheKey])

  // Fetch on mount and date range changes
  useEffect(() => {
    void fetchInsights()
  }, [fetchInsights])

  const filtered =
    filter === 'all' ? insights : insights.filter((i) => i.type === filter)

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-violet-500">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">AI Business Intelligence</p>
            <p className="text-[12px] text-white/45">
              {insights.length} insights for selected period
              {source === 'claude' && <span className="ml-1.5 text-indigo-400/60">Powered by Claude</span>}
              {source === 'cache' && <span className="ml-1.5 text-emerald-400/60">Cached</span>}
            </p>
          </div>
        </div>
        <button
          onClick={() => void fetchInsights(true)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] text-amber-300/80"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {(['all', 'opportunity', 'warning', 'trend', 'achievement'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
              filter === type
                ? 'bg-indigo-500 text-white'
                : 'border border-white/15 bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {type === 'all' ? `All (${insights.length})` : type}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <InsightSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Insights grid */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((insight) => {
            const Icon = TYPE_ICONS[insight.type]
            return (
              <GlassCard key={insight.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: insight.color + '20' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: insight.color }} />
                    </div>
                    <p className="text-[13px] font-semibold leading-tight text-white">
                      {insight.title}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${IMPACT_COLORS[insight.impact]}`}
                  >
                    {insight.impact}
                  </span>
                </div>

                <p className="text-[12px] leading-relaxed text-white/55">{insight.body}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-medium capitalize text-white/30">
                    {insight.type}
                  </span>
                  <button
                    className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-80"
                    style={{ color: insight.color }}
                  >
                    {insight.cta}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12">
          <Zap className="h-8 w-8 text-white/20" />
          <p className="text-[14px] text-white/35">No {filter} insights for this period</p>
        </div>
      )}
    </div>
  )
}
