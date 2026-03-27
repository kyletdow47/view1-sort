import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import { CalendarView } from '@/components/features/CalendarView'
import type { Booking } from '@/types/supabase'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]

  let bookings: Booking[] = []

  if (workspace) {
    // Fetch bookings for the next 6 months + last 2 months for context
    const rangeStart = new Date()
    rangeStart.setMonth(rangeStart.getMonth() - 2)
    const rangeEnd = new Date()
    rangeEnd.setMonth(rangeEnd.getMonth() + 6)

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('workspace_id', workspace.id)
      .gte('shoot_date', rangeStart.toISOString().slice(0, 10))
      .lte('shoot_date', rangeEnd.toISOString().slice(0, 10))
      .order('shoot_date', { ascending: true })

    bookings = (data ?? []) as Booking[]
  }

  const now = new Date()

  return (
    <CalendarView
      bookings={bookings}
      todayYear={now.getFullYear()}
      todayMonth={now.getMonth()}
      todayDay={now.getDate()}
    />
  )
}
