'use client'

import React, { useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  TrendingUp,
  Eye,
  Target,
  Clock,
  Download,
  Plus,
  ChevronRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type OverviewTab = 'Overview' | 'Content' | 'Finance' | 'Bookings'
type ChartMode = 'Revenue' | 'Bookings'
type ChartRange = '30D' | 'Month'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const KPI_DATA = [
  {
    label: 'Total Revenue',
    value: '$8,240',
    change: '+12%',
    positive: true,
    icon: TrendingUp,
    color: '#34D399',
  },
  {
    label: 'Gallery Views',
    value: '1,847',
    change: '+8%',
    positive: true,
    icon: Eye,
    color: '#60A5FA',
  },
  {
    label: 'Conversion Rate',
    value: '68%',
    change: '+4%',
    positive: true,
    icon: Target,
    color: '#A78BFA',
  },
  {
    label: 'AI Hours Saved',
    value: '142h',
    change: '+22h',
    positive: true,
    icon: Zap,
    color: '#FBBF24',
  },
]

const AI_INSIGHTS = [
  {
    id: 1,
    title: 'Revenue trending up',
    body: 'Your April revenue is 12% higher than March. Wedding season is driving growth.',
    cta: 'View Details',
    color: '#34D399',
  },
  {
    id: 2,
    title: 'Explore content measurement',
    body: 'Link your Instagram to track which posts convert to bookings.',
    cta: 'Connect',
    color: '#60A5FA',
  },
  {
    id: 3,
    title: '3 invoices past due',
    body: 'Send automated reminders to recover $2,100 in outstanding payments.',
    cta: 'Send Reminders',
    color: '#FBBF24',
  },
  {
    id: 4,
    title: 'Gallery engagement high',
    body: 'The "Smith & James Wedding" gallery has 340 views — consider upsell.',
    cta: 'View Gallery',
    color: '#A78BFA',
  },
]

const BAR_DATA_REVENUE = [
  { label: 'Week 1', value: 1840 },
  { label: 'Week 2', value: 2200 },
  { label: 'Week 3', value: 1600 },
  { label: 'Week 4', value: 2600 },
]

const BAR_DATA_BOOKINGS = [
  { label: 'Week 1', value: 5 },
  { label: 'Week 2', value: 8 },
  { label: 'Week 3', value: 4 },
  { label: 'Week 4', value: 7 },
]

const FUNNEL = [
  { label: 'Inquiry', value: 72, color: '#60A5FA' },
  { label: 'Booked', value: 31, color: '#A78BFA' },
  { label: 'Completed', value: 26, color: '#34D399' },
  { label: 'Paid', value: 14, color: '#10B981' },
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

/* ------------------------------------------------------------------ */
/*  Finance tab data (Page 10)                                         */
/* ------------------------------------------------------------------ */

const FINANCE_KPIS = [
  { label: 'Total Revenue', value: '$24,850', change: '+14%', positive: true },
  { label: 'Outstanding', value: '$3,200', change: '-$400', positive: false },
  { label: 'Past Two Months', value: '$8,400', change: '+8%', positive: true },
  { label: 'Avg Project Value', value: '$1,850', change: '+$120', positive: true },
]

const INVOICES = [
  { id: 'INV-047', client: 'Sarah & James Smith', project: 'Wedding June', amount: 3200, oldAmount: 3600, status: 'Pending', date: 'Apr 5, 2026' },
  { id: 'INV-046', client: 'Meridian Hotel', project: 'Brand Shoot', amount: 1800, oldAmount: null, status: 'Paid', date: 'Mar 28, 2026' },
  { id: 'INV-045', client: 'Marcus Cole', project: 'Commercial', amount: 1500, oldAmount: null, status: 'Paid', date: 'Mar 20, 2026' },
  { id: 'INV-044', client: 'Elena Torres', project: 'Portraits', amount: 350, oldAmount: null, status: 'Pending', date: 'Apr 10, 2026' },
  { id: 'INV-043', client: 'James & Priya', project: 'Engagement', amount: 900, oldAmount: null, status: 'Paid', date: 'Mar 15, 2026' },
]

const PAYOUTS = [
  { date: 'Mar 31', amount: '$2,180' },
  { date: 'Mar 20', amount: '$3,420' },
  { date: 'Feb 25', amount: '$4,080' },
]

const MINI_CHART = [30, 45, 38, 60, 52, 70, 65, 80, 75, 90, 85, 100]

/* ------------------------------------------------------------------ */
/*  Shared glass card                                                  */
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

/* ------------------------------------------------------------------ */
/*  Overview tab                                                       */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const [chartMode, setChartMode] = useState<ChartMode>('Revenue')
  const [chartRange, setChartRange] = useState<ChartRange>('30D')

  const barData = chartMode === 'Revenue' ? BAR_DATA_REVENUE : BAR_DATA_BOOKINGS
  const maxBar = Math.max(...barData.map((b) => b.value))
  const funnelMax = FUNNEL[0]?.value ?? 1

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
              <p className="text-[24px] font-bold text-white leading-none">{kpi.value}</p>
              <div className="flex items-center gap-1">
                {kpi.positive ? (
                  <ArrowUpRight className="h-3 w-3" style={{ color: kpi.color }} />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                <span className="text-[11px] font-medium" style={{ color: kpi.color }}>{kpi.change}</span>
                <span className="text-[11px] text-white/30">vs last mo</span>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Middle row: AI Insights + Bar Chart */}
      <div className="grid grid-cols-12 gap-4">
        {/* AI Insights */}
        <GlassCard className="col-span-4 flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">AI Insights</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>

          <div className="flex flex-col gap-2">
            {AI_INSIGHTS.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: insight.color }} />
                  <p className="text-[12px] font-semibold text-white/90">{insight.title}</p>
                </div>
                <p className="text-[11px] text-white/45 pl-4">{insight.body}</p>
                <button className="mt-0.5 flex items-center gap-1 pl-4 text-[11px] font-medium" style={{ color: insight.color }}>
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

        {/* Bar chart */}
        <GlassCard className="col-span-8 flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">Booking & Revenue Trends</span>
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
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
              {/* Range toggle */}
              <div
                className="flex items-center gap-0.5 rounded-xl p-1"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {(['30D', 'Month'] as ChartRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-colors ${
                      chartRange === r ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bars */}
          <div className="flex flex-1 items-end gap-3" style={{ height: '140px' }}>
            {barData.map((bar, i) => {
              const pct = (bar.value / maxBar) * 100
              const isLast = i === barData.length - 1
              return (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] text-white/40">
                    {chartMode === 'Revenue' ? `$${(bar.value / 1000).toFixed(1)}k` : bar.value}
                  </span>
                  <div className="flex w-full items-end" style={{ height: '100px' }}>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${pct}%`,
                        background: isLast
                          ? 'linear-gradient(180deg, #6366F1 0%, #8B5CF6 100%)'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-white/50">{bar.label}</span>
                </div>
              )
            })}
          </div>

          <div
            className="mt-auto flex items-center justify-between pt-3 text-[12px] text-white/40"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span>April 2026</span>
            <span className="font-semibold text-white/70">
              {chartMode === 'Revenue'
                ? `$${barData.reduce((s, b) => s + b.value, 0).toLocaleString()} total`
                : `${barData.reduce((s, b) => s + b.value, 0)} bookings`}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Bottom row: Lead Funnel + Gallery Performance */}
      <div className="grid grid-cols-12 gap-4">
        {/* Lead Funnel */}
        <GlassCard className="col-span-5 p-5">
          <span className="text-[13px] font-semibold text-white">Lead Conversion Funnel</span>
          <div className="mt-4 flex flex-col gap-2">
            {FUNNEL.map((step) => {
              const pct = (step.value / funnelMax) * 100
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-[12px] text-white/60">{step.label}</span>
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{ width: `${pct}%`, background: step.color + '40', borderRight: `3px solid ${step.color}` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[13px] font-bold text-white/80">{step.value}</span>
                </div>
              )
            })}
          </div>
          <div
            className="mt-4 pt-3 text-[11px] text-white/35"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {Math.round((FUNNEL[3]!.value / FUNNEL[0]!.value) * 100)}% end-to-end conversion · Last 90 days
          </div>
        </GlassCard>

        {/* Gallery Performance */}
        <GlassCard className="col-span-7 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold text-white">Gallery Performance</span>
            <button className="text-[11px] text-white/40 hover:text-white/70 transition-colors">View all</button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Project', 'Views', 'Selections', 'Status'].map((col) => (
                  <th key={col} className="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-white/35">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GALLERY_PERFORMANCE.map((row) => (
                <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="py-2.5 text-[12px] font-medium text-white/80 pr-2">{row.name}</td>
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
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Finance tab (Page 10 content)                                      */
/* ------------------------------------------------------------------ */

function FinanceTab() {
  const gradients = [
    { email: 'sarah.smith@gmail.com', color: 'from-teal-400 to-cyan-600' },
    { email: 'meridian@hotel.com', color: 'from-blue-400 to-indigo-600' },
    { email: 'marcus@gmail.com', color: 'from-pink-400 to-rose-600' },
    { email: 'elena@gmail.com', color: 'from-amber-400 to-orange-600' },
    { email: 'james@outlook.com', color: 'from-violet-400 to-purple-600' },
  ]

  const maxMini = Math.max(...MINI_CHART)

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* Finance KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {FINANCE_KPIS.map((kpi) => (
          <GlassCard key={kpi.label} className="flex flex-col gap-2 p-4">
            <span className="text-[11px] text-white/50">{kpi.label}</span>
            <p className="text-[22px] font-bold text-white leading-none">{kpi.value}</p>
            <div className="flex items-center gap-1">
              {kpi.positive ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-[11px] font-medium ${kpi.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.change}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main: Invoices table + right panel */}
      <div className="grid grid-cols-12 gap-4">
        {/* Invoices table */}
        <GlassCard className="col-span-8 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold text-white">Invoices</span>
            <button
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Create Invoice
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Client', 'Project', 'Amount', 'Status', 'Date'].map((col) => (
                  <th key={col} className="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-white/35">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => {
                const grad = gradients[i % gradients.length]!
                const initials = inv.client.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                const isPending = inv.status === 'Pending'
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad.color} text-[10px] font-bold text-white`}>
                          {initials}
                        </div>
                        <span className="text-[12px] font-medium text-white/80">{inv.client}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-[12px] text-white/50">{inv.project}</td>
                    <td className="py-3 pr-2">
                      <div className="flex flex-col">
                        {inv.oldAmount && (
                          <span className="text-[10px] text-white/30 line-through">${inv.oldAmount.toLocaleString()}</span>
                        )}
                        <span className="text-[12px] font-semibold text-white/80">${inv.amount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          background: isPending ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                          color: isPending ? '#FBBF24' : '#34D399',
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-white/40">{inv.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </GlassCard>

        {/* Right panel: Revenue trend + Payouts */}
        <div className="col-span-4 flex flex-col gap-3">
          {/* Mini revenue chart */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-white">Revenue Trend</span>
              <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                {['7D', 'Mo', '3Mo', 'Yr'].map((r) => (
                  <button key={r} className="rounded-md px-2 py-0.5 text-[10px] text-white/50 hover:text-white/80 transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-0.5" style={{ height: '60px' }}>
              {MINI_CHART.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${(v / maxMini) * 100}%`,
                    background: i === MINI_CHART.length - 1
                      ? '#6366F1'
                      : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </GlassCard>

          {/* Payouts */}
          <GlassCard className="flex-1 p-4">
            <span className="text-[12px] font-semibold text-white">Payouts</span>
            <div className="mt-3 flex flex-col gap-2">
              {PAYOUTS.map((p) => (
                <div
                  key={p.date}
                  className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[12px] text-white/60">{p.date}</span>
                  <span className="text-[13px] font-bold text-emerald-400">{p.amount}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Placeholder tabs                                                   */
/* ------------------------------------------------------------------ */

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <p className="text-[14px] font-medium text-white/40">{label}</p>
        <p className="mt-1 text-[12px] text-white/25">Coming soon</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const TABS: OverviewTab[] = ['Overview', 'Content', 'Finance', 'Bookings']

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<OverviewTab>('Overview')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tab bar + header actions */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex items-center gap-1 rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === tab ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
            <Clock className="h-3.5 w-3.5" />
            Last 30 days
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
            <TrendingUp className="h-3.5 w-3.5" />
            Partner Insights
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col overflow-hidden px-6 py-4">
        {activeTab === 'Overview' && <OverviewTab />}
        {activeTab === 'Finance' && <FinanceTab />}
        {activeTab === 'Content' && <PlaceholderTab label="Content Analytics" />}
        {activeTab === 'Bookings' && <PlaceholderTab label="Bookings Analytics" />}
      </div>
    </div>
  )
}
