'use client'

// =============================================================================
// ContentCalendar — interactive month/week social post calendar
//
// Features:
//   - Month view: 7-col grid, today highlight, platform-color chips, "+N more"
//   - Week view: hourly grid (6am–11pm), dnd-kit drag-to-reschedule between slots
//   - Click empty day/slot → onDayClick(isoDateStr)
//   - Click post chip → onPostClick(post)
//   - Drag post to new slot → onReschedule(postId, newIsoDateStr)
//   - Month/week nav (prev/next)
//
// Used by: src/app/dashboard/content/page.tsx
// =============================================================================

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { ContentPost, Platform } from '@/types/content'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/** Hours shown in week view: 6am–11pm */
const WEEK_HOURS = Array.from({ length: 18 }, (_, i) => i + 6)

const PLATFORM_DOT: Record<Platform, string> = {
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-500',
  tiktok: 'bg-white',
  pinterest: 'bg-red-500',
}

const PLATFORM_PILL: Record<Platform, string> = {
  instagram: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
  facebook: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  tiktok: 'bg-white/10 border-white/25 text-white/65',
  pinterest: 'bg-red-500/20 border-red-500/40 text-red-300',
}

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

function addDays(base: Date, delta: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + delta)
  return d
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.15) inset',
      }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PostChip — compact colored chip for a scheduled post
// ─────────────────────────────────────────────────────────────────────────────

