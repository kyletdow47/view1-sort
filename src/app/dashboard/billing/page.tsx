'use client'

import { useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

/* ── Mock Data ── */

interface Transaction {
  id: string
  client: string
  service: string
  status: 'Paid' | 'Pending' | 'Refunded'
  amount: number
  date: string
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-4821',
    client: 'Sarah Mitchell',
    service: 'Wedding Package',
    status: 'Paid',
    amount: 4200,
    date: 'Mar 22, 2024',
  },
  {
    id: 'TXN-4820',
    client: 'James Harrington',
    service: 'Editorial Shoot',
    status: 'Paid',
    amount: 1800,
    date: 'Mar 20, 2024',
  },
  {
    id: 'TXN-4819',
    client: 'Elena Vasquez',
    service: 'Preset Bundle',
    status: 'Pending',
    amount: 89,
    date: 'Mar 19, 2024',
  },
  {
    id: 'TXN-4818',
    client: 'David Kim',
    service: 'Portrait Session',
    status: 'Refunded',
    amount: 650,
    date: 'Mar 18, 2024',
  },
  {
    id: 'TXN-4817',
    client: 'Olivia Chen',
    service: 'Event Coverage',
    status: 'Paid',
    amount: 3400,
    date: 'Mar 15, 2024',
  },
]

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-[#95d1d1]/10 text-[#95d1d1] border border-[#95d1d1]/20',
  Pending: 'bg-[#ffb780]/10 text-[#ffb780] border border-[#ffb780]/20',
  Refunded: 'bg-[#ffb4a5]/10 text-[#ffb4a5] border border-[#ffb4a5]/20',
}

const PRESETS = [
  { name: 'Golden Hour', percent: 82, sales: 246 },
  { name: 'Film Tone', percent: 68, sales: 204 },
  { name: 'Moody Portraits', percent: 54, sales: 162 },
  { name: 'Clean & Bright', percent: 41, sales: 123 },
]

/* ── SVG Line Chart (Revenue Trend) ── */
function RevenueChart() {
  const points = [
    10, 18, 14, 24, 20, 32, 28, 38, 34, 42, 48, 52, 46, 58, 62, 56, 68, 72,
    64, 78, 84,
  ]
  const max = Math.max(...points)
  const w = 480
  const h = 120
  const step = w / (points.length - 1)

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

/* ── Radial Chart (Avg Booking Value) ── */
function RadialChart() {
  const current = 1200
  const goal = 1500
  const pct = current / goal
  const r = 52
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#2c2928"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="url(#radialGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <defs>
          <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb780" />
            <stop offset="100%" stopColor="#d48441" />
          </linearGradient>
        </defs>
        <text
          x="70"
          y="64"
          textAnchor="middle"
          fill="#e7e1df"
          fontSize="20"
          fontWeight="700"
        >
          $1.2k
        </text>
        <text
          x="70"
          y="82"
          textAnchor="middle"
          fill="#a18d80"
          fontSize="11"
        >
          / $1.5k goal
        </text>
      </svg>
    </div>
  )
}

export default function BillingPage() {
  const [activeTab] = useState('overview')
  void activeTab

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {/* ── Top Row: Revenue + Radial + Presets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Total Revenue Card */}
          <div className="lg:col-span-6 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                Total Revenue
              </p>
              <div className="flex items-center gap-1 text-[#95d1d1]">
                <TrendingUp size={14} />
                <span className="text-xs font-medium">+18.2%</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-6">$84,230.00</p>
            <RevenueChart />
          </div>

          {/* Avg Booking Value */}
          <div className="lg:col-span-3 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-4">
              Avg Booking Value
            </p>
            <RadialChart />
          </div>

          {/* Best Selling Presets */}
          <div className="lg:col-span-3 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-4">
              Best Selling Presets
            </p>
            <div className="space-y-4">
              {PRESETS.map((preset) => (
                <div key={preset.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[#d9c2b4]">
                      {preset.name}
                    </span>
                    <span className="text-xs text-[#a18d80]">
                      {preset.sales} sold
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#2c2928] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441]"
                      style={{ width: `${preset.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
                Connected &middot; Auto payouts enabled
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance */}
            <div className="bg-[#211f1e] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-2">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-white">$12,450.80</p>
              <p className="text-xs text-[#a18d80] mt-2">
                Next payout: <span className="text-[#95d1d1]">Mar 28, 2024</span>
              </p>
            </div>

            {/* Incoming */}
            <div className="bg-[#211f1e] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-2">
                Incoming (Pending)
              </p>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={16} className="text-[#95d1d1]" />
                <p className="text-3xl font-bold text-white">$4,289.00</p>
              </div>
              <p className="text-xs text-[#a18d80] mt-2">
                3 payments processing
              </p>
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
                  Withdraw Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Transactions Table ── */}
        <section className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#534439]/40">
            <h2 className="text-lg font-semibold text-white">
              Recent Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#534439]/40">
                  {[
                    'Transaction ID',
                    'Client',
                    'Service / Product',
                    'Status',
                    'Amount',
                  ].map((col) => (
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
                {TRANSACTIONS.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-[#534439]/20 hover:bg-[#211f1e] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-[#a18d80]">
                      {txn.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#d9c2b4]">
                      {txn.client}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#d9c2b4]">
                      {txn.service}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium ${
                          STATUS_STYLES[txn.status]
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {txn.status === 'Refunded' ? '-' : ''}$
                      {txn.amount.toLocaleString()}.00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* View All Link */}
          <div className="px-6 py-4 border-t border-[#534439]/40 text-center">
            <button className="text-sm font-medium text-[#ffb780] hover:text-[#d48441] transition-colors">
              View all 1,240 transactions &rarr;
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
