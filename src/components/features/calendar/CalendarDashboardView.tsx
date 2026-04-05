'use client'

import React, { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  AlignJustify,
  Clock,
  MapPin,
  X,
  Check,
  Lock,
  RotateCcw,
} from 'lucide-react'
import type { CalendarEvent, CalendarViewMode, CalendarEventStatus, CalendarEventSourceType, CreateEventFormData, CalendarFilters } from '@/types/calendar'

/* ------------------------------------------------------------------ */
/*  Constants                                                            */
/* ------------------------------------------------------------------ */

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const STATUS_COLORS: Record<string, string> = {
  inquiry:     '#94A3B8',
  quoted:      '#60A5FA',
  booked:      '#A78BFA',
  contracted:  '#818CF8',
  prepped:     '#F59E0B',
  shooting:    '#FBBF24',
  processing:  '#FB923C',
  review:      '#22D3EE',
  gallery_live:'#34D399',
  delivered:   '#10B981',
  paid:        '#059669',
  blocked:     '#6B7280',
}

const STATUS_LABELS: Record<string, string> = {
  inquiry:     'Inquiry',
  quoted:      'Quoted',
  booked:      'Booked',
  contracted:  'Contracted',
  prepped:     'Prepped',
  shooting:    'Shooting',
  processing:  'Processing',
  review:      'In Review',
  gallery_live:'Gallery Live',
  delivered:   'Delivered',
  paid:        'Paid',
  blocked:     'Blocked',
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const TODAY = new Date()
const Y = TODAY.getFullYear()
const M = TODAY.getMonth()

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const MOCK_EVENTS: CalendarEvent[] = [
  // This month — bookings
  { id: 'ev-1',  title: 'Sarah & Michael Mitchell', subtitle: 'Wedding',          date: iso(Y, M, 6),  timeStart: '14:00', timeEnd: '22:00', sourceType: 'booking', status: 'booked',      location: 'The Grand Ballroom' },
  { id: 'ev-2',  title: 'James & Priya Kapoor',     subtitle: 'Engagement',       date: iso(Y, M, 8),  timeStart: '10:00', timeEnd: '12:00', sourceType: 'booking', status: 'booked',      location: 'Riverside Park' },
  { id: 'ev-3',  title: 'Elena Torres',             subtitle: 'Portrait Session', date: iso(Y, M, 10), timeStart: '09:00', timeEnd: '10:30', sourceType: 'booking', status: 'quoted' },
  { id: 'ev-4',  title: 'Ryan & Ashley Nguyen',     subtitle: 'Wedding',          date: iso(Y, M, 14), timeStart: '15:00', timeEnd: '23:00', sourceType: 'booking', status: 'contracted',  location: 'Seaside Estate', bookingId: 'ryan-ashley' },
  { id: 'ev-5',  title: 'Lisa Patel',               subtitle: 'Newborn Session',  date: iso(Y, M, 16), timeStart: '10:00', timeEnd: '11:30', sourceType: 'booking', status: 'booked' },
  { id: 'ev-6',  title: 'Carter & Olivia Brown',    subtitle: 'Elopement',        date: iso(Y, M, 18), timeStart: '07:00', timeEnd: '12:00', sourceType: 'booking', status: 'inquiry',     location: 'Mountain Ridge' },
  { id: 'ev-7',  title: 'Maya Chen Family',         subtitle: 'Family Session',   date: iso(Y, M, 20), timeStart: '17:00', timeEnd: '18:30', sourceType: 'booking', status: 'booked' },
  { id: 'ev-8',  title: 'Alex Kim',                 subtitle: 'Branding Shoot',   date: iso(Y, M, 22), timeStart: '08:00', timeEnd: '13:00', sourceType: 'booking', status: 'prepped',     location: 'Studio A', bookingId: 'alex-kim' },
  { id: 'ev-9',  title: 'Marcus Cole',              subtitle: 'Commercial',       date: iso(Y, M, 24), timeStart: '09:00', timeEnd: '17:00', sourceType: 'booking', status: 'shooting',    location: 'Client Office' },
  { id: 'ev-10', title: 'Priya Sharma',             subtitle: 'Mini Session',     date: iso(Y, M, 26), timeStart: '16:00', timeEnd: '17:00', sourceType: 'booking', status: 'quoted' },
  // Projects
  { id: 'ev-11', title: 'Thompson Wedding Gallery', subtitle: 'Project',          date: iso(Y, M, 7),  sourceType: 'project', status: 'review',       allDay: true, projectId: 'proj-001' },
  { id: 'ev-12', title: 'Corporate Headshots',      subtitle: 'Project',          date: iso(Y, M, 12), sourceType: 'project', status: 'processing',   allDay: true, projectId: 'proj-002' },
  { id: 'ev-13', title: 'Spring Portrait Series',   subtitle: 'Project',          date: iso(Y, M, 19), sourceType: 'project', status: 'gallery_live', allDay: true, projectId: 'proj-003' },
  // Blocked time
  { id: 'ev-14', title: 'Personal — Out of town',   date: iso(Y, M, 28), sourceType: 'block', status: 'blocked', allDay: true },
  { id: 'ev-15', title: 'Equipment maintenance',    date: iso(Y, M, 29), timeStart: '08:00', timeEnd: '10:00', sourceType: 'block', status: 'blocked' },
  // Next month
  { id: 'ev-16', title: 'Daniel & Sophie Ross',     subtitle: 'Wedding',          date: iso(Y, M + 1, 3),  timeStart: '13:00', timeEnd: '21:00', sourceType: 'booking', status: 'booked' },
  { id: 'ev-17', title: 'Natasha Lee',              subtitle: 'Maternity',        date: iso(Y, M + 1, 9),  timeStart: '10:00', timeEnd: '11:30', sourceType: 'booking', status: 'quoted' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date, opts?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-US', opts ?? { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(t?: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function getWeekDates(date: Date): Date[] {
  const day = date.getDay()
  const sunday = new Date(date)
  sunday.setDate(date.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return d
  })
}

/* ------------------------------------------------------------------ */
/*  EventPill (compact event in month/week cells)                       */
/* ------------------------------------------------------------------ */

interface EventPillProps {
  event: CalendarEvent
  onClick: (e: CalendarEvent) => void
  isDragging?: boolean
}

function EventPill({ event, onClick, isDragging }: EventPillProps) {
  const color = STATUS_COLORS[event.status] ?? '#94A3B8'
  return (
    <button
      onClick={(ev) => { ev.stopPropagation(); onClick(event) }}
      className="w-full flex items-center gap-1 rounded-md px-1.5 py-0.5 text-left transition-opacity hover:opacity-80"
      style={{
        background: `${color}20`,
        border: `1px solid ${color}35`,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate text-[10px] font-medium text-white/80">{event.title.split(' ')[0]}</span>
      {event.timeStart && <span className="shrink-0 text-[9px] text-white/40 ml-auto">{formatTime(event.timeStart).replace(' ', '')}</span>}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  DraggableEvent wrapper (for month view)                             */
/* ------------------------------------------------------------------ */

function DraggableEvent({ event, onClick }: { event: CalendarEvent; onClick: (e: CalendarEvent) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: event.id, data: { event } })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <EventPill event={event} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DroppableDayCell (month view)                                       */
/* ------------------------------------------------------------------ */

interface DroppableDayCellProps {
  dateStr: string
  day: number | null
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  events: CalendarEvent[]
  onDayClick: (dateStr: string) => void
  onEventClick: (e: CalendarEvent) => void
}

function DroppableDayCell({
  dateStr, day, isToday, isSelected, isCurrentMonth, events, onDayClick, onEventClick,
}: DroppableDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr })

  if (!day) return <div className="aspect-square rounded-2xl" />

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayClick(dateStr)}
      className="flex flex-col rounded-2xl p-1.5 cursor-pointer transition-all min-h-[72px]"
      style={{
        background: isOver
          ? 'rgba(167,139,250,0.15)'
          : isSelected
          ? 'rgba(167,139,250,0.10)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isOver ? 'rgba(167,139,250,0.40)' : isSelected ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)'}`,
        opacity: isCurrentMonth ? 1 : 0.35,
      }}
    >
      {/* Day number */}
      <span
        className={`flex h-5 w-5 items-center justify-center self-end rounded-full text-[11px] font-medium mb-1 ${
          isToday ? 'bg-violet-500 text-white font-bold' : 'text-white/60'
        }`}
      >
        {day}
      </span>

      {/* Events */}
      <div className="flex flex-col gap-0.5">
        {events.slice(0, 2).map((ev) => (
          <DraggableEvent key={ev.id} event={ev} onClick={onEventClick} />
        ))}
        {events.length > 2 && (
          <span className="text-[9px] text-white/30 pl-1">+{events.length - 2} more</span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Month View                                                          */
/* ------------------------------------------------------------------ */

interface MonthViewProps {
  year: number
  month: number
  events: CalendarEvent[]
  selectedDate: string | null
  onDayClick: (dateStr: string) => void
  onEventClick: (e: CalendarEvent) => void
  onEventReschedule: (eventId: string, newDate: string) => void
}

function MonthView({ year, month, events, selectedDate, onDayClick, onEventClick, onEventReschedule }: MonthViewProps) {
  const today = new Date()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const existing = map.get(ev.date) ?? []
      existing.push(ev)
      map.set(ev.date, existing)
    }
    return map
  }, [events])

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeEvent = activeId ? events.find((e) => e.id === activeId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { over, active } = e
    if (!over || !active.data.current) return
    const event = active.data.current.event as CalendarEvent
    const newDate = String(over.id)
    if (event.date !== newDate) {
      onEventReschedule(event.id, newDate)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-white/30 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const dateStr = day ? toISODate(year, month, day) : `empty-${i}`
          const dayEvents = day ? (eventsByDate.get(toISODate(year, month, day)) ?? []) : []
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          return (
            <DroppableDayCell
              key={i}
              dateStr={day ? toISODate(year, month, day) : `empty-${i}`}
              day={day}
              isToday={isToday}
              isSelected={dateStr === selectedDate}
              isCurrentMonth={!!day}
              events={dayEvents}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeEvent && (
          <div
            className="rounded-lg px-2 py-1 text-[10px] font-medium text-white shadow-xl"
            style={{ background: STATUS_COLORS[activeEvent.status] ?? '#94A3B8' }}
          >
            {activeEvent.title.split(' ')[0]}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

/* ------------------------------------------------------------------ */
/*  Week View                                                           */
/* ------------------------------------------------------------------ */

interface WeekViewProps {
  weekDates: Date[]
  events: CalendarEvent[]
  onEventClick: (e: CalendarEvent) => void
}

function WeekView({ weekDates, events, onEventClick }: WeekViewProps) {
  const today = new Date()
  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate())

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const existing = map.get(ev.date) ?? []
      existing.push(ev)
      map.set(ev.date, existing)
    }
    return map
  }, [events])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Day header row */}
        <div className="grid grid-cols-[56px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-0 mb-0.5">
          <div />
          {weekDates.map((d) => {
            const ds = toISODate(d.getFullYear(), d.getMonth(), d.getDate())
            const isToday = ds === todayStr
            return (
              <div key={ds} className="text-center py-2">
                <p className="text-[10px] text-white/30">{WEEKDAYS_SHORT[d.getDay()]}</p>
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold mt-0.5 ${isToday ? 'bg-violet-500 text-white' : 'text-white/70'}`}>
                  {d.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Hour rows */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {HOURS.map((h) => (
            <div
              key={h}
              className="grid grid-cols-[56px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
              style={{ borderBottom: h < 23 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              {/* Time label */}
              <div className="flex items-start justify-end pr-2 pt-1 text-[10px] text-white/25"
                style={{ background: 'rgba(0,0,0,0.15)' }}>
                {formatHour(h)}
              </div>
              {weekDates.map((d) => {
                const ds = toISODate(d.getFullYear(), d.getMonth(), d.getDate())
                const cellEvents = (eventsByDate.get(ds) ?? []).filter((ev) => {
                  if (!ev.timeStart) return false
                  const evH = parseInt(ev.timeStart.split(':')[0], 10)
                  return evH === h
                })
                const isToday = ds === todayStr
                return (
                  <div
                    key={ds}
                    className="relative min-h-[36px] px-0.5 py-0.5"
                    style={{ background: isToday ? 'rgba(139,92,246,0.04)' : 'transparent' }}
                  >
                    {cellEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => onEventClick(ev)}
                        className="w-full rounded-md px-1 py-0.5 text-left text-[9px] font-medium text-white/80 hover:opacity-80 transition-opacity"
                        style={{ background: `${STATUS_COLORS[ev.status] ?? '#94A3B8'}25`, border: `1px solid ${STATUS_COLORS[ev.status] ?? '#94A3B8'}35` }}
                      >
                        <span className="block truncate">{ev.title.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Day View                                                            */
/* ------------------------------------------------------------------ */

interface DayViewProps {
  date: Date
  events: CalendarEvent[]
  onEventClick: (e: CalendarEvent) => void
}

function DayView({ date, events, onEventClick }: DayViewProps) {
  const dateStr = toISODate(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEvents = events.filter((ev) => ev.date === dateStr)
  const allDay = dayEvents.filter((ev) => ev.allDay)
  const timed = dayEvents.filter((ev) => !ev.allDay)

  return (
    <div className="flex gap-4">
      {/* Time column */}
      <div className="flex-1 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        {allDay.length > 0 && (
          <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-white/30 mb-1">All Day</p>
            <div className="flex flex-wrap gap-1.5">
              {allDay.map((ev) => {
                const color = STATUS_COLORS[ev.status] ?? '#94A3B8'
                return (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white/80 hover:opacity-80 transition-opacity"
                    style={{ background: `${color}20`, border: `1px solid ${color}35` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                    {ev.title}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {HOURS.map((h) => {
          const hourEvents = timed.filter((ev) => {
            if (!ev.timeStart) return false
            return parseInt(ev.timeStart.split(':')[0], 10) === h
          })
          return (
            <div
              key={h}
              className="flex gap-3 px-4"
              style={{
                minHeight: 48,
                borderBottom: h < 23 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: h >= 8 && h <= 18 ? 'rgba(255,255,255,0.015)' : 'transparent',
              }}
            >
              <span className="shrink-0 w-12 pt-1 text-[11px] text-white/25">{formatHour(h)}</span>
              <div className="flex-1 py-1 flex flex-col gap-1">
                {hourEvents.map((ev) => {
                  const color = STATUS_COLORS[ev.status] ?? '#94A3B8'
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      className="flex items-start gap-2 rounded-xl px-3 py-2 text-left hover:opacity-80 transition-opacity"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-white/90">{ev.title}</p>
                        {ev.subtitle && <p className="text-[11px] text-white/40">{ev.subtitle}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          {ev.timeStart && (
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              <Clock size={9} />{formatTime(ev.timeStart)}{ev.timeEnd && ` – ${formatTime(ev.timeEnd)}`}
                            </span>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              <MapPin size={9} />{ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{ background: `${color}20`, color }}
                      >
                        {STATUS_LABELS[ev.status]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  List View (matches Pencil frame U1Kew)                              */
/* ------------------------------------------------------------------ */

interface ListViewProps {
  events: CalendarEvent[]
  onEventClick: (e: CalendarEvent) => void
}

function ListView({ events, onEventClick }: ListViewProps) {
  const today = new Date()
  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate())

  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1
      return (a.timeStart ?? '00:00') < (b.timeStart ?? '00:00') ? -1 : 1
    })
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of sorted) {
      const existing = map.get(ev.date) ?? []
      existing.push(ev)
      map.set(ev.date, existing)
    }
    return map
  }, [events])

  if (grouped.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar size={32} className="text-white/15 mb-3" />
        <p className="text-[14px] text-white/35">No events match your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([dateStr, dayEvents]) => {
        const date = parseDate(dateStr)
        const isToday = dateStr === todayStr
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const isPast = date < todayMidnight
        return (
          <div key={dateStr}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-center ${
                  isToday ? 'bg-violet-500' : 'bg-white/08'
                }`}
                style={{ background: isToday ? '#7C3AED' : 'rgba(255,255,255,0.08)' }}
              >
                <span className="font-mono text-[9px] font-bold text-white/60 uppercase leading-none">
                  {MONTHS[date.getMonth()].slice(0, 3)}
                </span>
                <span className={`font-mono text-[15px] font-bold leading-none ${isToday ? 'text-white' : 'text-white/80'}`}>
                  {date.getDate()}
                </span>
              </div>
              <div>
                <p className={`text-[13px] font-bold ${isToday ? 'text-violet-300' : 'text-white/80'}`}>
                  {isToday ? 'Today' : WEEKDAYS_FULL[date.getDay()]}
                </p>
                <p className="text-[11px] text-white/35">
                  {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {isToday && (
                <span className="ml-auto rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-medium text-violet-300">
                  Today
                </span>
              )}
            </div>

            {/* Event cards */}
            <div className="ml-[52px] space-y-2">
              {dayEvents.map((ev) => {
                const color = STATUS_COLORS[ev.status] ?? '#94A3B8'
                return (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left hover:opacity-80 transition-opacity ${isPast ? 'opacity-60' : ''}`}
                    style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                  >
                    {/* Left color bar */}
                    <span className="shrink-0 w-0.5 self-stretch rounded-full" style={{ background: color }} />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-white/90 truncate">{ev.title}</p>
                        {ev.sourceType === 'block' && (
                          <Lock size={10} className="text-white/30 shrink-0" />
                        )}
                      </div>
                      {ev.subtitle && <p className="text-[11px] text-white/40">{ev.subtitle}</p>}
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        {ev.allDay ? (
                          <span className="text-[10px] text-white/30">All day</span>
                        ) : ev.timeStart ? (
                          <span className="flex items-center gap-1 text-[10px] text-white/35">
                            <Clock size={9} />
                            {formatTime(ev.timeStart)}{ev.timeEnd ? ` – ${formatTime(ev.timeEnd)}` : ''}
                          </span>
                        ) : null}
                        {ev.location && (
                          <span className="flex items-center gap-1 text-[10px] text-white/35">
                            <MapPin size={9} />{ev.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                      style={{ background: `${color}20`, color }}
                    >
                      {STATUS_LABELS[ev.status]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Event Detail Modal                                                  */
/* ------------------------------------------------------------------ */

interface EventDetailModalProps {
  event: CalendarEvent
  onClose: () => void
}

function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const color = STATUS_COLORS[event.status] ?? '#94A3B8'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-3xl p-6"
        style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ background: color }} />
            <div>
              <h3 className="text-[16px] font-bold text-white">{event.title}</h3>
              {event.subtitle && <p className="text-[12px] text-white/45">{event.subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Calendar size={14} className="text-white/30 shrink-0" />
            <span className="text-[13px] text-white/70">
              {parseDate(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {event.timeStart && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Clock size={14} className="text-white/30 shrink-0" />
              <span className="text-[13px] text-white/70">
                {formatTime(event.timeStart)}{event.timeEnd ? ` – ${formatTime(event.timeEnd)}` : ''}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <MapPin size={14} className="text-white/30 shrink-0" />
              <span className="text-[13px] text-white/70">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{ background: `${color}20`, color }}
            >
              {STATUS_LABELS[event.status]}
            </span>
            <span className="rounded-full px-3 py-1 text-[11px] font-medium text-white/40"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              {event.sourceType === 'booking' ? 'Booking' : event.sourceType === 'project' ? 'Project' : 'Blocked'}
            </span>
          </div>

          {event.notes && (
            <p className="rounded-xl px-3 py-2.5 text-[12px] text-white/55 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {event.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Create Event Modal                                                  */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: CalendarEventStatus[] = [
  'inquiry','quoted','booked','contracted','prepped','shooting','processing','review','gallery_live','delivered','paid',
]

interface CreateEventModalProps {
  initialDate?: string
  isBlockMode: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
}

function CreateEventModal({ initialDate, isBlockMode, onClose, onSave }: CreateEventModalProps) {
  const today = new Date()
  const [form, setForm] = useState<CreateEventFormData>({
    title: '',
    subtitle: '',
    date: initialDate ?? toISODate(today.getFullYear(), today.getMonth(), today.getDate()),
    timeStart: isBlockMode ? '09:00' : '10:00',
    timeEnd: isBlockMode ? '17:00' : '11:00',
    sourceType: isBlockMode ? 'block' : 'booking',
    status: isBlockMode ? 'blocked' : 'inquiry',
    location: '',
    notes: '',
    allDay: false,
  })

  function handleSave() {
    if (!form.title.trim()) return
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || undefined,
      date: form.date,
      timeStart: form.allDay ? undefined : form.timeStart,
      timeEnd: form.allDay ? undefined : form.timeEnd,
      sourceType: form.sourceType,
      status: form.status,
      location: form.location?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      allDay: form.allDay,
    }
    onSave(newEvent)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-3xl p-6"
        style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-white">
            {isBlockMode ? 'Block Time' : 'New Event'}
          </h3>
          <button onClick={onClose} className="rounded-xl p-1.5 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-[11px] text-white/40 mb-1">
              {isBlockMode ? 'Reason (optional)' : 'Client Name / Title'}
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isBlockMode ? 'e.g. Personal, Vacation...' : 'e.g. Sarah Mitchell'}
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          {!isBlockMode && (
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Shoot Type</label>
              <input
                value={form.subtitle ?? ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="e.g. Wedding, Portrait..."
                className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-[11px] text-white/40 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }}
            />
          </div>

          {/* All day toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/60">All day</span>
            <button
              onClick={() => setForm({ ...form, allDay: !form.allDay })}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.allDay ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.allDay ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>

          {!form.allDay && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-white/40 mb-1">Start Time</label>
                <input
                  type="time"
                  value={form.timeStart ?? ''}
                  onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-1">End Time</label>
                <input
                  type="time"
                  value={form.timeEnd ?? ''}
                  onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }}
                />
              </div>
            </div>
          )}

          {!isBlockMode && (
            <>
              {/* Status */}
              <div>
                <label className="block text-[11px] text-white/40 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CalendarEventStatus })}
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] text-white/40 mb-1">Location (optional)</label>
                <input
                  value={form.location ?? ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Central Park, Studio A..."
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] text-white/40 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/15 py-2.5 text-[13px] font-medium text-white/50 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="flex-1 rounded-2xl py-2.5 text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
            style={{ background: isBlockMode ? 'rgba(107,114,128,0.6)' : 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            {isBlockMode ? 'Block Time' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reschedule Confirm Dialog                                           */
/* ------------------------------------------------------------------ */

interface RescheduleConfirmProps {
  event: CalendarEvent
  newDate: string
  onConfirm: () => void
  onCancel: () => void
}

function RescheduleConfirm({ event, newDate, onConfirm, onCancel }: RescheduleConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 text-center"
        style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl mx-auto mb-4"
          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <Calendar size={20} className="text-amber-400" />
        </div>
        <h3 className="text-[16px] font-bold text-white mb-2">Reschedule?</h3>
        <p className="text-[13px] text-white/50 mb-1">
          Move <span className="font-medium text-white/80">{event.title}</span>
        </p>
        <p className="text-[12px] text-white/35 mb-5">
          {parseDate(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' → '}
          {parseDate(newDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-white/15 py-2.5 text-[13px] font-medium text-white/50 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl py-2.5 text-[13px] font-bold text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Undo Toast                                                          */
/* ------------------------------------------------------------------ */

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
}

function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
      style={{ background: '#1A1A28', border: '1px solid rgba(255,255,255,0.15)' }}>
      <Check size={14} className="text-emerald-400 shrink-0" />
      <span className="text-[13px] text-white/80">{message}</span>
      <button onClick={onUndo} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-medium text-violet-300 hover:bg-violet-500/15 transition-colors">
        <RotateCcw size={11} />Undo
      </button>
      <button onClick={onDismiss} className="rounded-lg p-1 text-white/25 hover:text-white/60 transition-colors">
        <X size={12} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CalendarDashboardView — main component                              */
/* ------------------------------------------------------------------ */

export interface CalendarDashboardViewProps {
  initialEvents: CalendarEvent[]
}

export function CalendarDashboardView({ initialEvents }: CalendarDashboardViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // View mode from URL, default 'month'
  const viewMode = (searchParams.get('view') as CalendarViewMode) ?? 'month'

  function setViewMode(mode: CalendarViewMode) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', mode)
    router.replace(`/dashboard/calendar?${params.toString()}`, { scroll: false })
  }

  const today = new Date()
  const [navDate, setNavDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(
    toISODate(today.getFullYear(), today.getMonth(), today.getDate())
  )

  // Events state (starts from props or mock fallback)
  const [events, setEvents] = useState<CalendarEvent[]>(
    initialEvents.length > 0 ? initialEvents : MOCK_EVENTS
  )

  // Filters
  const [filters, setFilters] = useState<CalendarFilters>({ status: 'all', sourceType: 'all', search: '' })

  // Modals
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>()

  // Reschedule pending confirmation
  const [reschedule, setReschedule] = useState<{ event: CalendarEvent; newDate: string } | null>(null)
  const [undoState, setUndoState] = useState<{ message: string; snapshot: CalendarEvent[] } | null>(null)

  // Navigation labels
  const year = navDate.getFullYear()
  const month = navDate.getMonth()
  const monthLabel = `${MONTHS[month]} ${year}`

  const weekDates = useMemo(() => getWeekDates(navDate), [navDate])
  const weekLabel = (() => {
    const s = weekDates[0]
    const e = weekDates[6]
    if (s.getMonth() === e.getMonth()) return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
    return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  })()

  const dayLabel = useMemo(() => {
    const d = selectedDate ? parseDate(selectedDate) : today
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }, [selectedDate])

  // Navigation
  function prevPeriod() {
    if (viewMode === 'month') setNavDate(new Date(year, month - 1, 1))
    else if (viewMode === 'week') { const d = new Date(navDate); d.setDate(d.getDate() - 7); setNavDate(d) }
    else if (viewMode === 'day' || viewMode === 'list') {
      const cur = selectedDate ? parseDate(selectedDate) : today
      cur.setDate(cur.getDate() - 1)
      setSelectedDate(toISODate(cur.getFullYear(), cur.getMonth(), cur.getDate()))
    }
  }

  function nextPeriod() {
    if (viewMode === 'month') setNavDate(new Date(year, month + 1, 1))
    else if (viewMode === 'week') { const d = new Date(navDate); d.setDate(d.getDate() + 7); setNavDate(d) }
    else if (viewMode === 'day' || viewMode === 'list') {
      const cur = selectedDate ? parseDate(selectedDate) : today
      cur.setDate(cur.getDate() + 1)
      setSelectedDate(toISODate(cur.getFullYear(), cur.getMonth(), cur.getDate()))
    }
  }

  function goToday() {
    setNavDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(toISODate(today.getFullYear(), today.getMonth(), today.getDate()))
  }

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (filters.status !== 'all' && ev.status !== filters.status) return false
      if (filters.sourceType !== 'all' && ev.sourceType !== filters.sourceType) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!ev.title.toLowerCase().includes(q) && !(ev.subtitle ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [events, filters])

  // Events visible in current navigation window
  const windowedEvents = useMemo(() => {
    if (viewMode === 'month') {
      // Show current month + adjacent days visible in grid
      const start = toISODate(year, month, 1)
      const end = toISODate(year, month + 1, 0)
      return filteredEvents.filter((ev) => ev.date >= start && ev.date <= end)
    }
    if (viewMode === 'week') {
      const startStr = toISODate(weekDates[0].getFullYear(), weekDates[0].getMonth(), weekDates[0].getDate())
      const endStr = toISODate(weekDates[6].getFullYear(), weekDates[6].getMonth(), weekDates[6].getDate())
      return filteredEvents.filter((ev) => ev.date >= startStr && ev.date <= endStr)
    }
    if (viewMode === 'day') {
      const ds = selectedDate ?? toISODate(today.getFullYear(), today.getMonth(), today.getDate())
      return filteredEvents.filter((ev) => ev.date === ds)
    }
    // List: all filtered events in current + next 2 months
    const start = toISODate(year, month, 1)
    const end = toISODate(year, month + 3, 0)
    return filteredEvents.filter((ev) => ev.date >= start && ev.date <= end)
  }, [filteredEvents, viewMode, year, month, weekDates, selectedDate])

  // Reschedule handlers
  function handleRescheduleRequest(eventId: string, newDate: string) {
    const ev = events.find((e) => e.id === eventId)
    if (ev) setReschedule({ event: ev, newDate })
  }

  function confirmReschedule() {
    if (!reschedule) return
    const snapshot = events
    setEvents((prev) =>
      prev.map((ev) => ev.id === reschedule.event.id ? { ...ev, date: reschedule.newDate } : ev)
    )
    setUndoState({ message: `${reschedule.event.title.split(' ')[0]} rescheduled`, snapshot })
    setReschedule(null)
    setTimeout(() => setUndoState(null), 5000)
  }

  function handleUndo() {
    if (undoState) setEvents(undoState.snapshot)
    setUndoState(null)
  }

  // Create event
  function handleCreateSave(ev: CalendarEvent) {
    setEvents((prev) => [...prev, ev])
    // TODO: persist to Supabase calendar_events table
  }

  // Upcoming shoots sidebar (next 30 days)
  const upcoming = useMemo(() => {
    const now = new Date()
    const future = new Date(now)
    future.setDate(now.getDate() + 30)
    const nowStr = toISODate(now.getFullYear(), now.getMonth(), now.getDate())
    const futureStr = toISODate(future.getFullYear(), future.getMonth(), future.getDate())
    return events
      .filter((ev) => ev.sourceType !== 'block' && ev.date >= nowStr && ev.date <= futureStr)
      .sort((a, b) => a.date < b.date ? -1 : 1)
      .slice(0, 8)
  }, [events])

  /* ---- Nav label per view ---- */
  const navLabel =
    viewMode === 'month' ? monthLabel :
    viewMode === 'week'  ? weekLabel  :
    viewMode === 'day'   ? dayLabel   :
    `${MONTHS[month]} ${year} – upcoming`

  const VIEW_TABS: { key: CalendarViewMode; icon: React.ReactNode; label: string }[] = [
    { key: 'month', icon: <LayoutGrid size={13} />,   label: 'Month' },
    { key: 'week',  icon: <AlignJustify size={13} />, label: 'Week'  },
    { key: 'day',   icon: <Clock size={13} />,        label: 'Day'   },
    { key: 'list',  icon: <List size={13} />,         label: 'List'  },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Title + nav */}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(79,70,229,0.4) 100%)', border: '1px solid rgba(139,92,246,0.35)' }}
              >
                <Calendar size={14} className="text-violet-300" />
              </div>
              <h1 className="text-[20px] font-bold text-white">Calendar</h1>
            </div>
            <p className="text-[13px] text-white/40">Shoot schedule, bookings, and availability</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowBlock(true) }}
              className="flex items-center gap-1.5 rounded-2xl border border-white/15 px-4 py-2 text-[12px] font-medium text-white/50 hover:text-white/70 hover:border-white/25 transition-colors"
            >
              <Lock size={12} />
              Block Time
            </button>
            <button
              onClick={() => { setCreateInitialDate(selectedDate ?? undefined); setShowCreate(true) }}
              className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
            >
              <Plus size={13} />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar: nav + view tabs + filters ─────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-2 px-6 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Navigation */}
        <div className="flex items-center gap-0.5">
          <button onClick={prevPeriod} className="rounded-xl p-1.5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <button onClick={goToday} className="rounded-xl px-2.5 py-1 text-[11px] font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors">
            Today
          </button>
          <button onClick={nextPeriod} className="rounded-xl p-1.5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors">
            <ChevronRight size={15} />
          </button>
          <span className="ml-2 text-[13px] font-semibold text-white/70">{navLabel}</span>
        </div>

        <div className="flex-1" />

        {/* Source type filter */}
        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
          {(['all', 'booking', 'project', 'block'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, sourceType: t })}
              className={`px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                filters.sourceType === t
                  ? 'bg-white/12 text-white'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        {/* View tabs */}
        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
          {VIEW_TABS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                viewMode === key
                  ? 'bg-violet-500/25 text-violet-200'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-4 overflow-hidden px-6 py-4">
        {/* Main calendar area */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            {viewMode === 'month' && (
              <MonthView
                year={year}
                month={month}
                events={windowedEvents}
                selectedDate={selectedDate}
                onDayClick={setSelectedDate}
                onEventClick={setDetailEvent}
                onEventReschedule={handleRescheduleRequest}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                weekDates={weekDates}
                events={windowedEvents}
                onEventClick={setDetailEvent}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                date={selectedDate ? parseDate(selectedDate) : today}
                events={windowedEvents}
                onEventClick={setDetailEvent}
              />
            )}
            {viewMode === 'list' && (
              <ListView
                events={windowedEvents}
                onEventClick={setDetailEvent}
              />
            )}
          </div>

          {/* Month view: selected day detail panel */}
          {viewMode === 'month' && selectedDate && (() => {
            const dayEvs = windowedEvents.filter((e) => e.date === selectedDate)
            if (dayEvs.length === 0) return null
            return (
              <div className="mt-3">
                <p className="text-[11px] text-white/35 mb-2 px-1">
                  {parseDate(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div className="space-y-1.5">
                  {dayEvs.map((ev) => {
                    const color = STATUS_COLORS[ev.status] ?? '#94A3B8'
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setDetailEvent(ev)}
                        className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left hover:opacity-80 transition-opacity"
                        style={{ background: `${color}10`, border: `1px solid ${color}22` }}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-white/85 truncate">{ev.title}</p>
                          {ev.subtitle && <p className="text-[10px] text-white/35">{ev.subtitle}</p>}
                        </div>
                        {ev.timeStart && <span className="shrink-0 text-[10px] text-white/35">{formatTime(ev.timeStart)}</span>}
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ background: `${color}20`, color }}>{STATUS_LABELS[ev.status]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div className="hidden xl:flex xl:flex-col xl:w-64 shrink-0 gap-3">
          {/* Upcoming shoots */}
          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <h3 className="text-[12px] font-bold text-white mb-3">Upcoming Shoots</h3>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Calendar size={20} className="text-white/15 mb-2" />
                <p className="text-[11px] text-white/30">No shoots in next 30 days</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {upcoming.map((ev) => {
                  const color = STATUS_COLORS[ev.status] ?? '#94A3B8'
                  const d = parseDate(ev.date)
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setDetailEvent(ev)}
                      className="w-full flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left hover:opacity-80 transition-opacity"
                      style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl text-center"
                        style={{ background: `${color}20` }}
                      >
                        <span className="font-mono text-[8px] font-bold text-white/60 uppercase">{MONTHS[d.getMonth()].slice(0, 3)}</span>
                        <span className="font-mono text-[13px] font-bold text-white/90 leading-none">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-white/80">{ev.title.split(' ')[0]}</p>
                        <p className="truncate text-[10px] text-white/35">{ev.subtitle ?? ev.sourceType}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div
            className="rounded-3xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2.5">Status Legend</p>
            <div className="space-y-1.5">
              {Object.entries(STATUS_COLORS).map(([s, color]) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                  <span className="text-[11px] text-white/45">{STATUS_LABELS[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {detailEvent && <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />}

      {showCreate && (
        <CreateEventModal
          initialDate={createInitialDate}
          isBlockMode={false}
          onClose={() => setShowCreate(false)}
          onSave={handleCreateSave}
        />
      )}

      {showBlock && (
        <CreateEventModal
          initialDate={createInitialDate}
          isBlockMode={true}
          onClose={() => setShowBlock(false)}
          onSave={handleCreateSave}
        />
      )}

      {reschedule && (
        <RescheduleConfirm
          event={reschedule.event}
          newDate={reschedule.newDate}
          onConfirm={confirmReschedule}
          onCancel={() => setReschedule(null)}
        />
      )}

      {undoState && (
        <UndoToast
          message={undoState.message}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}
    </div>
  )
}
