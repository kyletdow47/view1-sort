'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, List, ArrowUpRight } from 'lucide-react'
import { GlassPanel } from './GlassPanel'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type DayState = 'normal' | 'done' | 'scheduled' | 'today' | 'empty'
type ViewMode = 'cal' | 'list'

interface Day {
  num: number
  state: DayState
}

interface Shoot {
  day: number
  title: string
  time: string
  color: string
}

/* ------------------------------------------------------------------ */
/*  Mock shoot data keyed by "YYYY-MM"                                  */
/* ------------------------------------------------------------------ */

const SHOOTS: Record<string, Shoot[]> = {
  '2026-04': [
    { day: 3, title: 'Johnson Wedding', time: '10:00 AM', color: 'bg-teal-400' },
    { day: 5, title: 'Smith Portraits', time: '2:00 PM', color: 'bg-amber-400' },
    { day: 8, title: 'Oak St Listing', time: '9:00 AM', color: 'bg-blue-400' },
    { day: 12, title: 'Corp Headshots', time: '11:00 AM', color: 'bg-violet-400' },
    { day: 14, title: 'Garcia Engagement', time: '4:30 PM', color: 'bg-rose-400' },
    { day: 17, title: 'Travel Shoot', time: '8:00 AM', color: 'bg-emerald-400' },
    { day: 22, title: 'Product Photos', time: '1:00 PM', color: 'bg-orange-400' },
    { day: 25, title: 'Mini Sessions', time: '10:00 AM', color: 'bg-sky-400' },
    { day: 28, title: 'Chen Wedding', time: '3:00 PM', color: 'bg-pink-400' },
  ],
  '2026-03': [
    { day: 2, title: 'Miller Family', time: '9:30 AM', color: 'bg-teal-400' },
    { day: 7, title: 'Brand Shoot', time: '11:00 AM', color: 'bg-amber-400' },
    { day: 15, title: 'Evans Wedding', time: '2:00 PM', color: 'bg-rose-400' },
    { day: 20, title: 'Real Estate Tour', time: '10:00 AM', color: 'bg-blue-400' },
    { day: 28, title: 'Patel Portraits', time: '4:00 PM', color: 'bg-violet-400' },
  ],
  '2026-05': [
    { day: 1, title: 'Park Engagement', time: '5:00 PM', color: 'bg-rose-400' },
    { day: 6, title: 'Studio Headshots', time: '10:00 AM', color: 'bg-violet-400' },
    { day: 10, title: 'Beach Wedding', time: '4:00 PM', color: 'bg-teal-400' },
    { day: 18, title: 'Food Photography', time: '12:00 PM', color: 'bg-orange-400' },
    { day: 24, title: 'Graduation Shoot', time: '9:00 AM', color: 'bg-sky-400' },
    { day: 30, title: 'Concert Photos', time: '7:00 PM', color: 'bg-pink-400' },
  ],
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildCalendar(year: number, month: number, shoots: Shoot[], today: number | null): Day[][] {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1 // Mon=0

  const shootDays = new Set(shoots.map((s) => s.day))
  const doneDays = new Set(shoots.filter((s) => today !== null && s.day < today).map((s) => s.day))

  const cells: Day[] = []

  // Leading empties
  for (let i = 0; i < startOffset; i++) {
    cells.push({ num: 0, state: 'empty' })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    let state: DayState = 'normal'
    if (d === today) state = 'today'
    else if (doneDays.has(d)) state = 'done'
    else if (shootDays.has(d)) state = 'scheduled'
    cells.push({ num: d, state })
  }

  // Trailing empties to complete last week
  while (cells.length % 7 !== 0) {
    cells.push({ num: 0, state: 'empty' })
  }

  const weeks: Day[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

/* ------------------------------------------------------------------ */
/*  Components                                                          */
/* ------------------------------------------------------------------ */

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function DayCell({ day }: { day: Day }) {
  if (day.state === 'empty') {
    return <div className="h-7 w-7" />
  }

  return (
    <div
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition-colors',
        day.state === 'normal' && 'text-white/30',
        day.state === 'done' && 'bg-white text-black font-bold',
        day.state === 'scheduled' &&
          'bg-white/[0.13] text-white/80 font-semibold ring-1 ring-inset ring-white/20',
        day.state === 'today' &&
          'text-white font-bold ring-2 ring-inset ring-white/70',
      )}
    >
      {day.num}
    </div>
  )
}

function CalView({ weeks }: { weeks: Day[][] }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="flex h-5 items-center justify-center text-[10px] font-semibold text-white/30">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => (
            <div key={di} className="flex items-center justify-center">
              <DayCell day={day} />
            </div>
          ))}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full ring-[1.5px] ring-inset ring-white/60" />
          <span className="text-[9px] text-white/35">Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white" />
          <span className="text-[9px] text-white/35">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white/[0.13] ring-1 ring-inset ring-white/20" />
          <span className="text-[9px] text-white/35">Scheduled</span>
        </div>
      </div>
    </div>
  )
}

