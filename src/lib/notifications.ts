import { createClient } from '@/lib/supabase/server'

type NotificationType =
  | 'payment_received'
  | 'gallery_invite_sent'
  | 'project_published'
  | 'upload_complete'
  | 'gallery_viewed'
  | 'booking_created'
  | 'client_accepted'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  body: string
  metadata?: Record<string, string>
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata,
}: CreateNotificationParams) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      body,
      metadata: metadata ?? {},
      read: false,
    })

    if (error) {
      console.error('[notifications] Insert failed:', error)
    }
  } catch (err) {
    console.error('[notifications] Error:', err)
  }
}

export async function getUnreadNotifications(userId: string, limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[notifications] Fetch failed:', error)
    return []
  }

  return data ?? []
}

export async function markAllRead(userId: string) {
  const supabase = await createClient()

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
}
