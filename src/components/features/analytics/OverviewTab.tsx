'use client'

import { useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  TrendingUp,
  Eye,
  Target,
  ChevronRight,
  Download,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DateRange } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const KPI_DATA = [
  { label: 'Total Revenue', value: '$8,240', change: '+12%', positive: true, icon: TrendingUp, color: '#34D399' },
  { label: 'Gallery Views', value: '1,847', change: '+8%', positive: true, icon: Eye, color: '#60A5FA' },
  { label: 'Conversion Rate', value: '68%', change: '+4%', positive: true, icon: Target, color: '#A78BFA' },
  { label: 'AI Hours Saved', value: '142h', change: '+22h', positive: true, icon: Zap, color: '#FBBF24' },
]

const AI_INSIGHTS = [
  { id: 1, title: 'Revenue trending up', body: 'Your revenue is 12% higher than last period. Wedding season is driving growth.', cta: 'View Details', color: '#34D399' },
  { id: 2, title: 'Explore content measurement', body: 'Link your Instagram to track which posts convert to bookings.', cta: 'Connect', color: '#60A5FA' },
  { id: 3, title: '3 invoices past due', body: 'Send automated reminders to recover $2,100 in outstanding payments.', cta: 'Send Reminders', color: '#FBBF24' },
  { id: 4, title: 'Gallery engagement high', body: '"Smith & James Wedding" gallery has 340 views — consider upsell.', cta: 'View Gallery', color: '#A78BFA' },
]

const REVENUE_DATA = [
  { label: 'Week 1', revenue: 1840, bookings: 5 },
  { label: 'Week 2', revenue: 2200, bookings: 8 },
  { label: 'Week 3', revenue: 1600, bookings: 4 },
  { label: 'Week 4', revenue: 2600, bookings: 7 },
]

const GALLERY_PERFORMANCE = [
  { name: 'Sarah & James Wedding', views: 340, selections: 84, status: 'Delivered' },
  { name: 'Meridian Hotel Brand', views: 218, selections: 42, status: 'In Review' },
  { name: 'Torres Engagement', views: 155, selections: 31, status: 'Active' },
  { name: 'Smith Family Portraits', views: 94, selections: 28, status: 'Delivered' },
  { name: 'Marcus Cole Commercial', views: 67, selections: 15, status: 'Active' },
]

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#34D399',
  'In Review': '#FBBF24',
  Active: '#60A5FA',
}

type ChartMode = 'Revenue' | 'Bookings'

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
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

function ChartTooltip({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  mode: ChartMode
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'rgba(26,24,46,0.95)', border: '1px solid rgba(255,255,255,0.18)' }}
    >
      <p className="font-semibold text-white/80">{label}</p>
      <p className="font-mono" style={{ color: '#6366F1' }}>
        {mode === 'Revenue' ? `$${(payload[0]!.value / 1000).toFixed(1)}k` : `${payload[0]!.value} bookings`}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

interface OverviewTabProps {
  dateRange: DateRange
}

export function OverviewTab({ dateRange }: OverviewTabProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('Revenue')

  // TODO(analytics-api): fetch real data for dateRange.from → dateRange.to
  void dateRange

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon
          return (
            <GlassCard key={kpi.label} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">{kpi.label}</span>
                <Icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
              <p className="font-mono text-[24px] font-bold leading-none text-white">{kpi.value}</p>
              <div className="flex items-center gap-1">
                {kpi.positive ? (
                  <ArrowUpRight className="h-3 w-3" style={{ color: kpi.color }} />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                <span className="text-[11px] font-medium" style={{ color: kpi.color }}>
                  {kpi.change}
                </span>
                <span className="text-[11px] text-white/30">vs prior period</span>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Middle row: AI Insights + Chart */}
      <div className="grid grid-cols-12 gap-4">
        {/* AI Insights */}
        <GlassCard className="col-span-4 flex flex-col gap-3 overflow-hidden p-4">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-[13px] font-semibold text-white">AI Insights</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {AI_INSIGHTS.map((insight) => (
              <div
                key={insight.id}
                className="flex flex-col gap-1.5 rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: insight.color }} />
                  <p className="text-[12px] font-semibold text-white/90">{insight.title}</p>
                </div>
                <p className="pl-4 text-[11px] text-white/45">{insight.body}</p>
                <button
                  className="mt-0.5 flex items-center gap-1 pl-4 text-[11px] font-medium"
                  style={{ color: insight.color }}
                >
                  {insight.cta}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
          >
            Generate Report
          </button>
        </GlassCard>

        {/* Revenue & Bookings Chart */}
        <GlassCard className="col-span-8 flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">Revenue & Booking Trends</span>
            <div
              className="flex items-center gap-0.5 rounded-xl p-1"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {(['Revenue', 'Bookings'] as ChartMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-colors ${
                    chartMode === m ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1" style={{ minHeight: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    chartMode === 'Revenue' ? (v: number) => `$${v / 1000}k` : undefined
                  }
                />
                <Tooltip content={<ChartTooltip mode={chartMode} />} />
                <Bar
                  dataKey={chartMode === 'Revenue' ? 'revenue' : 'bookings'}
                  name={chartMode}
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.85}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom row: Gallery Performance */}
      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-white">Gallery Performance</span>
          <button className="text-[11px] text-white/40 transition-colors hover:text-white/70">
            View all
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Project', 'Views', 'Selections', 'Status'].map((col) => (
                <th
                  key={col}
                  className="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-white/35"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GALLERY_PERFORMANCE.map((row) => (
              <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="py-2.5 pr-2 text-[12px] font-medium text-white/80">{row.name}</td>
                <td className="py-2.5 text-[12px] text-white/55">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-white/30" />
                    {row.views}
                  </div>
                </td>
                <td className="py-2.5 text-[12px] text-white/55">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3 text-white/30" />
                    {row.selections}
                  </div>
                </td>
                <td className="py-2.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: (STATUS_COLORS[row.status] ?? '#FFFFFF') + '20',
                      color: STATUS_COLORS[row.status] ?? '#FFFFFF',
                    }}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