function PostChip({
  post,
  isDragging = false,
  onClick,
}: {
  post: ContentPost
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  const platform = post.platforms[0] ?? 'instagram'
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 rounded border px-1 py-0.5 text-[9px] font-medium select-none transition-opacity ${
        PLATFORM_PILL[platform]
      } ${isDragging ? 'opacity-40' : 'cursor-pointer hover:opacity-75'}`}
    >
      <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${PLATFORM_DOT[platform]}`} />
      <span className="truncate">{PLATFORM_LABEL[platform]}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DraggableChip — PostChip wrapped with dnd-kit useDraggable (week view)
// ─────────────────────────────────────────────────────────────────────────────

function DraggableChip({
  post,
  onPostClick,
}: {
  post: ContentPost
  onPostClick?: (post: ContentPost) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: post.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <PostChip
        post={post}
        isDragging={isDragging}
        onClick={(e) => {
          e.stopPropagation()
          onPostClick?.(post)
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DroppableSlot — time slot cell in week view, accepts dropped posts
// ─────────────────────────────────────────────────────────────────────────────

function DroppableSlot({
  slotId,
  children,
  onClick,
}: {
  slotId: string
  children?: React.ReactNode
  onClick: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId })
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`relative h-14 cursor-pointer rounded transition-colors ${
        isOver ? 'bg-indigo-500/20' : 'hover:bg-white/[0.03]'
      }`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex flex-col gap-0.5 p-0.5">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PlatformLegend
// ─────────────────────────────────────────────────────────────────────────────

const LEGEND_PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'pinterest']

function PlatformLegend() {
  return (
    <div
      className="flex items-center gap-4 pt-2"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      {LEGEND_PLATFORMS.map((p) => (
        <div key={p} className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${PLATFORM_DOT[p]}`} />
          <span className="text-[10px] text-white/30">{PLATFORM_LABEL[p]}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MonthView
// ─────────────────────────────────────────────────────────────────────────────

interface MonthViewProps {
  year: number
  month: number
  posts: ContentPost[]
  onDayClick: (iso: string) => void
  onPostClick?: (post: ContentPost) => void
}

function MonthView({ year, month, posts, onDayClick, onPostClick }: MonthViewProps) {
  const today = new Date()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Group posts by calendar day number
  const postsByDay = useMemo(() => {
    const map = new Map<number, ContentPost[]>()
    for (const post of posts) {
      if (!post.scheduledAt) continue
      const d = new Date(post.scheduledAt)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        map.set(day, [...(map.get(day) ?? []), post])
      }
    }
    return map
  }, [posts, year, month])

  // 6 rows × 7 cols = 42 cells; null = filler cell outside current month
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstWeekday + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  return (
    <div className="flex flex-1 flex-col gap-1">
      {/* Weekday header row */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[10px] font-medium uppercase tracking-widest text-white/25"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid flex-1 grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          const dayPosts = day !== null ? (postsByDay.get(day) ?? []) : []
          const visible = dayPosts.slice(0, 3)
          const overflow = dayPosts.length - visible.length
          const isToday =
            day !== null &&
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day

          return (
            <div
              key={idx}
              onClick={() => {
                if (day !== null) onDayClick(toIsoDate(year, month, day))
              }}
              className={`flex min-h-[68px] flex-col rounded-xl p-1.5 transition-colors ${
                day !== null
                  ? 'cursor-pointer hover:bg-white/[0.05]'
                  : 'pointer-events-none'
              } ${isToday ? 'bg-indigo-500/[0.12] ring-1 ring-indigo-500/50' : ''}`}
            >
              {day !== null && (
                <>
                  <span
                    className={`mb-1 text-[11px] font-medium leading-none ${
                      isToday ? 'text-indigo-400' : 'text-white/45'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {visible.map((post) => (
                      <PostChip
                        key={post.id}
                        post={post}
                        onClick={(e) => {
                          e.stopPropagation()
                          onPostClick?.(post)
                        }}
                      />
                    ))}
                    {overflow > 0 && (
                      <span className="px-1 text-[9px] text-white/25">+{overflow} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WeekView — hourly grid with dnd-kit drag-to-reschedule
// ─────────────────────────────────────────────────────────────────────────────

interface WeekViewProps {
  weekStart: Date
  posts: ContentPost[]
  onSlotClick: (iso: string) => void
  onPostClick?: (post: ContentPost) => void
  onReschedule?: (postId: string, newIso: string) => void
}

function WeekView({ weekStart, posts, onSlotClick, onPostClick, onReschedule }: WeekViewProps) {
  const today = new Date()
  const [activeId, setActiveId] = useState<string | null>(null)

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  // Group posts by slot key "YYYY-M-D-H" (M is 0-indexed)
  const postsBySlot = useMemo(() => {
    const map = new Map<string, ContentPost[]>()
    for (const post of posts) {
      if (!post.scheduledAt) continue
      const d = new Date(post.scheduledAt)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`
      map.set(key, [...(map.get(key) ?? []), post])
    }
    return map
  }, [posts])

  const activePost = activeId ? posts.find((p) => p.id === activeId) : undefined

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null)
      if (!e.over) return
      // Slot key format: "YYYY-M-D-H"
      const parts = String(e.over.id).split('-')
      if (parts.length !== 4) return
      const [ys, ms, ds, hs] = parts
      if (!ys || !ms || !ds || !hs) return
      const newDate = new Date(
        parseInt(ys, 10),
        parseInt(ms, 10),
        parseInt(ds, 10),
        parseInt(hs, 10),
        0,
        0,
      )
      onReschedule?.(String(e.active.id), newDate.toISOString())
    },
    [onReschedule],
  )

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Day column headers */}
        <div
          className="grid pb-1"
          style={{ gridTemplateColumns: '44px repeat(7, 1fr)', gap: '2px' }}
        >
          <div />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} className="pb-2 text-center">
                <div
                  className={`text-[10px] font-medium uppercase ${
                    isToday ? 'text-indigo-400' : 'text-white/35'
                  }`}
                >
                  {DAY_LABELS[i]}
                </div>
                <div
                  className={`mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold ${
                    isToday ? 'bg-indigo-500 text-white' : 'text-white/60'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hourly rows — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {WEEK_HOURS.map((hour) => (
            <div
              key={hour}
              className="grid"
              style={{ gridTemplateColumns: '44px repeat(7, 1fr)', gap: '2px' }}
            >
              {/* Time label */}
              <div className="flex items-start justify-end pr-2 pt-1 text-[9px] text-white/25">
                {formatHour(hour)}
              </div>
              {/* Droppable slots per day */}
              {weekDays.map((day, di) => {
                const slotKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}-${hour}`
                const slotPosts = postsBySlot.get(slotKey) ?? []
                const slotIso = new Date(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate(),
                  hour,
                ).toISOString()

                return (
                  <DroppableSlot key={di} slotId={slotKey} onClick={() => onSlotClick(slotIso)}>
                    {slotPosts.map((post) => (
                      <DraggableChip key={post.id} post={post} onPostClick={onPostClick} />
                    ))}
                  </DroppableSlot>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activePost && <PostChip post={activePost} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContentCalendar — main export
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentCalendarProps {
  posts: ContentPost[]
  onDayClick: (isoDate: string) => void
  onPostClick?: (post: ContentPost) => void
  onReschedule?: (postId: string, newIsoDate: string) => void
}

export function ContentCalendar({
  posts,
  onDayClick,
  onPostClick,
  onReschedule,
}: ContentCalendarProps) {
  const [view, setView] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const navPrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (view === 'month') d.setMonth(d.getMonth() - 1)
      else d.setDate(d.getDate() - 7)
      return d
    })
  }, [view])

  const navNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (view === 'month') d.setMonth(d.getMonth() + 1)
      else d.setDate(d.getDate() + 7)
      return d
    })
  }, [view])

  // Build heading label
  const headingLabel = useMemo(() => {
    if (view === 'month') return `${MONTH_NAMES[month]!} ${year}`
    const s = weekStart
    const e = weekEnd
    if (s.getMonth() === e.getMonth()) {
      return `${MONTH_NAMES[s.getMonth()]!} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`
    }
    return `${MONTH_NAMES[s.getMonth()]!} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]!} ${e.getDate()}`
  }, [view, year, month, weekStart, weekEnd])

  return (
    <GlassCard className="flex h-full flex-col gap-3 p-5">
      {/* Header: title, nav arrows, view toggle, new post */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-white">{headingLabel}</span>
          <div className="flex items-center">
            <button
              onClick={navPrev}
              aria-label="Previous"
              className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={navNext}
              aria-label="Next"
              className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {(['month', 'week'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                view === v
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {v}
            </button>
          ))}
          <button
            onClick={() => onDayClick(new Date().toISOString().slice(0, 10))}
            className="ml-1 flex items-center gap-1 rounded-xl border border-white/20 px-2.5 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <Plus className="h-3 w-3" />
            New
          </button>
        </div>
      </div>

      {/* Calendar body */}
      {view === 'month' ? (
        <MonthView
          year={year}
          month={month}
          posts={posts}
          onDayClick={onDayClick}
          onPostClick={onPostClick}
        />
      ) : (
        <WeekView
          weekStart={weekStart}
          posts={posts}
          onSlotClick={onDayClick}
          onPostClick={onPostClick}
          onReschedule={onReschedule}
        />
      )}

      {/* Platform legend */}
      <PlatformLegend />
    </GlassCard>
  )
}
