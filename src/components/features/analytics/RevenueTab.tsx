'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Plus, Download } from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DateRange, InvoiceRow, PayoutRow } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const FINANCE_KPIS = [
  { label: 'Total Revenue', value: '$24,850', change: '+14%', positive: true },
  { label: 'Outstanding', value: '$3,200', change: '-$400', positive: false },
  { label: 'Avg Project Value', value: '$1,850', change: '+$120', positive: true },
  { label: 'Stripe Payouts', value: '$21,650', change: '+11%', positive: true },
]

const INVOICES: InvoiceRow[] = [
  { id: 'INV-047', client: 'Sarah & James Smith', project: 'Wedding June', amount: 3200, oldAmount: 3600, status: 'Pending', date: 'Apr 5, 2026' },
  { id: 'INV-046', client: 'Meridian Hotel', project: 'Brand Shoot', amount: 1800, oldAmount: null, status: 'Paid', date: 'Mar 28, 2026' },
  { id: 'INV-045', client: 'Marcus Cole', project: 'Commercial', amount: 1500, oldAmount: null, status: 'Paid', date: 'Mar 20, 2026' },
  { id: 'INV-044', client: 'Elena Torres', project: 'Portraits', amount: 350, oldAmount: null, status: 'Pending', date: 'Apr 10, 2026' },
  { id: 'INV-043', client: 'James & Priya', project: 'Engagement', amount: 900, oldAmount: null, status: 'Paid', date: 'Mar 15, 2026' },
  { id: 'INV-042', client: 'Chen Family', project: 'Newborn Session', amount: 650, oldAmount: null, status: 'Overdue', date: 'Mar 1, 2026' },
]

const PAYOUTS: PayoutRow[] = [
  { date: 'Mar 31', amount: '$2,180', status: 'Completed', transferId: 'tr_abc123' },
  { date: 'Mar 20', amount: '$3,420', status: 'Completed', transferId: 'tr_def456' },
  { date: 'Feb 25', amount: '$4,080', status: 'Completed', transferId: 'tr_ghi789' },
]

const REVENUE_BY_MONTH = [
  { month: 'Oct', revenue: 3200, bookings: 2100, gallery: 1100 },
  { month: 'Nov', revenue: 4100, bookings: 2800, gallery: 1300 },
  { month: 'Dec', revenue: 5800, bookings: 4000, gallery: 1800 },
  { month: 'Jan', revenue: 3400, bookings: 2100, gallery: 1300 },
  { month: 'Feb', revenue: 4900, bookings: 3200, gallery: 1700 },
  { month: 'Mar', revenue: 6200, bookings: 4100, gallery: 2100 },
]

const STATUS_STYLES: Record<InvoiceRow['status'], string> = {
  Paid: 'bg-emerald-400/15 text-emerald-400',
  Pending: 'bg-amber-400/15 text-amber-400',
  Overdue: 'bg-red-400/15 text-red-400',
}

const AVATAR_GRADIENTS = [
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-indigo-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-teal-600',
]

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
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
      className={`rounded-2xl ${noPad ? '' : 'p-5'} ${className}`}
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

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'rgba(26,24,46,0.95)', border: '1px solid rgba(255,255,255,0.18)' }}
    >
      <p className="mb-1 font-semibold text-white/80">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono" style={{ color: p.color }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

interface RevenueTabProps {
  dateRange: DateRange
}

export function RevenueTab({ dateRange }: RevenueTabProps) {
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false)
  // TODO(analytics-api): fetch real revenue data for dateRange
  void dateRange
  void showInvoiceCreator

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {FINANCE_KPIS.map((kpi) => (
          <GlassCard key={kpi.label}>
            <span className="text-[11px] text-white/50">{kpi.label}</span>
            <p className="mt-1.5 font-mono text-[22px] font-bold leading-none text-white">{kpi.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {kpi.positive ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span
                className={`text-[11px] font-medium ${kpi.positive ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {kpi.change}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Revenue breakdown chart */}
      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-white">Revenue by Source</span>
          <span className="text-[11px] text-white/40">Last 6 months</span>
        </div>
        <div style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_BY_MONTH} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${v / 1000}k`}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar
                dataKey="bookings"
                name="Bookings"
                fill="#6366F1"
                fillOpacity={0.85}
                stackId="a"
                isAnimationActive={false}
              />
              <Bar
                dataKey="gallery"
                name="Gallery"
                fill="#34D399"
                fillOpacity={0.85}
                stackId="a"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.50)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Invoices + Payouts */}
      <div className="grid grid-cols-12 gap-4">
        {/* Invoices table */}
        <GlassCard className="col-span-8" noPad>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-[13px] font-semibold text-white">Invoices</span>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white/80">
                <Download className="h-3 w-3" />
                Export CSV
              </button>
              <button
                onClick={() => setShowInvoiceCreator(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
              >
                <Plus className="h-3 w-3" />
                Create Invoice
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Client', 'Project', 'Amount', 'Status', 'Date'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-white/35"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => {
                const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]!
                const initials = inv.client
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                return (
                  <tr
                    key={inv.id}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-[10px] font-bold text-white`}
                        >
                          {initials}
                        </div>
                        <span className="text-[12px] font-medium text-white/80">{inv.client}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-white/50">{inv.project}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        {inv.oldAmount !== null && (
                          <span className="font-mono text-[10px] text-white/30 line-through">
                            ${inv.oldAmount.toLocaleString()}
                          </span>
                        )}
                        <span className="font-mono text-[12px] font-semibold text-white/80">
                          ${inv.amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[inv.status]}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-white/40">{inv.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </GlassCard>

        {/* Payouts panel */}
        <GlassCard className="col-span-4 flex flex-col gap-4">
          <span className="text-[13px] font-semibold text-white">Stripe Payouts</span>
          {/* TODO(stripe-connect): replace with real payout data from /api/analytics/payouts */}
          <div className="flex flex-col gap-2">
            {PAYOUTS.map((p) => (
              <div
                key={p.date}
                className="flex items-center justify-between rounded-xl px-3 py-3"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <p className="text-[12px] font-medium text-white/80">{p.date}</p>
                  <p className="font-mono text-[10px] text-white/30">{p.transferId ?? 'Pending transfer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[14px] font-bold text-emerald-400">{p.amount}</p>
                  <span
                    className={`text-[9px] font-medium uppercase tracking-wider ${
                      p.status === 'Completed' ? 'text-emerald-400/70' : 'text-amber-400/70'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-auto pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[11px] text-white/35">
              Payouts via Stripe Connect · 2-day rolling basis
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
