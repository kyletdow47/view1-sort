'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'
import type { BookingRecord } from '@/types/booking'

/* ------------------------------------------------------------------ */
/*  Day headers                                                          */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/*  DayCell                                                              */
/* ------------------------------------------------------------------ */

interface DayCellBooking {
  id: string
  clientName: string
  bookingType: string
  stage: BookingRecord['stage']
}

const STAGE_COLORS: Record<string, string> = {
  inquiry:   '#94A3B8',
  quoted:    '#60A5FA',
  booked:    '#A78BFA',
  shooting:  '#FBBF24',
  delivered: '#34D399',
  paid:      '#10B981',
}

interface DayCellProps {
  day: number | null
  isToday: boolean
  isSelected: boolean
  bookings: DayCellBooking[]
  onSelect: (day: number) => void
  isCurrentMonth: boolean
}

function DayCell({ day, isToday, isSelected, bookings, onSelect, isCurrentMonth }: DayCellProps) {
  if (!day) {
    return <div className="aspect-square" />
  }

  return (
    <button
      onClick={() => onSelect(day)}
      className={`relative flex flex-col items-start rounded-2xl p-2 text-left transition-all min-h-[70px] ${
        isSelected
          ? 'ring-2 ring-violet-400'
          : 'hover:bg-white/5'
      } ${!isCurrentMonth ? 'opacity-30' : ''}`}
      style={{
        background: isSelected
          ? 'rgba(167,139,250,0.12)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isSelected ? 'rgba(167,139,250,0.30)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      {/* Day number */}
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium ${
          isToday
            ? 'bg-violet-500 text-white font-bold'
            : isSelected
            ? 'text-violet-300'
            : 'text-white/70'
        }`}
      >
        {day}
      </span>

      {/* Booking dots / mini labels */}
      {bookings.length > 0 && (
        <div className="mt-1 flex flex-col gap-0.5 w-full">
          {bookings.slice(0, 2).map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-1 rounded-md px-1 py-0.5"
              style={{ background: `${STAGE_COLORS[b.stage] ?? '#94A3B8'}20` }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: STAGE_COLORS[b.stage] ?? '#94A3B8' }}
              />
              <span className="truncate text-[9px] text-white/60">{b.clientName.split(' ')[0]}</span>
            </div>
          ))}
          {bookings.length > 2 && (
            <span className="text-[9px] text-white/35 pl-1">+{bookings.length - 2} more</span>
          )}
        </div>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Day detail panel                                                     */
/* ------------------------------------------------------------------ */

interface DayDetailProps {
  dateLabel: string
  bookings: DayCellBooking[]
}

function DayDetail({ dateLabel, bookings }: DayDetailProps) {
  if (bookings.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl py-10 text-center"
        style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
      >
        <CalendarDays size={24} className="text-white/20 mb-2" />
        <p className="text-[13px] text-white/40">No bookings on {dateLabel}</p>
        <p className="text-[11px] text-white/25 mt-1">This day is available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-white/50 mb-3">{dateLabel}</p>
      {bookings.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: `${STAGE_COLORS[b.stage] ?? '#94A3B8'}12`,
            border: `1px solid ${STAGE_COLORS[b.stage] ?? '#94A3B8'}30`,
          }}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: STAGE_COLORS[b.stage] ?? '#94A3B8' }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white/90">{b.clientName}</p>
            <p className="text-[11px] text-white/45">{b.bookingType}</p>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: `${STAGE_COLORS[b.stage] ?? '#94A3B8'}20`,
              color: STAGE_COLORS[b.stage] ?? '#94A3B8',
            }}
          >
            {b.stage.charAt(0).toUpperCase() + b.stage.slice(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BookingCalendarView                                                  */
/* ------------------------------------------------------------------ */

interface BookingCalendarViewProps {
  bookings: BookingRecord[]
}

export function BookingCalendarView({ bookings }: BookingCalendarViewProps) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  /* Grid cells: null = empty leading/trailing */
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  /* Map shoot dates to bookings */
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, DayCellBooking[]>()
    for (const b of bookings) {
      if (!b.shootDate) continue
      const dateKey = b.shootDate.slice(0, 10) // ISO yyyy-mm-dd
      const existing = map.get(dateKey) ?? []
      existing.push({
        id: b.id,
        clientName: b.clientName,
        bookingType: b.bookingType,
        stage: b.stage,
      })
      map.set(dateKey, existing)
    }
    return map
  }, [bookings])

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  const selectedDate = selectedDay ? toISODate(year, month, selectedDay) : null
  const selectedBookings = selectedDate ? (bookingsByDate.get(selectedDate) ?? []) : []
  const selectedDateLabel = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  /* Upcoming bookings (next 30 days) */
  const upcoming = useMemo(() => {
    const now = new Date()
    const future = new Date(now)
    future.setDate(now.getDate() + 30)
    return bookings
      .filter((b) => {
        if (!b.shootDate) return false
        const d = new Date(b.shootDate)
        return d >= now && d <= future
      })
      .sort((a, b) => (a.shootDate ?? '') < (b.shootDate ?? '') ? -1 : 1)
  }, [bookings])

  return (
    <div className="flex flex-col gap-5 px-6 py-5 xl:flex-row xl:gap-6">
      {/* Calendar grid */}
      <div className="flex-1">
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[16px] font-bold text-white">{monthName}</span>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today.getDate()) }}
                className="rounded-xl px-3 py-1.5 text-[12px] font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-white/30">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              const dateStr = day ? toISODate(year, month, day) : null
              const dayBookings = dateStr ? (bookingsByDate.get(dateStr) ?? []) : []
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
              return (
                <DayCell
                  key={i}
                  day={day}
                  isToday={isToday}
                  isSelected={day === selectedDay}
                  bookings={dayBookings}
                  onSelect={setSelectedDay}
                  isCurrentMonth={true}
                />
              )
            })}
          </div>
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="mt-4">
            <DayDetail dateLabel={selectedDateLabel} bookings={selectedBookings} />
          </div>
        )}
      </div>

      {/* Sidebar: upcoming shoots */}
      <div className="w-full xl:w-72 shrink-0">
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <h3 className="text-[13px] font-bold text-white mb-4">Upcoming Shoots</h3>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays size={24} className="text-white/20 mb-2" />
              <p className="text-[12px] text-white/35">No shoots in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                  style={{
                    background: `${STAGE_COLORS[b.stage] ?? '#94A3B8'}10`,
                    border: `1px solid ${STAGE_COLORS[b.stage] ?? '#94A3B8'}25`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl text-center"
                    style={{ background: `${STAGE_COLORS[b.stage] ?? '#94A3B8'}20` }}
                  >
                    {b.shootDate && (
                      <>
                        <span className="font-mono text-[10px] font-bold text-white/90">
                          {new Date(b.shootDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="font-mono text-[14px] font-bold text-white leading-none">
                          {new Date(b.shootDate).getDate()}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-white/90">{b.clientName}</p>
                    <p className="truncate text-[11px] text-white/40">{b.bookingType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          className="mt-4 rounded-3xl p-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest mb-3">Legend</p>
          <div className="space-y-2">
            {Object.entries(STAGE_COLORS).map(([stage, color]) => (
              <div key={stage} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-white/50 capitalize">{stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
