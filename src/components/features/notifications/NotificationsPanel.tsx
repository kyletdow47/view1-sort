'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  DollarSign,
  Eye,
  FileText,
  Pencil,
  UserCheck,
  Cloud,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import type { Notification } from '@/types/supabase'

/* ------------------------------------------------------------------ */
/*  Type → icon / color / route mapping                                */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; dot: string; route: string }
> = {
  booking_new:       { icon: CalendarDays,  bg: 'bg-amber-500/15 text-amber-400 border-amber-500/20',     dot: 'bg-amber-400',    route: '/dashboard/bookings' },
  payment_received:  { icon: DollarSign,    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  route: '/dashboard/finances' },
  payment_failed:    { icon: DollarSign,    bg: 'bg-red-500/15 text-red-400 border-red-500/20',             dot: 'bg-red-400',      route: '/dashboard/finances' },
  edit_requested:    { icon: Pencil,        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/20',     dot: 'bg-amber-400',    route: '/dashboard/projects' },
  gallery_viewed:    { icon: Eye,           bg: 'bg-sky-500/15 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400',      route: '/dashboard/projects' },
  client_accepted:   { icon: UserCheck,     bg: 'bg-violet-500/15 text-violet-400 border-violet-500/20',   dot: 'bg-violet-400',   route: '/dashboard/clients' },
  project_published: { icon: Cloud,         bg: 'bg-sky-500/15 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400',      route: '/dashboard/projects' },
  contract_signed:   { icon: CheckCircle2,  bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  route: '/dashboard/contracts' },
  ai_sort:           { icon: Sparkles,      bg: 'bg-violet-500/15 text-violet-400 border-violet-500/20',   dot: 'bg-violet-400',   route: '/dashboard/projects' },
  upload_complete:   { icon: Cloud,         bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  route: '/dashboard/projects' },
  // Legacy / generic fallbacks
  booking:           { icon: CalendarDays,  bg: 'bg-amber-500/15 text-amber-400 border-amber-500/20',     dot: 'bg-amber-400',    route: '/dashboard/bookings' },
  payment:           { icon: DollarSign,    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',  route: '/dashboard/finances' },
  edit_request:      { icon: FileText,      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/20',     dot: 'bg-amber-400',    route: '/dashboard/projects' },
}

const DEFAULT_CONFIG: (typeof TYPE_CONFIG)[string] = {
  icon: Bell,
  bg: 'bg-white/10 text-white/60 border-white/10',
  dot: 'bg-white/40',
  route: '/dashboard/notifications',
}

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? DEFAULT_CONFIG
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  markAllRead: () => void
  markRead: (id: string) => void
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  markAllRead,
  markRead,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const unreadCount = notifications.filter((n) => !n.read).length
  // Show last 10 in the dropdown
  const visible = notifications.slice(0, 10)

  function handleItemClick(n: Notification) {
    markRead(n.id)
    const cfg = getConfig(n.type)
    // Use metadata.link override if present, otherwise fall back to type-based route
    const route =
      (n.metadata as Record<string, unknown> | null)?.link as string | undefined
      ?? cfg.route
    onClose()
    router.push(route)
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-8 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-white/[0.15] bg-zinc-900/90 shadow-2xl backdrop-blur-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500 px-1.5 font-mono text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-[360px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <Bell className="mb-2 h-8 w-8 text-white/20" />
            <p className="text-xs text-white/40">No notifications</p>
          </div>
        ) : (
          <div>
            {visible.map((n) => {
              const cfg = getConfig(n.type)
              const Icon = cfg.icon
              return (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05] ${
                    n.read ? '' : 'bg-white/[0.04]'
                  }`}
                >
                  {/* Unread indicator bar */}
                  <div
                    className={`mt-1 h-7 w-0.5 shrink-0 rounded-full ${
                      n.read ? 'bg-white/10' : cfg.dot
                    }`}
                  />
                  {/* Icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${cfg.bg}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs leading-snug ${
                        n.read ? 'text-white/60' : 'font-semibold text-white'
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-white/40">
                      {n.body}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-white/25">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {/* Unread dot */}
                  {!n.read && (
                    <span
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.08] px-4 py-3">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="block text-center text-xs text-white/50 transition-colors hover:text-white"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  )
}
