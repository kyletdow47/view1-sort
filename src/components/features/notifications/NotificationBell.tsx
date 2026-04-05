'use client'

import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface NotificationBellProps {
  unreadCount: number
  onClick: () => void
}

/**
 * Bell icon for the top nav.
 * Shows an unread badge with count (max 99+).
 * Plays a pulse animation when a new unread notification arrives.
 */
export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  const prevCountRef = useRef(unreadCount)
  const [pulsing, setPulsing] = useState(false)

  // Trigger pulse when unreadCount increases (new notification arrived)
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setPulsing(true)
      const timer = setTimeout(() => setPulsing(false), 2000)
      prevCountRef.current = unreadCount
      return () => clearTimeout(timer)
    }
    prevCountRef.current = unreadCount
  }, [unreadCount])

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <button
      onClick={onClick}
      className="relative text-white/[0.67] transition-colors hover:text-white"
      aria-label={
        unreadCount > 0
          ? `Notifications — ${unreadCount} unread`
          : 'Notifications'
      }
    >
      <Bell className="h-[18px] w-[18px]" />

      {unreadCount > 0 && (
        <>
          {/* Pulse ring — plays when a new notification arrives */}
          {pulsing && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-indigo-500 opacity-75"
            />
          )}
          {/* Solid badge */}
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-500 px-0.5 font-mono text-[9px] font-bold text-white">
            {badgeLabel}
          </span>
        </>
      )}
    </button>
  )
}
