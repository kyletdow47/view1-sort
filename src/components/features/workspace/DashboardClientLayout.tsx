'use client'

import React, { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useNotifications } from '@/hooks/useNotifications'
import { TopNav } from '@/components/features/dashboard-v2/TopNav'
import { NotificationsPanel } from '@/components/features/notifications/NotificationsPanel'

import type { Notification as DBNotification } from '@/types/supabase'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
