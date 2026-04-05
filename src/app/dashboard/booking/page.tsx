import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { BookingDashboardView } from '@/components/features/booking/BookingDashboardView'
import type { BookingRecord, BookingPackage } from '@/types/booking'

/**
 * Bookings Pipeline Page — /dashboard/booking
 *
 * Server Component: fetches bookings + packages from Supabase, passes to
 * BookingDashboardView client component.
 *
 * TODO: create Supabase tables `bookings` and `packages` (see ARCHITECTURE-DECISIONS.md §Decision 8)
 * Until those tables exist, BookingDashboardView falls back to MOCK_BOOKINGS / MOCK_PACKAGES.
 */
export default async function BookingPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  // Demo / pre-migration: pass empty arrays — client component uses mock data
  if (isDemo) {
    return (
      <BookingDashboardView
        initialBookings={[] as BookingRecord[]}
        initialPackages={[] as BookingPackage[]}
        photographerSlug="demo"
      />
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <BookingDashboardView
        initialBookings={[] as BookingRecord[]}
        initialPackages={[] as BookingPackage[]}
        photographerSlug="photographer"
      />
    )
  }

  // TODO: fetch real data once `bookings` and `packages` tables exist
  // const { data: bookingRows } = await supabase
  //   .from('bookings')
  //   .select('*')
  //   .eq('photographer_id', user.id)
  //   .order('created_at', { ascending: false })
  //
  // const { data: packageRows } = await supabase
  //   .from('packages')
  //   .select('*')
  //   .eq('photographer_id', user.id)
  //   .order('sort_order', { ascending: true })
  //
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('slug')
  //   .eq('id', user.id)
  //   .single()

  // Placeholder slug from email prefix until profiles table has slug column
  const slug = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') ?? 'photographer'

  return (
    <BookingDashboardView
      initialBookings={[] as BookingRecord[]}
      initialPackages={[] as BookingPackage[]}
      photographerSlug={slug}
    />
  )
}