function ListView({ shoots }: { shoots: Shoot[] }) {
  if (shoots.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-xs text-white/40">
        No shoots this month
      </div>
    )
  }

  const sorted = [...shoots].sort((a, b) => a.day - b.day)

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
      {sorted.map((shoot, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 rounded-lg bg-white/[0.05] px-3 py-2 transition-colors hover:bg-white/[0.08]"
        >
          <div className={`h-2 w-2 shrink-0 rounded-full ${shoot.color}`} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-white/90">{shoot.title}</span>
            <span className="text-[10px] text-white/40">{shoot.time}</span>
          </div>
          <span className="shrink-0 text-[11px] font-medium text-white/50">
            {shoot.day}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main widget                                                         */
/* ------------------------------------------------------------------ */

export function CalendarWidget() {
  const [view, setView] = useState<ViewMode>('cal')
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3) // April (0-indexed)

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const shoots = SHOOTS[monthKey] ?? []

  // "today" is day 2 of April 2026 to match the app's current date
  const today = year === 2026 && month === 3 ? 2 : null

  const weeks = useMemo(
    () => buildCalendar(year, month, shoots, today),
    [year, month, shoots, today],
  )

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }, [month])

  return (
    <GlassPanel variant="subtle" className="flex h-full flex-col gap-2 px-4 pb-3 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white/90" style={{ fontFamily: 'var(--font-inter)' }}>
          Upcoming shoots
        </span>
        <div className="flex items-center gap-1.5">
          {/* Month nav */}
          <button onClick={prevMonth} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[52px] text-center text-[11px] font-medium text-white/60">
            {MONTH_NAMES[month].slice(0, 3)} {year}
          </span>
          <button onClick={nextMonth} className="text-white/40 hover:text-white transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* View toggle */}
          <div className="ml-1 flex items-center gap-0.5 rounded-lg bg-white/[0.06] p-[3px]">
            <button
              onClick={() => setView('cal')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 transition-colors',
                view === 'cal' ? 'bg-white/[0.13]' : '',
              )}
            >
              <Calendar className={cn('h-3 w-3', view === 'cal' ? 'text-white' : 'text-white/50')} />
              <span className={cn('text-[9px] font-medium', view === 'cal' ? 'font-semibold text-white' : 'text-white/50')}>Cal</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 transition-colors',
                view === 'list' ? 'bg-white/[0.13]' : '',
              )}
            >
              <List className={cn('h-3 w-3', view === 'list' ? 'text-white' : 'text-white/50')} />
              <span className={cn('text-[9px] font-medium', view === 'list' ? 'font-semibold text-white' : 'text-white/50')}>List</span>
            </button>
          </div>

          <Link href="/dashboard/bookings" className="text-white/[0.67] transition-colors hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      {view === 'cal' ? <CalView weeks={weeks} /> : <ListView shoots={shoots} />}
    </GlassPanel>
  )
}
