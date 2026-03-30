'use client'

import { useState } from 'react'
import {
  UserPlus,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react'

/* ── Mock Data ── */

interface Client {
  name: string
  initials: string
  avatarGradient: string
  email: string
  phone: string
  tier: 'Enterprise' | 'Editorial' | 'Boutique'
  lastShoot: string
  ltv: number
}

const CLIENTS: Client[] = [
  {
    name: 'Sarah Mitchell',
    initials: 'SM',
    avatarGradient: 'from-[#ffb780] to-[#d48441]',
    email: 'sarah@mitchell.co',
    phone: '+1 (555) 234-5678',
    tier: 'Enterprise',
    lastShoot: 'Mar 12, 2024',
    ltv: 24800,
  },
  {
    name: 'James Harrington',
    initials: 'JH',
    avatarGradient: 'from-[#95d1d1] to-[#6aabab]',
    email: 'james@harrington.dev',
    phone: '+1 (555) 345-6789',
    tier: 'Editorial',
    lastShoot: 'Feb 28, 2024',
    ltv: 18450,
  },
  {
    name: 'Elena Vasquez',
    initials: 'EV',
    avatarGradient: 'from-[#ffb4a5] to-[#e7765f]',
    email: 'elena@vasquezphoto.com',
    phone: '+1 (555) 456-7890',
    tier: 'Boutique',
    lastShoot: 'Mar 18, 2024',
    ltv: 9200,
  },
  {
    name: 'David Kim',
    initials: 'DK',
    avatarGradient: 'from-[#c4a5ff] to-[#9a6de0]',
    email: 'david@kimstudios.com',
    phone: '+1 (555) 567-8901',
    tier: 'Enterprise',
    lastShoot: 'Mar 22, 2024',
    ltv: 31600,
  },
]

const TIER_STYLES: Record<string, string> = {
  Enterprise:
    'bg-primary/10 text-primary border border-primary/20',
  Editorial:
    'bg-emerald-400/10 text-emerald-400 border border-[#95d1d1]/20',
  Boutique:
    'bg-[#ffb4a5]/10 text-rose-400 border border-[#ffb4a5]/20',
}

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="flex-1 min-w-[140px] bg-surface rounded-xl border border-outline-variant/40 p-4">
      <p className="text-[10px] uppercase tracking-widest font-medium text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

export default function ClientsPage() {
  const [activePage] = useState(1)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Profiles</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Manage your client network and booking history
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              <UserPlus size={15} />
              Invite Client
            </button>
            <button className="flex items-center gap-2 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <CalendarPlus size={15} />
              New Booking
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="flex items-center gap-4 flex-wrap">
          <StatCard label="Total Network" value="142" accent="#95d1d1" />
          <StatCard label="Active This Month" value="28" accent="#ffb780" />
          <StatCard label="Retention Rate" value="84%" accent="#ffb4a5" />

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-sm text-on-surface-variant hover:bg-surface-highest transition-colors">
              All Tiers
              <ChevronDown size={14} className="text-on-surface-variant" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-sm text-on-surface-variant hover:bg-surface-highest transition-colors">
              Last 30 Days
              <ChevronDown size={14} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* ── Client Table ── */}
        <section className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/40">
                  {[
                    'Client Name',
                    'Contact Details',
                    'Tier',
                    'Last Shoot',
                    'LTV (USD)',
                    'Actions',
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3.5 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((client) => (
                  <tr
                    key={client.name}
                    className="border-b border-outline-variant/20 hover:bg-surface-container transition-colors"
                  >
                    {/* Name + Avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${client.avatarGradient} flex items-center justify-center text-xs font-bold text-on-primary`}
                        >
                          {client.initials}
                        </div>
                        <span className="text-sm font-medium text-on-surface">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-on-surface-variant">{client.email}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {client.phone}
                      </p>
                    </td>
                    {/* Tier Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium ${
                          TIER_STYLES[client.tier]
                        }`}
                      >
                        {client.tier}
                      </span>
                    </td>
                    {/* Last Shoot */}
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {client.lastShoot}
                    </td>
                    {/* LTV */}
                    <td className="px-5 py-4 text-sm font-medium text-primary">
                      ${client.ltv.toLocaleString()}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface-variant">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-outline-variant/40">
            <p className="text-xs text-on-surface-variant">
              Showing 1-10 of 142 clients
            </p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3, '...', 15].map((p, i) => (
                <button
                  key={i}
                  className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === activePage
                      ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Bottom Insights ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Projected Revenue */}
          <div className="bg-surface rounded-xl border border-outline-variant/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-medium text-on-surface-variant">
                  Projected Revenue
                </p>
                <p className="text-xl font-bold text-white mt-1">$124,800</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp size={18} className="text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Q1 Target</span>
                <span className="text-primary">78%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441]"
                  style={{ width: '78%' }}
                />
              </div>
            </div>
          </div>

          {/* Network Expansion */}
          <div className="bg-surface rounded-xl border border-outline-variant/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-medium text-on-surface-variant">
                  Network Expansion
                </p>
                <p className="text-xl font-bold text-white mt-1">
                  +12 this month
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-400/10">
                <Users size={18} className="text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['from-[#ffb780] to-[#d48441]', 'from-[#95d1d1] to-[#6aabab]', 'from-[#ffb4a5] to-[#e7765f]', 'from-[#c4a5ff] to-[#9a6de0]', 'from-[#ffb780] to-[#d48441]'].map(
                  (g, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-[#1d1b1a] bg-gradient-to-br ${g}`}
                      style={{ zIndex: 5 - i }}
                    />
                  )
                )}
                <div className="w-8 h-8 rounded-full border-2 border-[#1d1b1a] bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant z-0">
                  +7
                </div>
              </div>
              <span className="text-xs text-on-surface-variant">
                New clients this month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
