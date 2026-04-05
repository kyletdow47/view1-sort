import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import { BookingPageEditorClient } from '@/components/features/booking/BookingPageEditorClient'

/**
 * /dashboard/bookings/photo-page
 *
 * Standalone route for the Booking Photo Page Builder.
 * Also accessible as the "Page Editor" tab inside the Bookings dashboard view.
 *
 * TODO(db-migration): fetch active packages from Supabase booking_packages table once migrated
 */
export default async function BookingsPhotoPageRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let photographerSlug = 'photographer'

  if (user) {
    const workspaces = await getWorkspaces(supabase, user.id)
    const workspace = workspaces?.[0]
    if (workspace?.slug) {
      photographerSlug = workspace.slug
    }
  }

  return (
    <div className="h-full min-h-0">
      <BookingPageEditorClient photographerSlug={photographerSlug} />
    </div>
  )
}
