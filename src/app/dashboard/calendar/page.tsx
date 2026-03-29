import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import { CalendarView } from '@/components/features/CalendarView'
import type { Booking } from '@/types/supabase'

function getDemoBookings(): Booking[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'demo-bk-001',
      workspace_id: 'demo-ws',
      client_name: 'Sarah & James Mitchell',
      client_email: 'sarah.mitchell@email.com',
      shoot_date: '2026-03-07',
      shoot_time: '14:00',
      package_type: 'Wedding Full Day',
      amount_cents: 350000,
      location: 'Villa Rosa Estate, Tuscany',
      notes: 'Outdoor ceremony at 3pm, reception in the garden tent. Second shooter confirmed.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-002',
      workspace_id: 'demo-ws',
      client_name: 'Emily Chen',
      client_email: 'emily.chen@email.com',
      shoot_date: '2026-03-12',
      shoot_time: '10:00',
      package_type: 'Portrait Session',
      amount_cents: 45000,
      location: 'Riverside Park, Downtown',
      notes: 'Professional headshots for LinkedIn and personal branding. Bring 3 outfit changes.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-003',
      workspace_id: 'demo-ws',
      client_name: 'Marcus & Priya Johnson',
      client_email: 'marcus.johnson@email.com',
      shoot_date: '2026-03-18',
      shoot_time: '16:30',
      package_type: 'Engagement Session',
      amount_cents: 75000,
      location: 'Golden Gate Park, San Francisco',
      notes: 'Golden hour shoot. Couple wants candid style with some posed portraits.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-004',
      workspace_id: 'demo-ws',
      client_name: 'Pinnacle Realty Group',
      client_email: 'listings@pinnaclerealty.com',
      shoot_date: '2026-03-22',
      shoot_time: '09:00',
      package_type: 'Real Estate',
      amount_cents: 55000,
      location: '742 Oceanview Dr, Malibu',
      notes: '4-bed luxury listing. Interior, exterior, aerial drone shots. Twilight reshoot if needed.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-005',
      workspace_id: 'demo-ws',
      client_name: 'TechNova Inc.',
      client_email: 'hr@technova.io',
      shoot_date: '2026-03-26',
      shoot_time: '11:00',
      package_type: 'Corporate Headshots',
      amount_cents: 120000,
      location: 'TechNova HQ, 500 Innovation Blvd',
      notes: 'Team headshots for 15 employees. White backdrop, consistent lighting. Will provide brand guidelines.',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-006',
      workspace_id: 'demo-ws',
      client_name: 'The Nguyen Family',
      client_email: 'lisa.nguyen@email.com',
      shoot_date: '2026-04-04',
      shoot_time: '15:00',
      package_type: 'Family Portrait',
      amount_cents: 65000,
      location: 'Botanical Gardens, Eastside',
      notes: 'Family of 5 with toddler twins. Relaxed outdoor session, spring blossoms as backdrop.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-007',
      workspace_id: 'demo-ws',
      client_name: 'Rachel & David Kim',
      client_email: 'rachel.kim@email.com',
      shoot_date: '2026-04-11',
      shoot_time: '13:00',
      package_type: 'Wedding Full Day',
      amount_cents: 400000,
      location: 'St. Andrews Chapel & The Grand Ballroom',
      notes: 'Church ceremony at 1:30pm, cocktail hour photos at 4pm, reception at 5:30pm. Videographer on-site.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-008',
      workspace_id: 'demo-ws',
      client_name: 'Olivia Hart',
      client_email: 'olivia.hart@email.com',
      shoot_date: '2026-04-15',
      shoot_time: '17:00',
      package_type: 'Portrait Session',
      amount_cents: 50000,
      location: 'Studio B, 220 Arts District',
      notes: 'Senior portrait session. Studio with colored gels and natural light options.',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-009',
      workspace_id: 'demo-ws',
      client_name: 'Luxe Living Properties',
      client_email: 'photos@luxeliving.com',
      shoot_date: '2026-04-22',
      shoot_time: '08:30',
      package_type: 'Real Estate',
      amount_cents: 85000,
      location: '1200 Hilltop Terrace, Pacific Heights',
      notes: 'Penthouse listing, 3 floors. Drone exterior, twilight shots, virtual staging for empty rooms.',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-bk-010',
      workspace_id: 'demo-ws',
      client_name: 'Amanda & Carlos Rivera',
      client_email: 'amanda.rivera@email.com',
      shoot_date: '2026-04-28',
      shoot_time: '16:00',
      package_type: 'Engagement Session',
      amount_cents: 75000,
      location: 'Old Town Historic District',
      notes: 'Couple met at the local bookshop — want some shots there plus rooftop sunset.',
      status: 'confirmed',
      created_at: now,
      updated_at: now,
    },
  ]
}

export default async function CalendarPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  let bookings: Booking[] = []

  if (isDemo) {
    bookings = getDemoBookings()
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const workspaces = await getWorkspaces(supabase, user.id)
    const workspace = workspaces[0]

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
