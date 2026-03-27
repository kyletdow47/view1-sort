'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ChevronRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import type { UserTier } from '@/types/supabase'
import { PLANS, formatPrice } from '@/lib/stripe/plans'

/* ── Types ── */

export interface TransactionRow {
  id: string
  description: string
  status: 'Paid' | 'Pending' | 'Refunded'
  amount: number
  created: number
}

type ConnectStatus = 'connected' | 'onboarding' | 'not_connected' | 'error'

interface BillingViewProps {
  tier: UserTier
  connectStatus: ConnectStatus
  balance: { available: number; pending: number }
  transactions: TransactionRow[]
  connectAccountId?: string
  isDemo?: boolean
}

/* ── Helpers ── */

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-[#95d1d1]/10 text-[#95d1d1] border border-[#95d1d1]/20',
  Pending: 'bg-[#ffb780]/10 text-[#ffb780] border border-[#ffb780]/20',
  Refunded: 'bg-[#ffb4a5]/10 text-[#ffb4a5] border border-[#ffb4a5]/20',
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── SVG Charts ── */

function RevenueChart({ amounts }: { amounts: number[] }) {
  const points = amounts.length > 0 ? amounts : [0]
  const max = Math.max(...points, 1)
  const w = 480
  const h = 120
  const step = w / Math.max(points.length - 1, 1)

  const pathD = points
    .map((p, i) => {
      const x = i * step
      const y = h - (p / max) * h
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[120px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb780" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffb780" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#ffb780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Component ── */

export function BillingView({
  tier,
  connectStatus,
  balance,
  transactions,
  connectAccountId,
  isDemo,
}: BillingViewProps) {
  const plan = PLANS[tier] ?? PLANS.free
  const totalRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0)

  const chartAmounts = transactions
    .filter((t) => t.status === 'Paid')
    .reverse()
    .map((t) => t.amount)

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {isDemo && (
          <div className="rounded-lg border border-[#ffb780]/30 bg-[#ffb780]/5 px-4 py-2 text-sm text-[#ffb780]">
            Demo mode — showing sample data
          </div>
        )}

        {/* ── Top Row: Revenue + Plan ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Total Revenue Card */}
          <div className="lg:col-span-8 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                Total Revenue
              </p>
              {transactions.length > 0 && (
                <div className="flex items-center gap-1 text-[#95d1d1]">
                  <TrendingUp size={14} />
                  <span className="text-xs font-medium">{transactions.length} transactions</span>
                </div>
              )}
            </div>
            <p className="text-4xl font-bold text-white mb-6">{formatCents(totalRevenue)}</p>
            <RevenueChart amounts={chartAmounts} />
          </div>

          {/* Current Plan */}
          <div className="lg:col-span-4 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6 flex flex-col">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-4">
              Current Plan
            </p>
            <p className="text-2xl font-bold text-white">{plan.name}</p>
            <p className="text-lg text-[#ffb780] font-semibold mt-1">
              {formatPrice(plan.priceMonthly)}
            </p>
            <p className="text-xs text-[#a18d80] mt-2 flex-1">{plan.description}</p>
            <Link
              href="/dashboard/settings"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#534439] px-4 py-2.5 text-sm font-medium text-[#d9c2b4] hover:bg-[#2c2928] transition-colors"
            >
              Manage Plan
              <ChevronRight size={14} className="text-[#a18d80]" />
            </Link>
          </div>
        </div>

        {/* ── Stripe Connect Section ── */}
        <div className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#ffb780]/10">
              <CreditCard size={20} className="text-[#ffb780]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                Stripe Connect
              </p>
              <p className="text-xs text-[#a18d80] mt-0.5">
                {connectStatus === 'connected' && 'Connected \u00B7 Auto payouts enabled'}
                {connectStatus === 'onboarding' && 'Onboarding in progress'}
                {connectStatus === 'not_connected' && 'Not connected yet'}
                {connectStatus === 'error' && 'Unable to fetch account status'}
              </p>
            </div>
          </div>

          {connectStatus === 'not_connected' ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#a18d80] mb-4">
                Connect your Stripe account to accept payments from clients and receive payouts.
              </p>
              <Link
                href="/dashboard/settings/connect"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={14} />
                Set Up Stripe Connect
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance */}
              <div className="bg-[#211f1e] rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-2">
                  Available Balance
                </p>
                <p className="text-3xl font-bold text-white">{formatCents(balance.available)}</p>
              </div>

              {/* Incoming */}
              <div className="bg-[#211f1e] rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-2">
                  Incoming (Pending)
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownLeft size={16} className="text-[#95d1d1]" />
                  <p className="text-3xl font-bold text-white">{formatCents(balance.pending)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-[#211f1e] rounded-xl p-5 flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-3">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#534439] text-sm font-medium text-[#d9c2b4] hover:bg-[#2c2928] transition-colors">
                    View Payout History
                    <ChevronRight size={14} className="text-[#a18d80]" />
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-semibold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                    <ArrowUpRight size={14} />
                    Stripe Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Transactions Table ── */}
        <section className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#534439]/40">
            <h2 className="text-lg font-semibold text-white">
              Recent Transactions
            </h2>
          </div>
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#a18d80]">
              No transactions yet. Once clients start paying, they&apos;ll appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#534439]/40">
                    {['ID', 'Description', 'Status', 'Amount', 'Date'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-6 py-3.5 text-[10px] uppercase tracking-widest font-medium text-[#a18d80]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b border-[#534439]/20 hover:bg-[#211f1e] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-[#a18d80]">
                        {txn.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#d9c2b4]">
                        {txn.description}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium ${
                            STATUS_STYLES[txn.status] ?? ''
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {txn.status === 'Refunded' ? '-' : ''}
                        {formatCents(txn.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#a18d80]">
                        {formatDate(txn.created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
