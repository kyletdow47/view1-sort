'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CalListEvent {
  id: string
  day: number
  month: number // 0-indexed
  year: number
  name: string
  time: string
  color: string
}

const MOCK_EVENTS: CalListEvent[] = [
  { id: 'e1', day: 5,  month: 3, year: 2026, name: 'Wedding Shoot',        time: '9:00 AM',  color: '#34D399' },
  { id: 'e2', day: 8,  month: 3, year: 2026, name: 'Portrait Session',     time: '2:00 PM',  color: '#60A5FA' },
  { id: 'e3', day: 8,  month: 3, year: 2026, name: 'Mini Session',         time: '4:30 PM',  color: '#F472B6' },
  { id: 'e4', day: 12, month: 3, year: 2026, name: 'Commercial Shoot',     time: '10:00 AM', color: '#FBBF24' },
  { id: 'e5', day: 14, month: 3, year: 2026, name: 'Family Portraits',     time: '11:00 AM', color: '#60A5FA' },
  { id: 'e6', day: 19, month: 3, year: 2026, name: 'Engagement Session',   time: '3:00 PM',  color: '#34D399' },
  { id: 'e7', day: 22, month: 3, year: 2026, name: 'Wedding Consultation', time: '9:30 AM',  color: '#A78BFA' },
  { id: 'e8', day: 25, month: 3, year: 2026, name: 'Branding Shoot',       time: '1:00 PM',  color: '#FBBF24' },
]

interface CalListViewProps {
  events?: CalListEvent[]
}

export function CalListView({ events = MOCK_EVENTS }: CalListViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const monthEvents = events
    .filter((e) => e.year === year && e.month === month)
    .sort((a, b) => a.day - b.day)

  // Group by day
  const grouped = new Map<number, CalListEvent[]>()
  for (const e of monthEvents) {
    const existing = grouped.get(e.day) ?? []
    existing.push(e)
    grouped.set(e.day, existing)
  }
  const sortedDays = Array.from(grouped.keys()).sort((a, b) => a - b)

  const getDayLabel = (day: number): string => {
    const date = new Date(year, month, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className="flex w-[340px] shrink-0 flex-col rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)',
        maxHeight: '380px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-[13px] font-semibold text-white">{monthName}</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {sortedDays.length === 0 ? (
          <div className="flex h-20 items-center justify-center">
            <p className="text-[12px] text-white/30">No events this month</p>
          </div>
        ) : (
          sortedDays.map((day) => {
            const dayEvents = grouped.get(day) ?? []
            const dateLabel = getDayLabel(day)
            return (
              <div key={day}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  {dateLabel}
                </p>
                <div className="flex flex-col gap-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-white/08"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: event.color }}
                      />
                      <span className="flex-1 text-[12px] font-medium text-white/80 truncate">
                        {event.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-white/40">{event.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
