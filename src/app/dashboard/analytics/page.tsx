'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Eye,
  ImageIcon,
  ChevronDown,
  Send,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InsightState {
  answer: string
  loading: boolean
  error: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const bookingTrends = [
  { month: 'Oct', bookings: 8, revenue: 9200 },
  { month: 'Nov', bookings: 11, revenue: 13400 },
  { month: 'Dec', bookings: 14, revenue: 17800 },
  { month: 'Jan', bookings: 9, revenue: 10500 },
  { month: 'Feb', bookings: 12, revenue: 14200 },
  { month: 'Mar', bookings: 15, revenue: 18600 },
]

const monthHeatmap = [
  { month: 'Jan', density: 2 },
  { month: 'Feb', density: 3 },
  { month: 'Mar', density: 4 },
  { month: 'Apr', density: 5 },
  { month: 'May', density: 4 },
  { month: 'Jun', density: 3 },
  { month: 'Jul', density: 2 },
  { month: 'Aug', density: 3 },
  { month: 'Sep', density: 5 },
  { month: 'Oct', density: 4 },
  { month: 'Nov', density: 5 },
  { month: 'Dec', density: 3 },
]

const galleryStats = [
  { name: 'Johnson Wedding', views: 3241, selections: 182, downloadRate: 94, timeToDownload: '2.1d' },
  { name: 'Nike Spring Campaign', views: 2817, selections: 94, downloadRate: 78, timeToDownload: '0.8d' },
  { name: 'Smith Family Portraits', views: 1654, selections: 211, downloadRate: 98, timeToDownload: '1.3d' },
  { name: 'Meridian Hotel Rebrand', views: 1309, selections: 47, downloadRate: 61, timeToDownload: '3.2d' },
  { name: 'Coastal Real Estate', views: 987, selections: 65, downloadRate: 82, timeToDownload: '1.7d' },
]

const engagementByDay = [
  { day: 'Mon', views: 420 },
  { day: 'Tue', views: 380 },
  { day: 'Wed', views: 510 },
  { day: 'Thu', views: 290 },
  { day: 'Fri', views: 640 },
  { day: 'Sat', views: 820 },
  { day: 'Sun', views: 760 },
]

const topGalleries = [
  {
    name: 'Johnson Wedding',
    client: 'Emily & Ryan Johnson',
    views: 3241,
    tag: 'Wedding',
    accentIdx: 0,
  },
  {
    name: 'Nike Spring Campaign',
    client: 'Nike — Brand Studio',
    views: 2817,
    tag: 'Commercial',
    accentIdx: 1,
  },
  {
    name: 'Smith Family Portraits',
    client: 'David Smith',
    views: 1654,
    tag: 'Portrait',
    accentIdx: 2,
  },
]

const kpis = [
  {
    label: 'Booking Rate',
    value: '28%',
    sub: 'inquiries converted',
    icon: Users,
    color: '#818cf8',
  },
  {
    label: 'Avg Response Time',
    value: '4.2h',
    sub: 'to new leads',
    icon: Clock,
    color: '#34D399',
  },
  {
    label: 'Client Retention',
    value: '42%',
    sub: 'rebook within 12mo',
    icon: TrendingUp,
    color: '#FBBF24',
  },
  {
    label: 'Avg Project Value',
    value: '$3,240',
    sub: 'per shoot',
    icon: DollarSign,
    color: '#60A5FA',
  },
]

const ACCENT_COLORS = ['#818cf8', '#34D399', '#FBBF24'] as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function heatColor(density: number): string {
  const stops = [
    'rgba(87,73,244,0.12)',
    'rgba(87,73,244,0.25)',
    'rgba(87,73,244,0.42)',
    'rgba(87,73,244,0.62)',
    'rgba(87,73,244,0.85)',
  ]
  return stops[Math.min(density - 1, 4)] ?? stops[0]
}

function downloadRateColor(rate: number): string {
  if (rate >= 90) return '#34D399'
  if (rate >= 70) return '#FBBF24'
  return '#60A5FA'
}

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

function GlassCard({
  children,
  className = '',
  noPad = false,
}: {
  children: React.ReactNode
  className?: string
  noPad?: boolean
}) {
  return (
    <div
      className={`rounded-3xl backdrop-blur-[32px] ${noPad ? '' : 'p-4'} ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({
  children,
  badge,
}: {
  children: React.ReactNode
  badge?: string
}) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <h2 className="text-lg font-semibold text-white/95">{children}</h2>
      {badge && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Custom Recharts tooltip                                            */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: 'rgba(26,24,46,0.92)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <p className="mb-1 font-semibold text-white/90">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono" style={{ color: p.color }}>
          {p.name}:{' '}
          {p.dataKey === 'revenue'
            ? `$${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AI Insights card                                                   */
/* ------------------------------------------------------------------ */

function AIInsightsCard() {
  const [prompt, setPrompt] = useState('')
  const [insight, setInsight] = useState<InsightState>({
    answer: '',
    loading: false,
    error: '',
  })

  async function handleAsk() {
    if (!prompt.trim() || insight.loading) return
    setInsight({ answer: '', loading: true, error: '' })
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = (await res.json()) as { answer: string }
      setInsight({ answer: data.answer, loading: false, error: '' })
    } catch {
      setInsight({
        answer: '',
        loading: false,
        error: 'Unable to load insights. Please try again.',
      })
    }
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={15} style={{ color: '#818cf8' }} />
        <h3 className="text-sm font-semibold text-white/95">Ask Your Data</h3>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
        >
          AI
        </span>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAsk()
            }
          }}
          placeholder="e.g. What were my top earning months? Which shoot type converts best?"
          rows={2}
          className="w-full resize-none rounded-2xl px-4 py-3 pr-12 text-sm text-white/90 placeholder-white/40 outline-none"
          style={{
            background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(20px)',
          }}
        />
        <button
          onClick={handleAsk}
          disabled={!prompt.trim() || insight.loading}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          aria-label="Ask"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>

      {(insight.loading || insight.answer || insight.error) && (
        <div
          className="mt-3 rounded-2xl p-3 text-sm"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {insight.loading ? (
            <p className="animate-pulse text-white/50">Analyzing your data…</p>
          ) : insight.error ? (
            <p className="text-red-400">{insight.error}</p>
          ) : (
            <p className="leading-relaxed text-white/85">{insight.answer}</p>
          )}
        </div>
      )}
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const [selectedGallery, setSelectedGallery] = useState('Johnson Wedding')

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
        padding: '32px 85px 85px',
      }}
    >
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-[37px] font-bold leading-tight text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Know your business better than ever. AI surfaces insights you
          wouldn&apos;t find on your own.
        </p>
      </div>

      <div className="space-y-10">
        {/* ══════════════════════════════════════════════════
            SECTION 1 — BUSINESS INTELLIGENCE
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionTitle badge="✨ AI">Business Intelligence</SectionTitle>

          <div className="space-y-5">
            {/* AI Insights */}
            <AIInsightsCard />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <GlassCard key={kpi.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                        {kpi.label}
                      </span>
                      <Icon size={14} style={{ color: kpi.color }} />
                    </div>
                    <p className="font-mono text-2xl font-bold text-white">
                      {kpi.value}
                    </p>
                    <p className="text-[11px] text-white/50">{kpi.sub}</p>
                  </GlassCard>
                )
              })}
            </div>

            {/* Booking & Revenue Trends — LineChart */}
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={14} style={{ color: '#818cf8' }} />
                <h3 className="text-sm font-semibold text-white/95">
                  Booking &amp; Revenue Trends
                </h3>
                <span className="ml-auto text-[11px] text-white/40">
                  6-month view
                </span>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart
                  data={bookingTrends}
                  margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fill: 'rgba(255,255,255,0.50)',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fontSize: 11,
                      fill: 'rgba(255,255,255,0.50)',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fontSize: 11,
                      fill: 'rgba(255,255,255,0.50)',
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      `$${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#818cf8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#818cf8' }}
                    name="Bookings"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#34D399"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#34D399' }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Busiest Months Heatmap */}
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={14} style={{ color: '#FBBF24' }} />
                <h3 className="text-sm font-semibold text-white/95">
                  Busiest Months
                </h3>
                <span className="ml-auto text-[11px] text-white/40">
                  booking density
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                {monthHeatmap.map((m) => (
                  <div key={m.month} className="flex flex-col items-center gap-1.5">
                    <div
                      className="h-10 w-full rounded-lg transition-all"
                      style={{ background: heatColor(m.density) }}
                      title={`${m.month}: density ${m.density}/5`}
                    />
                    <span className="text-[9px] font-medium text-white/50">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-white/40">Low</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div
                      key={d}
                      className="h-3 w-6 rounded"
                      style={{ background: heatColor(d) }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-white/40">High</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — GALLERY PERFORMANCE
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>Gallery Performance</SectionTitle>

          <div className="space-y-5">
            {/* Gallery Stats Table */}
            <GlassCard noPad>
              <div
                className="flex items-center gap-2 border-b px-4 py-3"
                style={{ borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <Eye size={14} style={{ color: '#34D399' }} />
                <h3 className="text-sm font-semibold text-white/95">
                  Gallery Stats
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      {[
                        'Gallery',
                        'Views',
                        'Selections',
                        'Download Rate',
                        'Time to DL',
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 font-medium uppercase tracking-wider text-white/45 ${
                            i === 0 ? 'text-left' : 'text-right'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {galleryStats.map((row) => {
                      const isSelected = selectedGallery === row.name
                      return (
                        <tr
                          key={row.name}
                          onClick={() => setSelectedGallery(row.name)}
                          className="cursor-pointer border-b transition-colors last:border-0"
                          style={{
                            borderColor: 'rgba(255,255,255,0.05)',
                            background: isSelected
                              ? 'rgba(255,255,255,0.08)'
                              : undefined,
                          }}
                        >
                          <td className="px-4 py-3 font-medium text-white/90">
                            {row.name}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/70">
                            {row.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/70">
                            {row.selections}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className="h-1 w-16 rounded-full"
                                style={{
                                  background: 'rgba(255,255,255,0.10)',
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${row.downloadRate}%`,
                                    background: downloadRateColor(
                                      row.downloadRate
                                    ),
                                  }}
                                />
                              </div>
                              <span className="w-8 text-right font-mono text-white/70">
                                {row.downloadRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/70">
                            {row.timeToDownload}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Engagement chart + Top galleries */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Engagement BarChart */}
              <GlassCard>
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 size={14} style={{ color: '#60A5FA' }} />
                  <h3 className="text-sm font-semibold text-white/95">
                    Gallery Views by Day
                  </h3>
                  <button
                    className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-white/50 transition-colors hover:text-white/80"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                  >
                    <span className="truncate max-w-[100px]">
                      {selectedGallery}
                    </span>
                    <ChevronDown size={10} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={engagementByDay}
                    margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{
                        fontSize: 11,
                        fill: 'rgba(255,255,255,0.50)',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'rgba(255,255,255,0.50)',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="views"
                      fill="#60A5FA"
                      radius={[4, 4, 0, 0]}
                      name="Views"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Top Performing Galleries */}
              <GlassCard>
                <div className="mb-4 flex items-center gap-2">
                  <ImageIcon size={14} style={{ color: '#A78BFA' }} />
                  <h3 className="text-sm font-semibold text-white/95">
                    Top Performing Galleries
                  </h3>
                </div>

                <div className="space-y-3">
                  {topGalleries.map((g) => {
                    const accent = ACCENT_COLORS[g.accentIdx]
                    return (
                      <div
                        key={g.name}
                        className="flex items-center gap-3 rounded-xl p-3"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {/* Thumbnail placeholder */}
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${accent}28` }}
                        >
                          <ImageIcon size={18} style={{ color: accent }} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white/90">
                            {g.name}
                          </p>
                          <p className="truncate text-[11px] text-white/50">
                            {g.client}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-white/60">
                            <Eye size={11} />
                            <span className="font-mono text-xs">
                              {g.views.toLocaleString()}
                            </span>
                          </div>
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                            style={{
                              background: `${accent}20`,
                              color: accent,
                            }}
                          >
                            {g.tag}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
