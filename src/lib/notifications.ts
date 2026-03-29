/**
 * Server-side notification creation service.
 * Inserts rows into the notifications table for key events.
 */

import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, key)
}

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  body: string
  metadata?: Record<string, unknown>
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    read: false,
    metadata: params.metadata ?? null,
  })
  if (error) {
    console.error('Failed to create notification:', error)
  }
}

/* ── Convenience functions for specific event types ── */

export async function notifyPaymentReceived(
  photographerId: string,
  clientEmail: string,
  projectName: string,
  amount: string,
): Promise<void> {
  await createNotification({
    userId: photographerId,
    type: 'payment',
    title: 'Payment Received',
    body: `${amount} received from ${clientEmail} for "${projectName}".`,
    metadata: { clientEmail, projectName, amount },
  })
}

export async function notifyGalleryViewed(
  photographerId: string,
  viewerEmail: string,
  projectName: string,
): Promise<void> {
  await createNotification({
    userId: photographerId,
    type: 'gallery_viewed',
    title: 'Gallery Viewed',
    body: `${viewerEmail} viewed the "${projectName}" gallery.`,
    metadata: { viewerEmail, projectName },
  })
}

export async function notifyClientAccepted(
  photographerId: string,
  clientEmail: string,
  projectName: string,
): Promise<void> {
  await createNotification({
    userId: photographerId,
    type: 'client_accepted',
    title: 'Client Accepted Invite',
    body: `${clientEmail} accepted your invitation to "${projectName}".`,
    metadata: { clientEmail, projectName },
  })
}

export async function notifyUploadComplete(
  userId: string,
  projectName: string,
  photoCount: number,
): Promise<void> {
  await createNotification({
    userId,
    type: 'upload_complete',
    title: 'Upload Complete',
    body: `${photoCount} photos uploaded to "${projectName}".`,
    metadata: { projectName, photoCount },
  })
}

export async function notifyBookingRequest(
  photographerId: string,
  clientName: string,
  details: string,
): Promise<void> {
  await createNotification({
    userId: photographerId,
    type: 'booking',
    title: 'New Booking Request',
    body: `${clientName} ${details}`,
    metadata: { clientName },
  })
}
