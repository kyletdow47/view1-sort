// =============================================================================
// /client — Client Portal Home (Server Component)
//
// Auth flow:
//   1. Read Supabase session server-side
//   2. Not authenticated → redirect to /auth/client-login
//   3. Authenticated → fetch galleries, pending actions, documents from DB
//   4. Pass data to <ClientDashboard> (Client Component)
//
// TODO(db-migration): Once project_clients, invoices, contracts, and
// questionnaires tables are migrated, replace mock data with:
//   const supabase = createServerClient()
//   const { data: galleries } = await supabase
//     .from('project_clients')
//     .select('projects(*)')
//     .eq('client_email', session.user.email)
//   ... etc.
// =============================================================================

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { ClientDashboard } from '@/components/features/client-portal/ClientDashboard'
import type { ClientDocument, ClientDownloadPack } from '@/components/features/client-portal/ClientDashboard'
import type {
  ClientGallery,
  PendingAction,
  PhotographerBrand,
  FavoritePhoto,
} from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Mock data — will be replaced with Supabase queries after DB migration
// TODO(db-migration): project_clients, projects, invoices, contracts,
//   questionnaires, client_reactions tables required
// ---------------------------------------------------------------------------

const MOCK_BRAND: PhotographerBrand = {
  name: 'Kyle Davis Photography',
  tagline: 'Capturing moments that matter',
  avatarUrl: null,
  avatarInitials: 'KD',
  accentColor: '#5749F4',
  contactEmail: 'kyle@kyledavis.com',
  contactPhone: null,
}

const MOCK_PENDING_ACTIONS: PendingAction[] = [
  {
    id: 'a1',
    label: 'Invoice #INV-047 — Wedding Package • $2,400',
    action: 'Pay Now',
    type: 'invoice',
    href: '#',
  },
  {
    id: 'a2',
    label: 'Sign Contract — Wedding Day Timeline',
    action: 'Sign',
    type: 'contract',
    href: '#',
  },
  {
    id: 'a3',
    label: 'Fill Questionnaire — Wedding Day Preferences',
    action: 'Open',
    type: 'questionnaire',
    href: '#',
  },
]

const MOCK_GALLERIES: ClientGallery[] = [
  {
    id: 'g1',
    name: 'Wedding — Smith',
    coverUrl: null,
    photoCount: 428,
    status: 'ready_to_view',
    shootDate: 'Nov 8, 2025',
    createdAt: '2025-11-10',
    theme: 'dark',
    pricingModel: 'free',
  },
  {
    id: 'g2',
    name: 'Engagement Session',
    coverUrl: null,
    photoCount: 180,
    status: 'pending_selection',
    shootDate: 'Jan 22, 2026',
    createdAt: '2026-01-25',
    theme: 'dark',
    pricingModel: 'per_photo',
  },
  {
    id: 'g3',
    name: 'Family Portraits',
    coverUrl: null,
    photoCount: 94,
    status: 'downloads_ready',
    shootDate: 'Mar 15, 2026',
    createdAt: '2026-03-18',
    theme: 'dark',
    pricingModel: 'flat_fee',
  },
  {
    id: 'g4',
    name: 'Corporate Event',
    coverUrl: null,
    photoCount: 312,
    status: 'ready_to_view',
    shootDate: 'Feb 5, 2026',
    createdAt: '2026-02-08',
    theme: 'dark',
    pricingModel: 'free',
  },
  {
    id: 'g5',
    name: 'Product Shoot',
    coverUrl: null,
    photoCount: 56,
    status: 'processing',
    shootDate: 'Mar 28, 2026',
    createdAt: '2026-03-30',
    theme: 'dark',
    pricingModel: 'flat_fee',
  },
  {
    id: 'g6',
    name: 'Headshots',
    coverUrl: null,
    photoCount: 24,
    status: 'downloads_ready',
    shootDate: 'Mar 20, 2026',
    createdAt: '2026-03-22',
    theme: 'dark',
    pricingModel: 'free',
  },
]

const MOCK_DOCUMENTS: ClientDocument[] = [
  {
    id: 'd1',
    name: 'Wedding Contract',
    type: 'Contract',
    status: 'Signed',
    statusColor: 'text-emerald-400 bg-emerald-400/15',
    date: 'Mar 1, 2026',
    href: '#',
  },
  {
    id: 'd2',
    name: 'Invoice #INV-045',
    type: 'Invoice',
    status: 'Paid',
    statusColor: 'text-emerald-400 bg-emerald-400/15',
    date: 'Feb 20, 2026',
    href: '#',
  },
  {
    id: 'd3',
    name: 'Invoice #INV-041',
    type: 'Invoice',
    status: 'Paid',
    statusColor: 'text-emerald-400 bg-emerald-400/15',
    date: 'Jan 15, 2026',
    href: '#',
  },
  {
    id: 'd4',
    name: 'Wedding Day Questionnaire',
    type: 'Questionnaire',
    status: 'Pending',
    statusColor: 'text-amber-400 bg-amber-400/15',
    date: 'Apr 1, 2026',
    href: '#',
  },
]

const MOCK_DOWNLOAD_PACKS: ClientDownloadPack[] = [
  {
    id: 'dp1',
    name: 'Wedding — Full Gallery',
    photoCount: 45,
    sizeMb: 1240,
    progress: 100,
  },
  {
    id: 'dp2',
    name: 'Engagement — Selects',
    photoCount: 30,
    sizeMb: 680,
    progress: 60,
  },
]

const MOCK_FAVORITES: FavoritePhoto[] = Array.from({ length: 10 }, (_, i) => ({
  id: `fav-${i}`,
  thumbnailUrl: null,
  alt: `Favorite photo ${i + 1}`,
  orientation: null,
}))

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ClientPortalPage() {
  // ── Auth check ──────────────────────────────────────────────────────────
  // TODO(auth): When Supabase auth is fully wired, use createServerClient()
  // to get the session and redirect unauthenticated users.
  //
  // Uncomment the block below once Supabase server client exports are confirmed:
  //
  //   const supabase = await createClient()
  //   const { data: { session } } = await supabase.auth.getSession()
  //   if (!session) {
  //     redirect('/auth/client-login')
  //   }
  //
  // For now we skip the auth check so the page is viewable during development.
  // The /auth/client-login page is ready and linked.

  let clientName = 'Sarah Mitchell'
  let clientInitial = 'S'

  // TODO(db-migration): Replace mock data with real Supabase queries:
  //   const { data: projectClients } = await supabase
  //     .from('project_clients')
  //     .select('projects(id, name, cover_url, photo_count, gallery_status, shoot_date, created_at, gallery_theme, pricing_model)')
  //     .eq('client_email', session.user.email)
  //   const galleries = projectClients?.map(pc => pc.projects) ?? []

  try {
    // Attempt to get real session (graceful fallback to mock if not wired)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const emailName = user.email.split('@')[0]
      clientName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
      clientInitial = clientName.charAt(0).toUpperCase()
    }
  } catch {
    // Auth not configured yet — use mock client name
  }

  return (
    <ClientDashboard
      clientName={clientName}
      clientInitial={clientInitial}
      brand={MOCK_BRAND}
      galleries={MOCK_GALLERIES}
      pendingActions={MOCK_PENDING_ACTIONS}
      documents={MOCK_DOCUMENTS}
      downloadPacks={MOCK_DOWNLOAD_PACKS}
      favorites={MOCK_FAVORITES}
    />
  )
}
