'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  AlertTriangle,
  DollarSign,
  Download,
  FileText,
  Plus,
  Printer,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const subTabs = ['Overview', 'Content', 'Finance', 'Bookings'] as const

const stats = [
  { label: 'Total Revenue', value: '$24,850', sub: 'year to date', icon: DollarSign, color: 'var(--chart-emerald)' },
  { label: 'Outstanding', value: '$3,200', sub: '4 unpaid invoices', icon: AlertTriangle, color: 'var(--chart-amber)' },
  { label: 'Next Tax Month', value: '$8,400', sub: 'estimated Q2', icon: FileText, color: 'var(--chart-blue)' },
  { label: 'Avg Project Value', value: '$1,850', sub: 'per project', icon: DollarSign, color: 'var(--chart-violet)' },
]

const invoices = [
  { client: 'Sarah Chen', project: 'Wedding Montage', amount: '$4,250', due: 'Apr 22', status: 'Due', statusColor: 'bg-amber-500/20 text-amber-400', color: 'bg-rose-500' },
  { client: 'James Wilson', project: 'Corporate Headshots', amount: '$1,800', due: 'Mar 15', status: 'Paid', statusColor: 'bg-emerald-500/20 text-emerald-400', color: 'bg-emerald-500' },
  { client: 'Maria Garcia', project: 'Engagement Shoot', amount: '$950', due: 'Apr 30', status: 'Pending', statusColor: 'bg-amber-500/20 text-amber-400', color: 'bg-amber-500' },
  { client: 'Alex Thompson', project: 'Product Photography', amount: '$2,400', due: 'Apr 18', status: 'Due', statusColor: 'bg-amber-500/20 text-amber-400', color: 'bg-violet-500' },
  { client: 'Emma Davis', project: 'Family Portrait', amount: '$750', due: 'Apr 25', status: 'Paid', statusColor: 'bg-emerald-500/20 text-emerald-400', color: 'bg-blue-500' },
  { client: 'David Kim', project: 'Event Coverage', amount: '$3,800', due: 'May 1', status: 'Pending', statusColor: 'bg-amber-500/20 text-amber-400', color: 'bg-cyan-500' },
]

const revenueData = [
  { month: 'Oct', revenue: 3200 },
  { month: 'Nov', revenue: 4100 },
  { month: 'Dec', revenue: 5800 },
  { month: 'Jan', revenue: 3400 },
  { month: 'Feb', revenue: 4900 },
  { month: 'Mar', revenue: 6200 },
]

const payouts = [
  { date: 'Mar 30 Payout', amount: '$4,250', status: 'Completed' },
  { date: 'Mar 14 Payout', amount: '$2,800', status: 'Completed' },
  { date: 'Feb 28 Payout', amount: '$3,600', status: 'Completed' },
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

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<string>('Finance')

  return (
    <V2Shell>
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h1 className="font-headline text-4xl font-bold text-white">Analytics</h1>
          <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2">
          {subTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-cta text-white' : 'bg-white/10 text-white/70 hover:text-white'}`}
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

        {/* Invoices + Revenue/Payouts */}
        <div className="grid grid-cols-3 gap-4">
          {/* Invoices table */}
          <GlassCard noPad className="col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Invoices</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1 text-[10px] text-white/50 hover:text-white">
                  <Download className="h-3 w-3" /> Export CSV
                </button>
                <button className="flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1 text-[10px] text-white/50 hover:text-white">
                  <Printer className="h-3 w-3" /> Print
                </button>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8">
                  {['Client', 'Project', 'Amount/Due', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium uppercase tracking-wider text-white/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.client} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full ${inv.color} flex items-center justify-center text-[8px] font-bold text-white`}>
                          {inv.client.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-white/90">{inv.client}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{inv.project}</td>
                    <td className="px-4 py-3 font-mono text-white/80">{inv.amount}<span className="text-white/30 ml-1">{inv.due}</span></td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${inv.statusColor}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>

          {/* Right column */}
          <div className="space-y-4">
            {/* Revenue Trend */}
            <GlassCard>
              <h3 className="mb-3 text-sm font-semibold text-white">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--chart-soft-indigo)" fill="rgba(129,140,248,0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Payouts */}
            <GlassCard>
              <h3 className="mb-3 text-sm font-semibold text-white">Payouts</h3>
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div key={p.date} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <div>
                      <p className="text-xs text-white/80">{p.date}</p>
                      <p className="text-[10px] text-white/40">{p.status}</p>
                    </div>
                    <span className="font-mono text-sm font-medium text-emerald-400">{p.amount}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </V2Shell>
  )
}
