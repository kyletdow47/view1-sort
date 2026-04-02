'use client'

import Link from 'next/link'
import { ChevronDown, Calendar, List, ArrowUpRight } from 'lucide-react'
import { GlassPanel } from './GlassPanel'
import { cn } from '@/lib/utils'

const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type DayState = 'normal' | 'done' | 'scheduled' | 'today'

interface Day {
  num: number
  state: DayState
}

const weeks: Day[][] = [
  [
    { num: 1, state: 'normal' },
    { num: 2, state: 'normal' },
    { num: 3, state: 'normal' },
    { num: 4, state: 'done' },
    { num: 5, state: 'normal' },
    { num: 6, state: 'normal' },
    { num: 7, state: 'normal' },
  ],
  [
    { num: 8, state: 'done' },
    { num: 9, state: 'normal' },
    { num: 10, state: 'normal' },
    { num: 11, state: 'normal' },
    { num: 12, state: 'normal' },
    { num: 13, state: 'normal' },
    { num: 14, state: 'scheduled' },
  ],
  [
    { num: 15, state: 'today' },
    { num: 16, state: 'normal' },
    { num: 17, state: 'scheduled' },
    { num: 18, state: 'normal' },
    { num: 19, state: 'normal' },
    { num: 20, state: 'normal' },
    { num: 21, state: 'normal' },
  ],
  [
    { num: 22, state: 'scheduled' },
    { num: 23, state: 'normal' },
    { num: 24, state: 'normal' },
    { num: 25, state: 'scheduled' },
    { num: 26, state: 'normal' },
    { num: 27, state: 'normal' },
    { num: 28, state: 'normal' },
  ],
]

function DayCell({ day }: { day: Day }) {
  return (
    <div
      className={cn(
        'flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9px]',
        day.state === 'normal' && 'text-white/[0.33]',
        day.state === 'done' && 'bg-white text-black font-bold',
        day.state === 'scheduled' &&
          'bg-white/[0.13] text-white/80 font-semibold ring-1 ring-inset ring-white/[0.19]',
        day.state === 'today' &&
          'text-white font-bold ring-2 ring-inset ring-white/[0.67]'
      )}
    >
      {day.num}
    </div>
  )
}

export function CalendarWidget() {
  return (
    <GlassPanel variant="subtle" className="flex h-full flex-col gap-1.5 px-4 pb-3 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white/[0.93]" style={{ fontFamily: 'var(--font-inter)' }}>
          Upcoming shoots
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white/50">February</span>
            <ChevronDown className="h-3 w-3 text-white/[0.38]" />
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.06] p-[3px]">
            <button className="flex items-center gap-1 rounded-md bg-white/[0.13] px-2 py-1">
              <Calendar className="h-3 w-3 text-white" />
              <span className="text-[9px] font-semibold text-white">Cal</span>
            </button>
            <button className="flex items-center gap-1 rounded-md px-2 py-1">
              <List className="h-3 w-3 text-white/50" />
              <span className="text-[9px] font-medium text-white/50">List</span>
            </button>
          </div>
          <Link href="/dashboard/bookings" className="text-white/[0.67] transition-colors hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Day Headers */}
      <div className="flex justify-between">
        {dayHeaders.map((d, i) => (
          <div
            key={i}
            className="flex h-3.5 w-[22px] items-center justify-center text-[9px] font-semibold text-white/[0.31]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="flex justify-between">
          {week.map((day, di) => (
            <DayCell key={di} day={day} />
          ))}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full ring-[1.5px] ring-inset ring-white/[0.67]" />
          <span className="text-[9px] text-white/[0.38]">Current day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white" />
          <span className="text-[9px] text-white/[0.38]">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white/[0.13] ring-1 ring-inset ring-white/[0.19]" />
          <span className="text-[9px] text-white/[0.38]">Scheduled</span>
        </div>
      </div>
    </GlassPanel>
  )
}
