'use client'

import { useState, useCallback, useId } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  CalendarDays,
  List,
  Plus,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ImageIcon,
  Send,
  Filter,
  Search,
  Check,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Platform = 'instagram' | 'facebook' | 'pinterest' | 'tiktok'
type PostStatus = 'draft' | 'scheduled' | 'published'
type CaptionTone = 'professional' | 'warm' | 'storytelling'

interface ContentPost {
  id: string
  caption: string
  platforms: Platform[]
  scheduledDate: string // ISO date string YYYY-MM-DD
  scheduledTime: string // HH:MM
  status: PostStatus
  thumbnailUrl?: string
  projectId?: string
  projectName?: string
  hashtags: string[]
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const TODAY = new Date()
const YY = TODAY.getFullYear()
const MM = TODAY.getMonth() // 0-based

function dateStr(day: number): string {
  return `${YY}-${String(MM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const INITIAL_POSTS: ContentPost[] = [
  {
    id: 'post-1',
    caption: '✨ Golden hour never disappoints. Every frame tells a story. #GoldenHour #WeddingPhotography',
    platforms: ['instagram', 'facebook'],
    scheduledDate: dateStr(3),
    scheduledTime: '09:00',
    status: 'published',
    projectName: 'Johnson Wedding',
    hashtags: ['#GoldenHour', '#WeddingPhotography'],
  },
  {
    id: 'post-2',
    caption: 'POV: You booked your dream photographer 🎬✨ Day-of gallery delivered in 48hrs.',
    platforms: ['tiktok', 'instagram'],
    scheduledDate: dateStr(7),
    scheduledTime: '18:30',
    status: 'published',
    projectName: 'Smith Portraits',
    hashtags: ['#WeddingPhotography', '#BehindTheLens'],
  },
  {
    id: 'post-3',
    caption: 'Golden Hour Wedding Photography Inspiration | Soft light portraits | Natural outdoor ceremony',
    platforms: ['pinterest'],
    scheduledDate: dateStr(10),
    scheduledTime: '12:00',
    status: 'scheduled',
    projectName: 'Johnson Wedding',
    hashtags: ['#WeddingInspo', '#Photography'],
  },
  {
    id: 'post-4',
    caption: 'Love captured in light. 💛 Grateful for couples who trust me to preserve their precious moments.',
    platforms: ['instagram', 'facebook', 'pinterest'],
    scheduledDate: dateStr(14),
    scheduledTime: '10:00',
    status: 'scheduled',
    projectName: 'Nike Campaign',
    hashtags: ['#Photography', '#NaturalLight'],
  },
  {
    id: 'post-5',
    caption: 'Editing this gallery at midnight because I can\'t stop 😭📷 #WeddingPhotographer #PhotoEditing',
    platforms: ['tiktok'],
    scheduledDate: dateStr(18),
    scheduledTime: '20:00',
    status: 'scheduled',
    projectName: 'Coastal Real Estate',
    hashtags: ['#PhotoEditing', '#LateNightEdits'],
  },
  {
    id: 'post-6',
    caption: 'Behind the lens on a commercial shoot day. The energy on set was electric.',
    platforms: ['instagram'],
    scheduledDate: dateStr(22),
    scheduledTime: '14:00',
    status: 'draft',
    projectName: 'Nike Campaign',
    hashtags: ['#CommercialPhotography', '#BehindTheScenes'],
  },
  {
    id: 'post-7',
    caption: 'New gallery just dropped for the Meridian Hotel rebrand. Swipe to see the full series.',
    platforms: ['instagram', 'facebook'],
    scheduledDate: dateStr(25),
    scheduledTime: '11:00',
    status: 'draft',
    projectName: 'Meridian Hotel',
    hashtags: ['#CommercialPhotography', '#InteriorDesign'],
  },
]

const MOCK_GALLERY_PHOTOS = [
  { id: 'p1', name: 'Johnson Wedding — Ceremony', url: '' },
  { id: 'p2', name: 'Johnson Wedding — Reception', url: '' },
  { id: 'p3', name: 'Smith Portraits — Outdoor', url: '' },
  { id: 'p4', name: 'Nike Campaign — Studio 1', url: '' },
  { id: 'p5', name: 'Nike Campaign — Lifestyle', url: '' },
  { id: 'p6', name: 'Meridian Hotel — Lobby', url: '' },
]

/* ------------------------------------------------------------------ */
/*  Platform helpers                                                    */
/* ------------------------------------------------------------------ */

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bg: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.15)' },
  facebook:  { label: 'Facebook',  color: '#1877F2', bg: 'rgba(24,119,242,0.15)' },
  pinterest: { label: 'Pinterest', color: '#E60023', bg: 'rgba(230,0,35,0.15)' },
  tiktok:    { label: 'TikTok',    color: '#FF0050', bg: 'rgba(255,0,80,0.12)' },
}

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
  scheduled: { label: 'Scheduled', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
  published: { label: 'Published', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
}

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'pinterest', 'tiktok']

/* ------------------------------------------------------------------ */
/*  Platform icon SVGs                                                  */
/* ------------------------------------------------------------------ */

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function PinterestIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.09-2.37 3.09-5.17 0-2.14-1.44-3.63-3.5-3.63-2.38 0-3.78 1.79-3.78 3.63 0 .72.28 1.49.62 1.91.07.08.08.15.06.24-.06.27-.21.84-.23.96-.04.15-.13.18-.3.11-1.11-.52-1.8-2.14-1.8-3.44 0-2.8 2.04-5.37 5.87-5.37 3.08 0 5.47 2.19 5.47 5.12 0 3.06-1.93 5.51-4.6 5.51-.9 0-1.74-.47-2.03-1.02l-.55 2.07c-.2.77-.74 1.73-1.1 2.32.83.26 1.71.4 2.63.4 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  )
}

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  )
}

function PlatformIcon({ platform, size = 14 }: { platform: Platform; size?: number }) {
  const { color } = PLATFORM_CONFIG[platform]
  return (
    <span style={{ color }}>
      {platform === 'instagram' && <InstagramIcon size={size} />}
      {platform === 'facebook'  && <FacebookIcon size={size} />}
      {platform === 'pinterest' && <PinterestIcon size={size} />}
      {platform === 'tiktok'    && <TikTokIcon size={size} />}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Glass primitives                                                    */
/* ------------------------------------------------------------------ */

function GlassCard({
  children,
  className = '',
  noPad = false,
}: {
  children: React.ReactNode
  className?: string
  noPad?: boolean
}) {
  return (
    <div
      className={`rounded-3xl backdrop-blur-[32px] ${noPad ? '' : 'p-4'} ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {children}
    </div>
  )
}

