'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  Pencil,
  Sparkles,
  Trash2,
  UserCheck,
  Cloud,
  CheckCircle2,
  X,
} from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Types ──────────────────────────────────────────────────────────── */

type NotifType =
  | 'booking_new'
  | 'payment_received'
  | 'payment_failed'
  | 'edit_requested'
  | 'gallery_viewed'
  | 'client_accepted'
  | 'project_published'
  | 'contract_signed'
  | 'ai_sort'
  | 'upload_complete'

type ReadFilter = 'all' | 'unread' | 'read'
type TypeFilter = 'all' | 'bookings' | 'payments' | 'galleries' | 'system'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  route: string
}

/* ─── Config ─────────────────────────────────────────────────────────── */

const TYPE_CONFIG: Record<
  NotifType,
  { icon: React.ElementType; accent: string; dot: string; category: TypeFilter }
> = {
  booking_new:       { icon: CalendarDays,  accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20',      dot: 'bg-amber-400',    category: 'bookings'  },
  payment_received:  { icon: DollarSign,    accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  category: 'payments'  },
  payment_failed:    { icon: DollarSign,    accent: 'bg-red-500/15 text-red-400 border-red-500/20',              dot: 'bg-red-400',      category: 'payments'  },
  edit_requested:    { icon: Pencil,        accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20',      dot: 'bg-amber-400',    category: 'system'    },
  gallery_viewed:    { icon: Eye,           accent: 'bg-sky-500/15 text-sky-400 border-sky-500/20',              dot: 'bg-sky-400',      category: 'galleries' },
  client_accepted:   { icon: UserCheck,     accent: 'bg-violet-500/15 text-violet-400 border-violet-500/20',    dot: 'bg-violet-400',   category: 'system'    },
  project_published: { icon: Cloud,         accent: 'bg-sky-500/15 text-sky-400 border-sky-500/20',              dot: 'bg-sky-400',      category: 'galleries' },
  contract_signed:   { icon: CheckCircle2,  accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  category: 'system'    },
  ai_sort:           { icon: Sparkles,      accent: 'bg-violet-500/15 text-violet-400 border-violet-500/20',    dot: 'bg-violet-400',   category: 'system'    },
  upload_complete:   { icon: Cloud,         accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  category: 'system'    },
}

const READ_FILTERS: { value: ReadFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

const TYPE_FILTERS: { value: TypeFilter; label: string; icon: React.ElementType }[] = [
  { value: 'all',      label: 'All types',  icon: Bell },
  { value: 'bookings', label: 'Bookings',   icon: CalendarDays },
  { value: 'payments', label: 'Payments',   icon: DollarSign },
  { value: 'galleries',label: 'Galleries',  icon: Eye },
  { value: 'system',   label: 'System',     icon: FileText },
]

const PAGE_SIZE = 10

/* ─── Mock data (TODO: replace with useNotifications hook + pagination) ── */

const INITIAL: Notification[] = [
  { id: 'n1',  type: 'gallery_viewed',   title: 'Sarah Mitchell viewed your gallery',    body: 'Smith Wedding — gallery opened, 47 photos favorited.',        time: '2 min ago',   read: false, route: '/dashboard/projects' },
  { id: 'n2',  type: 'payment_received', title: 'Payment received — $1,200',             body: 'James Wilson paid Invoice #INV-048 in full.',                  time: '1 hour ago',  read: false, route: '/dashboard/finances' },
  { id: 'n3',  type: 'ai_sort',          title: 'AI Sort complete — Johnson Wedding',    body: '1,247 photos sorted → 420 selects across 8 categories.',      time: '3 hours ago', read: false, route: '/dashboard/projects' },
  { id: 'n4',  type: 'booking_new',      title: 'New booking inquiry — Park Portrait',   body: 'Samantha Park requested availability for June 12.',            time: '5 hours ago', read: false, route: '/dashboard/bookings' },
  { id: 'n5',  type: 'edit_requested',   title: 'New edit request from Emily Chen',      body: 'Chen Engagement — 3 photos flagged for color correction.',     time: 'Yesterday',   read: true,  route: '/dashboard/projects' },
  { id: 'n6',  type: 'contract_signed',  title: 'Contract signed — Torres Portrait',     body: 'Alex Torres signed the Photography Services Agreement.',       time: 'Yesterday',   read: true,  route: '/dashboard/contracts' },
  { id: 'n7',  type: 'gallery_viewed',   title: 'Corporate Event gallery shared',        body: 'You shared the Meridian Hotel gallery. 2 clients notified.',  time: '2 days ago',  read: true,  route: '/dashboard/projects' },
  { id: 'n8',  type: 'payment_received', title: 'Payout processed — $3,200',             body: 'Stripe payout to your bank account completed.',                time: '3 days ago',  read: true,  route: '/dashboard/finances' },
  { id: 'n9',  type: 'ai_sort',          title: 'AI Sort complete — Oak Street Product', body: '156 photos sorted → 82 selects.',                             time: '4 days ago',  read: true,  route: '/dashboard/projects' },
  { id: 'n10', type: 'client_accepted',  title: 'Rivera accepted gallery invite',        body: 'Mia Rivera accepted the gallery link for Rivera Quinceañera.', time: '5 days ago',  read: true,  route: '/dashboard/clients'  },
  { id: 'n11', type: 'project_published','title': 'Gallery published — Chen Engagement', body: 'Your gallery is live and accessible to the client.',           time: '6 days ago',  read: true,  route: '/dashboard/projects' },
  { id: 'n12', type: 'payment_failed',   title: 'Payment failed — Johnson Wedding',      body: 'Card ending 4242 was declined. Ask client to update billing.', time: '1 week ago',  read: true,  route: '/dashboard/finances' },
  { id: 'n13', type: 'upload_complete',  title: 'Upload complete — Martinez Wedding',    body: '2,341 photos uploaded successfully. Ready for AI sort.',       time: '1 week ago',  read: true,  route: '/dashboard/projects' },
  { id: 'n14', type: 'booking_new',      title: 'New booking inquiry — Kim Portraits',   body: 'Jenny Kim requested a family portrait session.',               time: '2 weeks ago', read: true,  route: '/dashboard/bookings' },
]

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  /* ── Derived state ── */

  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
        const readOk =
          readFilter === 'all' ||
          (readFilter === 'unread' && !n.read) ||
          (readFilter === 'read' && n.read)
        const typeOk =
          typeFilter === 'all' || TYPE_CONFIG[n.type].category === typeFilter
        return readOk && typeOk
      }),
    [notifications, readFilter, typeFilter],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePageNum = Math.min(page, totalPages)
  const paged = filtered.slice((safePageNum - 1) * PAGE_SIZE, safePageNum * PAGE_SIZE)
  const unreadCount = notifications.filter((n) => !n.read).length

  /* ── Selection helpers ── */

  const allPageSelected =
    paged.length > 0 && paged.every((n) => selected.has(n.id))

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        paged.forEach((n) => next.delete(n.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        paged.forEach((n) => next.add(n.id))
        return next
      })
    }
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /* ── Bulk actions ── */

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  function markSelectedRead() {
    setNotifications((prev) =>
      prev.map((n) => (selected.has(n.id) ? { ...n, read: true } : n)),
    )
    setSelected(new Set())
  }

  function deleteSelected() {
    setNotifications((prev) => prev.filter((n) => !selected.has(n.id)))
    setSelected(new Set())
    // Navigate back to page 1 in case deleted items reduce total pages
    setPage(1)
  }

  function handleItemClick(n: Notification) {
    markRead(n.id)
    router.push(n.route)
  }

  /* ── Reset page when filters change ── */

  function handleReadFilter(f: ReadFilter) {
    setReadFilter(f)
    setPage(1)
    setSelected(new Set())
  }

  function handleTypeFilter(f: TypeFilter) {
    setTypeFilter(f)
    setPage(1)
    setSelected(new Set())
  }

  /* ── Render ── */

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-xl font-bold text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-violet-500 px-2 py-0.5 font-mono text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Read/unread filter pills */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white/[0.07] p-1">
            {READ_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleReadFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  readFilter === f.value
                    ? 'bg-white/[0.13] text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-white/60 transition-colors hover:text-white"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Type filter chips ── */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleTypeFilter(value)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
              typeFilter === value
                ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
                : 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white'
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Bulk action bar (visible when items selected) ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5">
          <span className="text-xs text-white/70">
            {selected.size} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={markSelectedRead}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              <Check className="h-3 w-3" />
              Mark read
            </button>
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/70 transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg p-1.5 text-white/40 transition-colors hover:text-white"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* ── Select all row ── */}
      {paged.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/40 hover:text-white/70">
            <input
              type="checkbox"
              checked={allPageSelected}
              onChange={toggleSelectAll}
              className="h-3.5 w-3.5 cursor-pointer accent-indigo-500"
            />
            Select all on this page
          </label>
          <span className="ml-auto text-xs text-white/30">
            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Notification list ── */}
      {paged.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">
            {readFilter !== 'all' || typeFilter !== 'all'
              ? 'No notifications match your filters'
              : 'No notifications'}
          </p>
          {(readFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setReadFilter('all')
                setTypeFilter('all')
              }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Clear filters
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {paged.map((n) => {
            const cfg = TYPE_CONFIG[n.type]
            const Icon = cfg.icon
            const isSelected = selected.has(n.id)
            return (
              <div
                key={n.id}
                className={`group flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
                  isSelected
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : n.read
                    ? 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'
                    : 'border-white/[0.12] bg-white/[0.07] hover:bg-white/[0.09]'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItem(n.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer accent-indigo-500"
                />
                {/* Unread bar */}
                <div
                  className={`mt-1 h-8 w-0.5 shrink-0 rounded-full ${
                    n.read ? 'bg-white/10' : cfg.dot
                  }`}
                />
                {/* Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${cfg.accent}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {/* Content — clickable */}
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => handleItemClick(n)}
                >
                  <p
                    className={`text-sm ${
                      n.read ? 'text-white/70' : 'font-semibold text-white'
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">{n.body}</p>
                  <p className="mt-1 font-mono text-[11px] text-white/30">
                    {n.time}
                  </p>
                </button>
                {/* Unread dot */}
                {!n.read && (
                  <span
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePageNum === 1}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-3 w-3" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                  p === safePageNum
                    ? 'bg-white/[0.13] text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePageNum === totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
