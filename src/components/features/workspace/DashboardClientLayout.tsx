'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  DollarSign,
  Eye,
  UserCheck,
  Cloud,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useNotifications } from '@/hooks/useNotifications'
import { TopNav } from '@/components/features/dashboard-v2/TopNav'

import type { Notification as DBNotification } from '@/types/supabase'

/* ------------------------------------------------------------------ */
/*  Notification helpers                                               */
/* ------------------------------------------------------------------ */

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string }> = {
  booking:        { icon: CalendarDays, bg: 'bg-amber-500/20 text-amber-400' },
  payment:        { icon: DollarSign,  bg: 'bg-emerald-500/20 text-emerald-400' },
  gallery_viewed: { icon: Eye,         bg: 'bg-sky-500/20 text-sky-400' },
  client_accepted:{ icon: UserCheck,   bg: 'bg-violet-500/20 text-violet-400' },
  upload_complete:{ icon: Cloud,       bg: 'bg-emerald-500/20 text-emerald-400' },
}

function NotificationIcon({ type }: { type: string }) {
  const config = NOTIFICATION_TYPE_CONFIG[type] ?? NOTIFICATION_TYPE_CONFIG.booking
  const { icon: Icon, bg } = config
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Icon size={16} />
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return `${Math.floor(days / 30)} mo ago`
}

function NotificationsPanel({
  open,
  onClose,
  notifications,
  markAllRead,
  markRead,
}: {
  open: boolean
  onClose: () => void
  notifications: DBNotification[]
  markAllRead: () => void
  markRead: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute right-8 top-14 z-50 w-80 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Notifications</span>
        <button
          onClick={() => markAllRead()}
          className="text-xs text-white/60 hover:text-white"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/50">No notifications</p>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
            >
              <NotificationIcon type={n.type} />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${n.read ? 'text-white/60' : 'font-medium text-white'}`}>
                  {n.title}
                </p>
                <p className="line-clamp-1 text-[11px] text-white/40">{n.body}</p>
                <p className="text-[10px] text-white/30">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const userInitials = useMemo(() => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) return user.email.slice(0, 2).toUpperCase()
    return 'KD'
  }, [profile, user])

  // Gradient shell for all dashboard pages (including main dashboard)
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden text-white"
      style={{ background: '#050508' }}
    >
      {/* Metallic rainbow mesh gradient — matches Pencil dark metallic design */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 55% at 0% 0%,   rgba(245,158,11,0.22) 0%, transparent 65%)',
            'radial-gradient(ellipse 65% 55% at 100% 15%, rgba(59,130,246,0.20) 0%, transparent 60%)',
            'radial-gradient(ellipse 70% 55% at 55% 100%,rgba(168,85,247,0.22) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 45% at 95% 85%,  rgba(236,72,153,0.18) 0%, transparent 55%)',
            'radial-gradient(ellipse 45% 35% at 25% 60%,  rgba(99,102,241,0.14) 0%, transparent 55%)',
          ].join(','),
        }}
      />

      <TopNav
        userInitials={userInitials}
        unreadCount={unreadCount}
        onBellClick={() => setNotificationsOpen((o) => !o)}
      />

      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications as DBNotification[]}
        markAllRead={markAllRead}
        markRead={markRead}
      />

      <main className="relative flex flex-1 flex-col overflow-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pb-10 pt-6 md:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}