function GlassCardSecondary({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-[16px] p-4 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.20)',
      }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: PostStatus }) {
  const { label, color, bg } = STATUS_CONFIG[status]
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Draggable post chip (calendar cell)                                 */
/* ------------------------------------------------------------------ */

function DraggablePostChip({ post }: { post: ContentPost }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  })

  const firstPlatform = post.platforms[0]
  const statusDot = STATUS_CONFIG[post.status]

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="mb-1 cursor-grab rounded-lg px-1.5 py-1 text-[10px] leading-tight active:cursor-grabbing"
      style={{
        background: isDragging ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.18)',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
      }}
    >
      <div className="flex items-center gap-1">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: statusDot.color }}
        />
        <PlatformIcon platform={firstPlatform} size={10} />
        <span className="truncate text-white/80" style={{ maxWidth: 64 }}>
          {post.caption.slice(0, 18)}…
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Droppable calendar date cell                                        */
/* ------------------------------------------------------------------ */

function CalendarDateCell({
  day,
  isCurrentMonth,
  isToday,
  posts,
  onAddPost,
}: {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  posts: ContentPost[]
  onAddPost: (date: string) => void
}) {
  const dateKey = dateStr(day)
  const { setNodeRef, isOver } = useDroppable({ id: dateKey })
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={setNodeRef}
      className="group relative min-h-[80px] rounded-xl p-1.5 transition-colors"
      style={{
        background: isOver
          ? 'rgba(129,140,248,0.15)'
          : isToday
          ? 'rgba(129,140,248,0.08)'
          : isCurrentMonth
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        border: isOver
          ? '1px solid rgba(129,140,248,0.5)'
          : isToday
          ? '1px solid rgba(129,140,248,0.35)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium"
          style={{
            background: isToday ? '#818cf8' : 'transparent',
            color: isToday ? '#fff' : isCurrentMonth ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
          }}
        >
          {day}
        </span>
        {hovered && isCurrentMonth && (
          <button
            onClick={() => onAddPost(dateKey)}
            className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-white/20"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <Plus size={10} />
          </button>
        )}
      </div>
      {posts.map((p) => (
        <DraggablePostChip key={p.id} post={p} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Calendar view                                                       */
/* ------------------------------------------------------------------ */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function CalendarView({
  posts,
  onPostsChange,
  onAddPost,
}: {
  posts: ContentPost[]
  onPostsChange: (posts: ContentPost[]) => void
  onAddPost: (date: string) => void
}) {
  const [viewYear, setViewYear] = useState(YY)
  const [viewMonth, setViewMonth] = useState(MM)
  const [activeDragPost, setActiveDragPost] = useState<ContentPost | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  // Days from previous month to fill the grid
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

  // Build grid: 6 rows × 7 cols = 42 cells
  const cells: Array<{ day: number; currentMonth: boolean }> = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: prevMonthDays - firstDayOfWeek + 1 + i, currentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true })
  }
  while (cells.length < 42) {
    cells.push({ day: cells.length - daysInMonth - firstDayOfWeek + 1, currentMonth: false })
  }

  const postsByDate = useCallback(
    (day: number) => {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      return posts.filter((p) => p.scheduledDate === key)
    },
    [posts, viewYear, viewMonth]
  )

  const isToday = (day: number) =>
    viewYear === TODAY.getFullYear() &&
    viewMonth === TODAY.getMonth() &&
    day === TODAY.getDate()

  function handleDragStart(event: DragStartEvent) {
    const post = posts.find((p) => p.id === event.active.id)
    setActiveDragPost(post ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragPost(null)
    const { active, over } = event
    if (!over) return
    const postId = active.id as string
    const newDate = over.id as string
    onPostsChange(
      posts.map((p) =>
        p.id === postId ? { ...p, scheduledDate: newDate } : p
      )
    )
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <GlassCard className="flex-1">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={16} className="text-white/70" />
          </button>
          <h3 className="text-sm font-semibold text-white/95">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
          >
            <ChevronRight size={16} className="text-white/70" />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-white/40">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => (
            <CalendarDateCell
              key={idx}
              day={cell.day}
              isCurrentMonth={cell.currentMonth}
              isToday={cell.currentMonth && isToday(cell.day)}
              posts={cell.currentMonth ? postsByDate(cell.day) : []}
              onAddPost={onAddPost}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
              <span className="text-[10px] text-white/50">{cfg.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <DragOverlay>
        {activeDragPost && (
          <div
            className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-white shadow-xl"
            style={{
              background: 'rgba(129,140,248,0.85)',
              border: '1px solid rgba(129,140,248,0.9)',
              backdropFilter: 'blur(12px)',
              maxWidth: 180,
            }}
          >
            {activeDragPost.caption.slice(0, 40)}…
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

/* ------------------------------------------------------------------ */
/*  Posts list view                                                     */
/* ------------------------------------------------------------------ */

function PostsListView({
  posts,
  onSelectPost,
}: {
  posts: ContentPost[]
  onSelectPost: (post: ContentPost) => void
}) {
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = posts.filter((p) => {
    if (filterPlatform !== 'all' && !p.platforms.includes(filterPlatform)) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (search && !p.caption.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <GlassCard className="flex-1">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <Search size={14} className="text-white/50" />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/40 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={13} className="text-white/50" />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
            className="rounded-lg px-2 py-1.5 text-xs text-white/80 outline-none"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{PLATFORM_CONFIG[p].label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PostStatus | 'all')}
            className="rounded-lg px-2 py-1.5 text-xs text-white/80 outline-none"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Post rows */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-white/40">No posts found</div>
        )}
        {filtered.map((post) => (
          <div
            key={post.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => onSelectPost(post)}
          >
            {/* Thumbnail placeholder */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <ImageIcon size={18} className="text-white/30" />
            </div>

            {/* Caption + meta */}
            <div className="min-w-0 flex-1">
              <p className="mb-1 truncate text-sm text-white/90">{post.caption}</p>
              <div className="flex flex-wrap items-center gap-2">
                {post.platforms.map((pl) => (
                  <span
                    key={pl}
                    className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: PLATFORM_CONFIG[pl].bg, color: PLATFORM_CONFIG[pl].color }}
                  >
                    <PlatformIcon platform={pl} size={9} />
                    {PLATFORM_CONFIG[pl].label}
                  </span>
                ))}
                {post.projectName && (
                  <span className="text-[11px] text-white/40">{post.projectName}</span>
                )}
              </div>
            </div>

            {/* Schedule + status */}
            <div className="shrink-0 text-right">
              <div className="mb-1.5 flex items-center justify-end gap-1 text-[11px] text-white/50">
                <Clock size={10} />
                {post.scheduledDate} {post.scheduledTime}
              </div>
              <StatusBadge status={post.status} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Post creator panel                                                  */
/* ------------------------------------------------------------------ */

interface PostForm {
  caption: string
  platforms: Platform[]
  scheduledDate: string
  scheduledTime: string
  status: PostStatus
  selectedPhotoId: string
}

function PostCreatorPanel({
  initialDate,
  editPost,
  onSave,
  onClose,
}: {
  initialDate?: string
  editPost?: ContentPost
  onSave: (post: ContentPost) => void
  onClose: () => void
}) {
  const genId = useId()
  const [form, setForm] = useState<PostForm>({
    caption: editPost?.caption ?? '',
    platforms: editPost?.platforms ?? ['instagram'],
    scheduledDate: editPost?.scheduledDate ?? initialDate ?? dateStr(TODAY.getDate()),
    scheduledTime: editPost?.scheduledTime ?? '10:00',
    status: editPost?.status ?? 'draft',
    selectedPhotoId: editPost?.id ?? '',
  })
  const [captionLoading, setCaptionLoading] = useState(false)
  const [captionVariants, setCaptionVariants] = useState<Record<CaptionTone, string> | null>(null)
  const [activeTone, setActiveTone] = useState<CaptionTone>('professional')

  function togglePlatform(p: Platform) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }))
  }

  async function generateCaption() {
    if (!form.platforms[0]) return
    setCaptionLoading(true)
    setCaptionVariants(null)
    try {
      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: form.platforms[0] }),
      })
      const data = await res.json() as { tone_variants: Record<CaptionTone, string> }
      setCaptionVariants(data.tone_variants)
      setForm((f) => ({ ...f, caption: data.tone_variants.professional }))
      setActiveTone('professional')
    } catch {
      // keep existing caption
    } finally {
      setCaptionLoading(false)
    }
  }

  function applyTone(tone: CaptionTone) {
    if (!captionVariants) return
    setActiveTone(tone)
    setForm((f) => ({ ...f, caption: captionVariants[tone] }))
  }

  function handleSave() {
    if (!form.caption.trim() || form.platforms.length === 0) return
    const post: ContentPost = {
      id: editPost?.id ?? `post-${genId}`,
      caption: form.caption,
      platforms: form.platforms,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      status: form.status,
      projectName: editPost?.projectName,
      hashtags: [],
    }
    onSave(post)
    onClose()
  }

  return (
    <div
      className="flex h-full flex-col overflow-y-auto rounded-3xl backdrop-blur-[40px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.06) 100%)',
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow:
          '0 16px 48px rgba(0,0,0,0.25), 0 2px 8px rgba(255,255,255,0.05), 0 1px 0 rgba(255,255,255,0.20)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h3 className="text-sm font-semibold text-white/95">
          {editPost ? 'Edit Post' : 'New Post'}
        </h3>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
        >
          <X size={15} className="text-white/60" />
        </button>
      </div>

      <div className="flex-1 space-y-5 p-5">
        {/* Photo selector */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Photo</label>
          <div className="grid grid-cols-3 gap-2">
            {MOCK_GALLERY_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setForm((f) => ({ ...f, selectedPhotoId: photo.id }))}
                className="relative aspect-square overflow-hidden rounded-xl transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border:
                    form.selectedPhotoId === photo.id
                      ? '2px solid #818cf8'
                      : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon size={16} className="text-white/30" />
                </div>
                {form.selectedPhotoId === photo.id && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-indigo-500/30">
                    <Check size={14} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-1">
                  <p className="truncate text-[8px] text-white/60">{photo.name.split(' — ')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-white/60">Caption</label>
            <button
              onClick={generateCaption}
              disabled={captionLoading}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: captionLoading
                  ? 'rgba(129,140,248,0.2)'
                  : 'linear-gradient(135deg, rgba(129,140,248,0.35) 0%, rgba(167,139,250,0.25) 100%)',
                border: '1px solid rgba(129,140,248,0.4)',
                color: '#a5b4fc',
              }}
            >
              <Sparkles size={11} className={captionLoading ? 'animate-spin' : ''} />
              {captionLoading ? 'Generating…' : 'Generate with AI'}
            </button>
          </div>

          {/* Tone tabs (visible after generation) */}
          {captionVariants && (
            <div className="mb-2 flex gap-1">
              {(['professional', 'warm', 'storytelling'] as CaptionTone[]).map((tone) => (
                <button
                  key={tone}
                  onClick={() => applyTone(tone)}
                  className="rounded-lg px-2 py-1 text-[10px] font-medium capitalize transition-colors"
                  style={{
                    background:
                      activeTone === tone ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.06)',
                    border:
                      activeTone === tone
                        ? '1px solid rgba(129,140,248,0.5)'
                        : '1px solid rgba(255,255,255,0.10)',
                    color: activeTone === tone ? '#a5b4fc' : 'rgba(255,255,255,0.50)',
                  }}
                >
                  {tone}
                </button>
              ))}
            </div>
          )}

          <textarea
            rows={4}
            value={form.caption}
            onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            placeholder="Write your caption or generate with AI…"
            className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none transition-colors focus:border-white/30"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          />
        </div>

        {/* Platforms */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const cfg = PLATFORM_CONFIG[p]
              const active = form.platforms.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: active ? cfg.bg : 'rgba(255,255,255,0.06)',
                    border: active
                      ? `1px solid ${cfg.color}50`
                      : '1px solid rgba(255,255,255,0.12)',
                    color: active ? cfg.color : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <PlatformIcon platform={p} size={12} />
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-white/60">Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm text-white/80 outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                colorScheme: 'dark',
              }}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white/60">Time</label>
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm text-white/80 outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                colorScheme: 'dark',
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Status</label>
          <div className="flex gap-2">
            {(['draft', 'scheduled', 'published'] as PostStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s]
              return (
                <button
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all"
                  style={{
                    background: form.status === s ? cfg.bg : 'rgba(255,255,255,0.06)',
                    border:
                      form.status === s
                        ? `1px solid ${cfg.color}50`
                        : '1px solid rgba(255,255,255,0.12)',
                    color: form.status === s ? cfg.color : 'rgba(255,255,255,0.40)',
                  }}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Platform previews */}
        {form.caption && form.platforms.length > 0 && (
          <div>
            <label className="mb-3 block text-xs font-medium text-white/60">Preview</label>
            <div className="space-y-2">
              {form.platforms.map((pl) => (
                <PlatformPreview key={pl} platform={pl} caption={form.caption} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-4">
        <button
          onClick={handleSave}
          disabled={!form.caption.trim() || form.platforms.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
          }}
        >
          <Send size={14} />
          {editPost ? 'Save Changes' : 'Save Post'}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Platform preview card (static mockup)                              */
/* ------------------------------------------------------------------ */

function PlatformPreview({ platform, caption }: { platform: Platform; caption: string }) {
  const cfg = PLATFORM_CONFIG[platform]
  const displayCaption = caption.length > 100 ? caption.slice(0, 100) + '…' : caption

  return (
    <GlassCardSecondary>
      <div className="mb-2 flex items-center gap-2">
        <span style={{ color: cfg.color }}>
          <PlatformIcon platform={platform} size={13} />
        </span>
        <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
      {/* Mock post image slot */}
      <div
        className="mb-2 flex h-20 w-full items-center justify-center rounded-lg"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <ImageIcon size={20} className="text-white/20" />
      </div>
      {/* Caption text */}
      <p className="text-[11px] leading-relaxed text-white/70">{displayCaption}</p>
    </GlassCardSecondary>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

type View = 'calendar' | 'posts'

export default function ContentPage() {
  const [view, setView] = useState<View>('calendar')
  const [posts, setPosts] = useState<ContentPost[]>(INITIAL_POSTS)
  const [showCreator, setShowCreator] = useState(false)
  const [editingPost, setEditingPost] = useState<ContentPost | undefined>()
  const [creatorInitialDate, setCreatorInitialDate] = useState<string | undefined>()

  function handleAddPost(date?: string) {
    setEditingPost(undefined)
    setCreatorInitialDate(date)
    setShowCreator(true)
  }

  function handleEditPost(post: ContentPost) {
    setEditingPost(post)
    setCreatorInitialDate(undefined)
    setShowCreator(true)
  }

  function handleSavePost(post: ContentPost) {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = post
        return updated
      }
      return [...prev, post]
    })
  }

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length
  const publishedCount = posts.filter((p) => p.status === 'published').length
  const draftCount = posts.filter((p) => p.status === 'draft').length

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
        padding: '32px 85px 85px',
      }}
    >
      {/* Radial overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 20% 10%, rgba(255,255,255,0.07) 0%, transparent 100%)',
        }}
      />

      <div className="relative">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-white">Content Hub</h1>
            <p className="text-sm text-white/60">
              Schedule, create, and publish social media content
            </p>
          </div>
          <button
            onClick={() => handleAddPost()}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
            }}
          >
            <Plus size={16} />
            New Post
          </button>
        </div>

        {/* KPI row */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Scheduled', value: scheduledCount, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
            { label: 'Published', value: publishedCount, color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
            { label: 'Drafts',    value: draftCount,     color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl px-4 py-3 backdrop-blur-[16px]"
              style={{ background: kpi.bg, border: `1px solid ${kpi.color}25` }}
            >
              <p className="text-[11px] font-medium text-white/50">{kpi.label}</p>
              <p className="text-2xl font-bold" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div className="mb-5 flex items-center gap-1">
          <div
            className="flex rounded-xl p-1"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            {(
              [
                { key: 'calendar', label: 'Calendar', icon: CalendarDays },
                { key: 'posts',    label: 'Posts',    icon: List },
              ] as { key: View; label: string; icon: React.ElementType }[]
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                style={{
                  background:
                    view === key ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color:
                    view === key ? '#ffffff' : 'rgba(255,255,255,0.50)',
                  border:
                    view === key
                      ? '1px solid rgba(255,255,255,0.25)'
                      : '1px solid transparent',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main layout: view + optional creator panel */}
        <div className="flex gap-5">
          {/* View area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {view === 'calendar' ? (
              <CalendarView
                posts={posts}
                onPostsChange={setPosts}
                onAddPost={handleAddPost}
              />
            ) : (
              <PostsListView posts={posts} onSelectPost={handleEditPost} />
            )}
          </div>

          {/* Post creator panel */}
          {showCreator && (
            <div className="w-[340px] shrink-0">
              <PostCreatorPanel
                initialDate={creatorInitialDate}
                editPost={editingPost}
                onSave={handleSavePost}
                onClose={() => setShowCreator(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
