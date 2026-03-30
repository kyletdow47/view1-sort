'use client'

import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  AlertTriangle,
  Truck,
  Users,
  Clock,
  MapPin,
  User,
  List,
  LayoutGrid,
  CalendarDays,
  X,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// 2026 calendar constants (not a leap year)
const DAYS_IN_MONTH_2026 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EventType = 'shoot' | 'deadline' | 'delivery' | 'meeting'

interface CalEvent {
  id: number
  year: number
  month: number
  day: number
  title: string
  client: string
  time: string
  location: string
  type: EventType
  daysLeft?: number
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const EVENTS: CalEvent[] = [
  // March 2026
  { id: 1, year: 2026, month: 2, day: 2, title: 'Torres Engagement', client: 'Sofia & Marco Torres', time: '16:00–19:00', location: 'Napa Vineyards', type: 'shoot' },
  { id: 2, year: 2026, month: 2, day: 5, title: 'Johnson Wedding', client: 'Emily & Ryan Johnson', time: '14:00–22:00', location: 'Sonoma Valley Estate', type: 'shoot' },
  { id: 3, year: 2026, month: 2, day: 7, title: 'Nike Campaign Delivery', client: 'Nike Brand Studio', time: '17:00', location: 'Remote', type: 'delivery' },
  { id: 4, year: 2026, month: 2, day: 10, title: 'Smith Family Portraits', client: 'David Smith', time: '09:00–11:00', location: 'Golden Gate Park', type: 'shoot' },
  { id: 5, year: 2026, month: 2, day: 12, title: 'Meridian Hotel Proofing', client: 'Meridian Hotels Group', time: '15:00', location: 'Zoom', type: 'meeting' },
  { id: 6, year: 2026, month: 2, day: 14, title: 'Johnson Gallery Deadline', client: 'Emily & Ryan Johnson', time: 'EOD', location: 'Online', type: 'deadline', daysLeft: 0 },
  { id: 7, year: 2026, month: 2, day: 17, title: 'Vogue Editorial Shoot', client: 'Condé Nast', time: '10:00–18:00', location: 'Studio B, SoMa', type: 'shoot' },
  { id: 8, year: 2026, month: 2, day: 19, title: 'Chen Family Session', client: 'Wei & Lily Chen', time: '10:00–12:00', location: 'Presidio', type: 'shoot' },
  { id: 9, year: 2026, month: 2, day: 21, title: 'Coastal RE Delivery', client: 'Pacific Properties', time: 'EOD', location: 'Remote', type: 'delivery' },
  { id: 10, year: 2026, month: 2, day: 24, title: 'Nike Campaign Shoot', client: 'Nike Brand Studio', time: '07:00–15:00', location: 'Crissy Field', type: 'shoot' },
  { id: 11, year: 2026, month: 2, day: 26, title: 'Client Review Meeting', client: 'Meridian Hotels Group', time: '11:00–12:00', location: 'Zoom', type: 'meeting' },
  { id: 12, year: 2026, month: 2, day: 28, title: 'Vogue Gallery Deadline', client: 'Condé Nast', time: 'EOD', location: 'Online', type: 'deadline', daysLeft: 3 },
  { id: 13, year: 2026, month: 2, day: 30, title: 'Torres Delivery', client: 'Sofia & Marco Torres', time: 'EOD', location: 'Remote', type: 'delivery' },
  // April 2026
  { id: 14, year: 2026, month: 3, day: 3, title: 'Walsh Corporate Headshots', client: 'Walsh & Partners LLP', time: '09:00–13:00', location: 'Client Office, FiDi', type: 'shoot' },
  { id: 15, year: 2026, month: 3, day: 7, title: 'Spring Lookbook', client: 'Bloom Apparel', time: '08:00–16:00', location: 'Botanical Gardens', type: 'shoot' },
  { id: 16, year: 2026, month: 3, day: 11, title: 'Walsh Delivery', client: 'Walsh & Partners LLP', time: 'EOD', location: 'Remote', type: 'delivery' },
  { id: 17, year: 2026, month: 3, day: 14, title: 'Budget Review', client: 'Internal', time: '14:00', location: 'Zoom', type: 'meeting' },
  { id: 18, year: 2026, month: 3, day: 18, title: 'Reyes Quinceañera', client: 'Isabella Reyes', time: '13:00–21:00', location: 'Fairmont Hotel', type: 'shoot' },
]

const TODAY = { year: 2026, month: 2, day: 30 }

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TYPE_STYLES: Record<EventType, { pill: string; dot: string; icon: React.ElementType }> = {
  shoot: { pill: 'bg-primary text-on-primary', dot: 'bg-primary', icon: Camera },
  deadline: { pill: 'bg-surface-container-high text-on-surface border border-outline-variant', dot: 'bg-on-surface-variant', icon: AlertTriangle },
  delivery: { pill: 'bg-surface-container-high text-on-surface border border-outline-variant', dot: 'bg-on-surface', icon: Truck },
  meeting: { pill: 'bg-surface-container-high text-on-surface border border-outline-variant', dot: 'bg-on-surface-variant', icon: Users },
}

type ViewMode = 'month' | 'week' | 'list'

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function EventPill({ event }: { event: CalEvent }) {
  const styles = TYPE_STYLES[event.type]
  return (
    <div className={`truncate rounded px-1.5 py-0.5 font-mono text-[9px] font-bold leading-tight ${styles.pill}`}>
      {event.title}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Month View                                                         */
/* ------------------------------------------------------------------ */

function MonthView({
  year,
  month,
  onDayClick,
  selectedDay,
}: {
  year: number
  month: number
  onDayClick: (day: number) => void
  selectedDay: number | null
}) {
  const firstDay = firstDayOfMonth(year, month)
  const daysInMonth = DAYS_IN_MONTH_2026[month]
  const isToday = (d: number) => year === TODAY.year && month === TODAY.month && d === TODAY.day

  const cells: React.ReactNode[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div key={`pad-${i}`} className="min-h-24 border-b border-r border-outline-variant bg-surface-container" />,
    )
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = EVENTS.filter((e) => e.year === year && e.month === month && e.day === d)
    const visible = dayEvents.slice(0, 3)
    const overflow = dayEvents.length - 3

    cells.push(
      <div
        key={d}
        onClick={() => onDayClick(d)}
        className={[
          'min-h-24 cursor-pointer border-b border-r border-outline-variant p-1.5 transition-colors hover:bg-surface-container-high',
          selectedDay === d ? 'bg-surface-container-high' : 'bg-surface-container-low',
          isToday(d) ? 'ring-2 ring-inset ring-primary' : '',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold',
            isToday(d) ? 'bg-primary text-on-primary' : 'text-on-surface-variant',
          ].join(' ')}
        >
          {d}
        </span>
        <div className="mt-1 space-y-0.5">
          {visible.map((e) => (
            <EventPill key={e.id} event={e} />
          ))}
          {overflow > 0 && (
            <span className="font-mono text-[9px] text-on-surface-variant pl-1">+{overflow} more</span>
          )}
        </div>
      </div>,
    )
  }

  return (
    <div className="rounded-2xl border border-outline-variant overflow-hidden bg-surface-container-low">
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-high">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">{cells}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Week View                                                          */
/* ------------------------------------------------------------------ */

function WeekView({ year, month, day }: { year: number; month: number; day: number }) {
  // Build the 7-day week starting from the Sunday of the week containing `day`
  const date = new Date(year, month, day)
  const sundayOffset = date.getDay()
  const weekDays: { label: string; d: number; m: number; y: number }[] = []

  for (let i = 0; i < 7; i++) {
    const cur = new Date(year, month, day - sundayOffset + i)
    weekDays.push({
      label: DAY_NAMES[cur.getDay()],
      d: cur.getDate(),
      m: cur.getMonth(),
      y: cur.getFullYear(),
    })
  }

  return (
    <div className="rounded-2xl border border-outline-variant overflow-hidden bg-surface-container-low">
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-high">
        {weekDays.map((wd) => {
          const isToday = wd.y === TODAY.year && wd.m === TODAY.month && wd.d === TODAY.day
          return (
            <div key={`${wd.m}-${wd.d}`} className="py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{wd.label}</p>
              <p className={[
                'mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full font-mono text-sm font-bold',
                isToday ? 'bg-primary text-on-primary' : 'text-on-surface',
              ].join(' ')}>
                {wd.d}
              </p>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-7 min-h-64">
        {weekDays.map((wd) => {
          const dayEvents = EVENTS.filter((e) => e.year === wd.y && e.month === wd.m && e.day === wd.d)
          return (
            <div key={`col-${wd.m}-${wd.d}`} className="border-r border-outline-variant last:border-r-0 p-2 space-y-1.5">
              {dayEvents.map((ev) => {
                const styles = TYPE_STYLES[ev.type]
                return (
                  <div key={ev.id} className={`rounded-lg p-2 text-[10px] ${styles.pill}`}>
                    <p className="font-bold font-mono truncate">{ev.title}</p>
                    <p className="font-mono opacity-75 mt-0.5">{ev.time}</p>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  List View                                                          */
/* ------------------------------------------------------------------ */

function ListView({ year, month }: { year: number; month: number }) {
  const monthEvents = EVENTS
    .filter((e) => e.year === year && e.month === month)
    .sort((a, b) => a.day - b.day)

  // Group by day
  const grouped = monthEvents.reduce<Record<number, CalEvent[]>>((acc, e) => {
    if (!acc[e.day]) acc[e.day] = []
    acc[e.day].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([dayStr, events]) => {
        const d = parseInt(dayStr)
        const dateObj = new Date(year, month, d)
        const isToday = year === TODAY.year && month === TODAY.month && d === TODAY.day
        return (
          <div key={d}>
            <div className="flex items-center gap-3 mb-2">
              <div className={[
                'flex h-9 w-9 flex-col items-center justify-center rounded-xl font-mono',
                isToday ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface',
              ].join(' ')}>
                <span className="text-[10px] leading-none">{DAY_NAMES[dateObj.getDay()]}</span>
                <span className="text-sm font-bold leading-none">{d}</span>
              </div>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>
            <div className="space-y-2 pl-12">
              {events.map((ev) => {
                const styles = TYPE_STYLES[ev.type]
                const Icon = styles.icon
                return (
                  <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ev.type === 'shoot' ? 'bg-primary' : 'bg-surface-container-high'}`}>
                      <Icon size={13} className={ev.type === 'shoot' ? 'text-on-primary' : 'text-on-surface-variant'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-on-surface">{ev.title}</p>
                      <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">{ev.client}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <Clock size={10} />
                        <span className="font-mono text-[10px]">{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant mt-0.5">
                        <MapPin size={10} />
                        <span className="font-mono text-[10px] truncate max-w-24">{ev.location}</span>
                      </div>
                    </div>
                  </div>
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
/*  Day Popover / Sidebar                                              */
/* ------------------------------------------------------------------ */

function DaySidebar({
  year,
  month,
  day,
  onClose,
}: {
  year: number
  month: number
  day: number
  onClose: () => void
}) {
  const events = EVENTS.filter((e) => e.year === year && e.month === month && e.day === day)
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {MONTH_NAMES[month]} {day}
          </p>
          <p className="font-headline text-lg font-bold text-on-surface">
            {events.length === 0 ? 'No events' : `${events.length} event${events.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-container-high text-on-surface-variant transition-colors">
          <X size={14} />
        </button>
      </div>
      {events.length === 0 ? (
        <p className="font-body text-sm text-on-surface-variant italic">Nothing scheduled for this day.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const styles = TYPE_STYLES[ev.type]
            const Icon = styles.icon
            return (
              <div key={ev.id} className="rounded-xl border border-outline-variant bg-surface-container p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${ev.type === 'shoot' ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                    <Icon size={11} className={ev.type === 'shoot' ? 'text-on-primary' : 'text-on-surface-variant'} />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-on-surface">{ev.title}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant">{ev.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span className="font-mono text-[10px]">{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    <span className="font-mono text-[10px]">{ev.location}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Right Sidebar                                                      */
/* ------------------------------------------------------------------ */

function RightSidebar({
  year,
  month,
}: {
  year: number
  month: number
}) {
  const [form, setForm] = useState({ name: '', date: '', type: 'shoot' })

  const upcomingShoots = EVENTS
    .filter((e) => e.type === 'shoot' && (e.year > year || (e.year === year && e.month >= month)))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      if (a.month !== b.month) return a.month - b.month
      return a.day - b.day
    })
    .slice(0, 5)

  const pendingDeadlines = EVENTS
    .filter((e) => (e.type === 'deadline' || e.type === 'delivery') && e.daysLeft !== undefined)
    .slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Upcoming Shoots */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <div className="flex items-center gap-2 mb-4">
          <Camera size={14} className="text-primary" />
          <h3 className="font-headline font-bold text-sm text-on-surface">Upcoming Shoots</h3>
        </div>
        <div className="space-y-3">
          {upcomingShoots.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-container-high">
                <span className="font-mono text-[9px] text-on-surface-variant leading-none">{MONTH_NAMES[ev.month].slice(0, 3)}</span>
                <span className="font-mono text-sm font-bold text-on-surface leading-none">{ev.day}</span>
              </div>
              <div className="min-w-0">
                <p className="font-body text-xs font-medium text-on-surface truncate">{ev.title}</p>
                <p className="font-mono text-[10px] text-on-surface-variant truncate">{ev.client}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Deadlines */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-on-surface-variant" />
          <h3 className="font-headline font-bold text-sm text-on-surface">Pending Deadlines</h3>
        </div>
        <div className="space-y-3">
          {pendingDeadlines.map((ev) => (
            <div key={ev.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-body text-xs font-medium text-on-surface truncate">{ev.title}</p>
                <p className="font-mono text-[10px] text-on-surface-variant">{ev.client}</p>
              </div>
              <span className={[
                'shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold',
                ev.daysLeft === 0 ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container-high text-on-surface-variant',
              ].join(' ')}>
                {ev.daysLeft === 0 ? 'Due today' : `${ev.daysLeft}d left`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={14} className="text-primary" />
          <h3 className="font-headline font-bold text-sm text-on-surface">Add Shoot</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Shoot Name</label>
            <input
              type="text"
              placeholder="e.g. Miller Wedding"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-2 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-2 font-mono text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-2 font-mono text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="shoot">Shoot</option>
              <option value="delivery">Delivery</option>
              <option value="deadline">Deadline</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <button className="w-full rounded-xl bg-primary py-2 font-mono text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-90">
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('month')
  const [year, setYear] = useState(TODAY.year)
  const [month, setMonth] = useState(TODAY.month)
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY.day)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  function goToday() {
    setYear(TODAY.year)
    setMonth(TODAY.month)
    setSelectedDay(TODAY.day)
  }

  const showSidebar = view === 'month' || view === 'list'

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-3xl font-extrabold italic text-on-surface">
            {MONTH_NAMES[month]} {year}
          </h1>
          <div className="flex items-center gap-1 rounded-xl border border-outline-variant p-1">
            <button onClick={prevMonth} className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
              <ChevronLeft size={15} />
            </button>
            <button onClick={goToday} className="rounded-lg px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
              Today
            </button>
            <button onClick={nextMonth} className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-outline-variant p-1">
            {([
              { id: 'month', label: 'Month', Icon: LayoutGrid },
              { id: 'week', label: 'Week', Icon: CalendarDays },
              { id: 'list', label: 'List', Icon: List },
            ] as { id: ViewMode; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={[
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors',
                  view === id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface',
                ].join(' ')}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-on-primary shadow transition-opacity hover:opacity-90">
            <Plus size={14} />
            New Booking
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={showSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : ''}>
        <div className={showSidebar ? 'lg:col-span-8 space-y-4' : ''}>
          {view === 'month' && (
            <>
              <MonthView
                year={year}
                month={month}
                onDayClick={(d) => setSelectedDay(prev => prev === d ? null : d)}
                selectedDay={selectedDay}
              />
              {selectedDay !== null && (
                <DaySidebar
                  year={year}
                  month={month}
                  day={selectedDay}
                  onClose={() => setSelectedDay(null)}
                />
              )}
            </>
          )}
          {view === 'week' && (
            <WeekView year={year} month={month} day={selectedDay ?? TODAY.day} />
          )}
          {view === 'list' && (
            <ListView year={year} month={month} />
          )}
        </div>

        {showSidebar && (
          <div className="lg:col-span-4">
            <RightSidebar year={year} month={month} />
          </div>
        )}
      </div>
    </div>
  )
}
