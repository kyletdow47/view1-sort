import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import { BookingScheduleView } from '@/components/features/bookings/BookingScheduleView'
import { ComingSoonOverlay } from '@/components/common/ComingSoonOverlay'
import type { Booking } from '@/types/supabase'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]

  let bookings: Booking[] = []

  if (workspace) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('shoot_date', { ascending: true })

    bookings = (data ?? []) as Booking[]
  }

  return (
    <ComingSoonOverlay
      feature="Bookings"
      description="Shoot scheduling, calendar sync, and booking confirmations are on the way."
    >
      <BookingScheduleView bookings={bookings} workspaceId={workspace?.id ?? ''} />
    </ComingSoonOverlay>
  )
}
