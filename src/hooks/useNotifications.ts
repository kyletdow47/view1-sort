'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/supabase'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setNotifications((data as Notification[]) ?? [])
      setLoading(false)
    }

    fetch()
  }, [supabase])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [supabase, notifications])

  const markRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [supabase])

  return { notifications, unreadCount, loading, markAllRead, markRead }
}
