'use client'

import { useState } from 'react'
import { Zap, ChevronRight, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, Star } from 'lucide-react'
import type { DateRange } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
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

const INSIGHTS: Insight[] = [
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
    title: 'Instagram engagement → bookings gap',
    body: 'Your Instagram posts get 3.2x your average engagement, but only 14% of inquiries mention social media. Connecting analytics could reveal hidden attribution.',
    impact: 'Medium',
    cta: 'Connect Instagram',
    color: '#F472B6',
  },
  {
    id: 6,
    type: 'trend',
    title: 'Gallery delivery time improved 22%',
    body: 'Your average gallery delivery is now 9.2 days post-shoot, down from 11.8 days last quarter. AI sorting is saving ~3.4 hours per project.',
    impact: 'Low',
    cta: 'View AI Stats',
    color: '#34D399',
  },
]

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

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

interface AIInsightsTabProps {
  dateRange: DateRange
}

export function AIInsightsTab({ dateRange }: AIInsightsTabProps) {
  const [filter, setFilter] = useState<InsightType | 'all'>('all')
  const [generating, setGenerating] = useState(false)

  // TODO(ai-insights): fetch real AI-generated insights via Supabase Edge Function for dateRange
  void dateRange

  const filtered =
    filter === 'all' ? INSIGHTS : INSIGHTS.filter((i) => i.type === filter)

  const handleGenerate = async () => {
    setGenerating(true)
    // TODO(ai-insights): call /api/ai/generate-insights
    await new Promise<void>((resolve) => { setTimeout(resolve, 1800) })
    setGenerating(false)
  }

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
              {INSIGHTS.length} insights for selected period
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

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
            {type === 'all' ? `All (${INSIGHTS.length})` : type}
          </button>
        ))}
      </div>

      {/* Insights grid */}
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

      {filtered.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12">
          <Zap className="h-8 w-8 text-white/20" />
          <p className="text-[14px] text-white/35">No {filter} insights for this period</p>
        </div>
      )}
    </div>
  )
}
