'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Plus, ExternalLink } from 'lucide-react'
import type { Booking } from '@/types/supabase'

interface EventType {
  name: string
  price: string
  duration: string
  color: string
  enabled: boolean
}

const DEFAULT_EVENT_TYPES: EventType[] = [
  { name: 'Wedding', price: '$2,000 – $5,000', duration: '8h', color: '#34D399', enabled: true },
  { name: 'Portrait Session', price: '$300 – $800', duration: '2h', color: '#60A5FA', enabled: true },
  { name: 'Mini Session', price: '$150 – $300', duration: '45m', color: '#F472B6', enabled: true },
  { name: 'Commercial', price: '$1,000+', duration: '4h', color: '#FBBF24', enabled: false },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TABS = ['Schedule', 'Pipeline', 'Packages', 'Photo Page']

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? 'bg-indigo-500' : 'bg-white/20'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

interface BookingScheduleViewProps {
  bookings: Booking[]
  workspaceId: string
}

export function BookingScheduleView({ bookings, workspaceId }: BookingScheduleViewProps) {
  const [activeTab, setActiveTab] = useState('Schedule')
  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypes, setEventTypes] = useState<EventType[]>(DEFAULT_EVENT_TYPES)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete rows
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  // Map booked days
  const bookedDays = new Map<number, { color: string; count: number }>()
  bookings.forEach((b) => {
    const d = new Date(b.shoot_date + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      const existing = bookedDays.get(day)
      bookedDays.set(day, { color: '#60A5FA', count: (existing?.count ?? 0) + 1 })
    }
  })

  // Mock booked days for demo
  const mockBookedDays: Record<number, string> = {
    8: '#34D399',
    14: '#60A5FA',
    15: '#F472B6',
    22: '#34D399',
    25: '#60A5FA',
  }

  // Inquiries from bookings
  const inquiries = bookings.slice(0, 6)
  const filteredInquiries = inquiries.filter(b =>
    b.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleEventType = (index: number) => {
    setEventTypes(prev => prev.map((et, i) => i === index ? { ...et, enabled: !et.enabled } : et))
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Tab bar */}
      <div
        className="flex shrink-0 items-center justify-between px-10 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-1.5 text-[13px] font-medium transition-colors ${activeTab === tab ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/60 hover:text-white/80'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <a
          href="#"
          className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white/80 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Photo Page
        </a>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden gap-4 px-6 py-5">

        {/* Left: Inquiries */}
        <div
          className="flex w-[240px] shrink-0 flex-col gap-3 rounded-2xl p-4"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">Inquiries</span>
            <button className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/50 transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inquiries…"
              className="h-8 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-8 pr-3 text-[12px] text-white placeholder:text-white/30 outline-none focus:border-indigo-400/40"
            />
          </div>

          {/* Client list */}
          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
            {filteredInquiries.length > 0 ? filteredInquiries.map((b) => {
              const initials = b.client_name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
              const gradients = ['from-teal-400 to-cyan-600', 'from-blue-400 to-indigo-600', 'from-pink-400 to-rose-600', 'from-amber-400 to-orange-600']
              const grad = gradients[b.client_name.charCodeAt(0) % gradients.length]
              return (
                <button
                  key={b.id}
                  className="flex items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-[11px] font-bold text-white`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-white/90">{b.client_name}</p>
                    <p className="truncate text-[11px] text-white/40">{b.package_type ?? 'Wedding Session'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                    {b.amount_cents ? `$${Math.floor(b.amount_cents / 100)}` : 'TBD'}
                  </span>
                </button>
              )
            }) : (
              // Mock data for empty state
              [
                { name: 'Sarah Mitchell', type: 'Wedding · June 13th 2026', price: 'Pros.', color: 'from-teal-400 to-cyan-600' },
                { name: 'James & Priya', type: 'Engagement Session', price: '$900', color: 'from-blue-400 to-indigo-600' },
                { name: 'Marcus Cole', type: 'Commercial Shoot', price: '$1.5k', color: 'from-pink-400 to-rose-600' },
                { name: 'Elena Torres', type: 'Portrait Session', price: '$350', color: 'from-amber-400 to-orange-600' },
              ].map((client) => (
                <button key={client.name} className="flex items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-white/10">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${client.color} text-[11px] font-bold text-white`}>
                    {client.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-white/90">{client.name}</p>
                    <p className="truncate text-[11px] text-white/40">{client.type}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">{client.price}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center: Calendar */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Calendar header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="rounded-lg border border-white/15 p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[16px] font-semibold text-white">{monthName}</span>
              <button onClick={nextMonth} className="rounded-lg border border-white/15 p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div
            className="flex-1 overflow-hidden rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {/* Day headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-white/40">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => {
                const dotColor = day ? (mockBookedDays[day] ?? bookedDays.get(day)?.color) : null
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                return (
                  <div
                    key={i}
                    className={`relative flex aspect-square items-center justify-center rounded-xl text-[13px] transition-colors ${day ? 'cursor-pointer hover:bg-white/10' : ''} ${isToday ? 'bg-indigo-500/30 font-bold text-white ring-1 ring-indigo-400/50' : day ? 'text-white/80' : ''}`}
                  >
                    {day && (
                      <>
                        <span>{day}</span>
                        {dotColor && (
                          <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: dotColor }} />
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4">
              {[
                { color: '#34D399', label: 'Wedding Booking' },
                { color: '#60A5FA', label: 'Portrait/Branding' },
                { color: '#F472B6', label: 'Floral' },
                { color: '#F87171', label: 'Mini Session' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[11px] text-white/40">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Event Types */}
        <div
          className="flex w-[220px] shrink-0 flex-col gap-4 rounded-2xl p-4"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <span className="text-[13px] font-semibold text-white">Event Types</span>

          <div className="flex flex-col gap-3">
            {eventTypes.map((et, i) => (
              <div key={et.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: et.color }} />
                    <span className="text-[13px] font-medium text-white/90">{et.name}</span>
                  </div>
                  <Toggle on={et.enabled} onChange={() => toggleEventType(i)} />
                </div>
                <p className="pl-4.5 text-[11px] text-white/40">{et.price} · {et.duration}</p>
                <div className="h-px w-full bg-white/[0.08]" />
              </div>
            ))}
          </div>

          <button className="text-left text-[12px] font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
            + New Type
          </button>
        </div>
      </div>
    </div>
  )
}
