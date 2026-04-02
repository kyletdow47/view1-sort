'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Brain,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const subTabs = ['Overview', 'Content', 'Finance', 'Bookings'] as const

const stats = [
  { label: 'Total Revenue', value: '$8,240', sub: '+12% vs last month', icon: DollarSign, color: 'var(--chart-emerald)' },
  { label: 'Gallery Views', value: '1,847', sub: 'this month', icon: Eye, color: 'var(--chart-blue)' },
  { label: 'Conversion Rate', value: '68%', sub: 'inquiry → booked', icon: TrendingUp, color: 'var(--chart-amber)' },
  { label: 'AI Hours Saved', value: '142h', sub: 'this quarter', icon: Clock, color: 'var(--chart-violet)' },
]

const revenueData = [
  { month: 'Oct', revenue: 4200 },
  { month: 'Nov', revenue: 5800 },
  { month: 'Dec', revenue: 7200 },
  { month: 'Jan', revenue: 3900 },
  { month: 'Feb', revenue: 6100 },
  { month: 'Mar', revenue: 8240 },
]

const funnelStages = [
  { label: 'Inquiry', count: 45, pct: 100 },
  { label: 'Quoted', count: 32, pct: 71 },
  { label: 'Booked', count: 22, pct: 49 },
  { label: 'Completed', count: 18, pct: 40 },
  { label: 'Paid', count: 16, pct: 36 },
]

const galleryPerformance = [
  { name: 'Johnson Wedding', views: 3241, pct: 94 },
  { name: 'Chen Corporate', views: 1204, pct: 78 },
  { name: 'Monterey Portrait', views: 892, pct: 65 },
  { name: 'Park Family Selection', views: 645, pct: 52 },
  { name: 'Kim Engagement', views: 421, pct: 38 },
]

const insights = [
  { text: 'Revenue trending up — bookings increased 18% vs last month.', color: 'text-emerald-400' },
  { text: 'Autumn engagement peak — October has historically been your busiest month.', color: 'text-amber-400' },
  { text: '3 invoices overdue — total outstanding: $3,200.', color: 'text-red-400' },
  { text: 'AI sorting efficiency +8% — model accuracy improved after style profile update.', color: 'text-blue-400' },
]

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(26,24,46,0.92)', border: '1px solid rgba(255,255,255,0.18)' }}>
      <p className="font-semibold text-white/90">{label}</p>
      <p className="font-mono text-emerald-400">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview')

  return (
    <V2Shell activeNav="Analytics">
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold text-white">Analytics</h1>
            <p className="mt-1 text-sm text-white/60">AI-powered business intelligence &amp; performance insights</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/70 hover:text-white">Last 30 days</button>
            <button className="flex items-center gap-2 rounded-xl bg-indigo-600/50 px-4 py-2 text-sm text-white hover:bg-indigo-600/70">
              <Brain className="h-4 w-4" /> AI Perform Insights
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2">
          {subTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:text-white'}`}
            >{tab}</button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <GlassCard key={s.label}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">{s.label}</span>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <p className="mt-2 font-mono text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-[11px] text-white/40">{s.sub}</p>
              </GlassCard>
            )
          })}
        </div>

        {/* AI Insights + Revenue Chart */}
        <div className="grid grid-cols-3 gap-4">
          {/* AI Insights */}
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">AI Insights</h3>
            </div>
            <div className="space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 p-2.5">
                  <div className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${ins.color.replace('text-', 'bg-')}`} />
                  <p className="text-xs leading-relaxed text-white/70">{ins.text}</p>
                </div>
              ))}
            </div>
            <button className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
              Generate Report
            </button>
          </GlassCard>

          {/* Revenue Chart */}
          <GlassCard className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={14} style={{ color: 'var(--chart-emerald)' }} />
              <h3 className="text-sm font-semibold text-white/95">Booking &amp; Revenue Trends</h3>
              <span className="ml-auto text-[11px] text-white/40">6-month view</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.50)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.50)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--chart-emerald)" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Funnel + Gallery Performance */}
        <div className="grid grid-cols-2 gap-4">
          {/* Funnel */}
          <GlassCard>
            <h3 className="mb-4 text-sm font-semibold text-white">Lead Conversion Funnel</h3>
            <div className="space-y-2">
              {funnelStages.map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-white/60">{stage.label}</span>
                  <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                    <div className="h-full rounded-lg bg-indigo-500/60" style={{ width: `${stage.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-white/70">{stage.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Gallery Performance */}
          <GlassCard>
            <h3 className="mb-4 text-sm font-semibold text-white">Gallery Performance</h3>
            <div className="space-y-3">
              {galleryPerformance.map((g) => (
                <div key={g.name} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">{g.name}</p>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/50">{g.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </V2Shell>
  )
}
