import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { CalendarDashboardView } from '@/components/features/calendar/CalendarDashboardView'
import CalendarLoading from './loading'
import type { CalendarEvent } from '@/types/calendar'

/**
 * Calendar Page — /dashboard/calendar
 *
 * Server Component: fetches calendar events from Supabase (bookings + projects),
 * passes to CalendarDashboardView client component.
 *
 * CalendarDashboardView uses useSearchParams for view persistence, so it must
 * be wrapped in Suspense per Next.js App Router requirements.
 *
 * TODO: fetch real data once `calendar_events`, `bookings`, `projects` tables exist
 * (see ARCHITECTURE-DECISIONS.md §Decision 8). Falls back to MOCK_EVENTS.
 */
export default async function CalendarPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  // Demo / pre-migration: pass empty arrays — client component uses mock data
  if (isDemo) {
    return (
      <Suspense fallback={<CalendarLoading />}>
        <CalendarDashboardView initialEvents={[] as CalendarEvent[]} />
      </Suspense>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Suspense fallback={<CalendarLoading />}>
        <CalendarDashboardView initialEvents={[] as CalendarEvent[]} />
      </Suspense>
    )
  }

  // TODO: fetch real events once tables exist
  //
  // const { data: calendarRows } = await supabase
  //   .from('calendar_events')
  //   .select('*')
  //   .eq('photographer_id', user.id)
  //   .order('date', { ascending: true })
  //
  // const { data: bookingRows } = await supabase
  //   .from('bookings')
  //   .select('id, client_name, booking_type, stage, shoot_date, location')
  //   .eq('photographer_id', user.id)
  //   .not('shoot_date', 'is', null)
  //
  // const { data: projectRows } = await supabase
  //   .from('projects')
  //   .select('id, title, status, metadata')
  //   .eq('photographer_id', user.id)
  //   .not('metadata->core->shoot_date', 'is', null)

  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarDashboardView initialEvents={[] as CalendarEvent[]} />
    </Suspense>
  )
}
