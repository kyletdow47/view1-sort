'use client'

import { useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const subTabs = ['Schedule', 'Pipeline', 'Requests', 'Photo Maps'] as const

const inquiries = [
  { name: 'Sarah Mitchell', type: 'Wedding', date: 'Jun 14, 2026', color: 'bg-rose-500' },
  { name: 'James & Priya', type: 'Engagement Session', date: '', color: 'bg-emerald-500' },
  { name: 'Marcus Cole', type: 'Commercial Shoot', date: '', color: 'bg-amber-500' },
  { name: 'Elena Torres', type: 'Portrait Session', date: '', color: 'bg-violet-500' },
]

const eventTypes = [
  { name: 'Wedding', range: '$3,000 – $6,000', active: true },
  { name: 'Portrait Session', range: '$300 – $800', active: true },
  { name: 'Mini Session', range: '$100 – $300', active: false },
  { name: 'Commercial', range: '$600 – $2,000', active: true },
]

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Events on certain dates (1-indexed day of month)
const events: Record<number, string> = { 8: 'bg-green-400', 14: 'bg-red-400', 19: 'bg-blue-400', 24: 'bg-amber-400', 25: 'bg-green-400' }

const legend = [
  { label: 'Past Booking', color: 'bg-green-400' },
  { label: 'Unpaid Booking', color: 'bg-red-400' },
  { label: 'A.I. Event', color: 'bg-blue-400' },
  { label: 'Mini Sessions', color: 'bg-amber-400' },
]

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<string>('Schedule')
  const year = 2026
  const month = 3 // April (0-indexed)
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  return (
    <V2Shell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Sub-tabs */}
        <div className="flex items-center gap-2">
          {subTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-cta text-white' : 'bg-white/10 text-white/70 hover:text-white'}`}
            >{tab}</button>
          ))}
        </div>

        {/* Three-column layout */}
        <div className="flex gap-4">
          {/* Left: Inquiries */}
          <div className="w-[260px] shrink-0">
            <GlassCard className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Inquiries</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                <input type="text" placeholder="Search inquiries..." className="w-full rounded-lg border border-white/15 bg-white/8 py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-white/40 focus:outline-none" />
              </div>
              <div className="space-y-2">
                {inquiries.map((inq) => (
                  <div key={inq.name} className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className={`h-8 w-8 shrink-0 rounded-full ${inq.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                      {inq.name.split(' ')[0][0]}{inq.name.split(' ')[1]?.[0] || ''}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{inq.name}</p>
                      <p className="text-[11px] text-white/50">{inq.type}</p>
                      {inq.date && <p className="text-[10px] text-white/30">{inq.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Center: Calendar */}
          <div className="flex-1">
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">April 2026</h2>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
                    <button className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
                  <ExternalLink className="h-3 w-3" /> View Public Page
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((d) => (
                  <div key={d} className="text-center text-[10px] font-medium uppercase text-white/40 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                  <div key={i} className={`relative flex h-12 items-center justify-center rounded-lg text-sm transition-colors ${day ? 'text-white/80 hover:bg-white/10 cursor-pointer' : ''}`}>
                    {day}
                    {day && events[day] && (
                      <div className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${events[day]}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex gap-4">
                {legend.map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-white/40">{l.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right: Event Types */}
          <div className="w-[240px] shrink-0">
            <GlassCard className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Event Types</h3>
              <div className="space-y-3">
                {eventTypes.map((et) => (
                  <div key={et.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{et.name}</p>
                      <p className="text-[10px] text-white/40">{et.range}</p>
                    </div>
                    <div className={`h-5 w-9 rounded-full p-0.5 ${et.active ? 'bg-indigo-600' : 'bg-white/20'}`}>
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${et.active ? 'translate-x-4' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs text-white/60 hover:text-white transition-colors">
                <Plus className="h-3 w-3" /> New Type
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </V2Shell>
  )
}
