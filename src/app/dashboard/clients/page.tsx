import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import { ClientsKanbanView } from '@/components/features/clients/ClientsKanbanView'
import type { ClientKanbanItem } from '@/components/features/clients/ClientsKanbanView'
import type { GalleryAccess, GalleryPayment, Project } from '@/types/supabase'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email
  return local
    .replace(/[._+\-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 30)
}

function deriveStage(
  totalPaidCents: number,
  lastAccessed: string | null,
  accessType: string,
): ClientKanbanItem['stage'] {
  if (totalPaidCents > 0) return 'paid'
  if (accessType === 'full' && lastAccessed) return 'delivered'
  if (accessType === 'full') return 'booked'
  if (accessType === 'preview' && lastAccessed) return 'contacted'
  if (accessType === 'preview') return 'inquiry'
  return 'inquiry'
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ClientsPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  if (isDemo) {
    return <ClientsKanbanView clients={[]} />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]
  if (!workspace) return <ClientsKanbanView clients={[]} />

  const { data: projectRows } = await supabase
    .from('projects')
    .select('id, name')
    .eq('workspace_id', workspace.id)

  const projects = (projectRows ?? []) as Pick<Project, 'id' | 'name'>[]
  const projectIds = projects.map((p) => p.id)

  const [accessResult, paymentsResult] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from('gallery_access')
          .select('email, project_id, access_type, accessed_at')
          .in('project_id', projectIds)
      : Promise.resolve({ data: [] as Pick<GalleryAccess, 'email' | 'project_id' | 'access_type' | 'accessed_at'>[] }),
    projectIds.length > 0
      ? supabase
          .from('gallery_payments')
          .select('client_email, amount')
          .in('project_id', projectIds)
          .eq('status', 'paid')
      : Promise.resolve({ data: [] as Pick<GalleryPayment, 'client_email' | 'amount'>[] }),
  ])

  const accessRows = (accessResult.data ?? []) as Pick<GalleryAccess, 'email' | 'project_id' | 'access_type' | 'accessed_at'>[]
  const paymentRows = (paymentsResult.data ?? []) as Pick<GalleryPayment, 'client_email' | 'amount'>[]

  type AggRow = {
    email: string
    lastAccessed: string | null
    totalPaidCents: number
    accessType: string
    projectCount: number
  }

  const clientMap = new Map<string, AggRow>()

  for (const row of accessRows) {
    const key = row.email.toLowerCase()
    const existing = clientMap.get(key)
    if (!existing) {
      clientMap.set(key, {
        email: row.email,
        lastAccessed: row.accessed_at,
        totalPaidCents: 0,
        accessType: row.access_type,
        projectCount: 1,
      })
    } else {
      existing.projectCount++
      if (row.accessed_at && (!existing.lastAccessed || row.accessed_at > existing.lastAccessed)) {
        existing.lastAccessed = row.accessed_at
      }
      if (row.access_type === 'full') existing.accessType = 'full'
    }
  }

  for (const row of paymentRows) {
    if (!row.client_email) continue
    const key = row.client_email.toLowerCase()
    const existing = clientMap.get(key)
    if (existing) existing.totalPaidCents += row.amount ?? 0
  }

  const clients: ClientKanbanItem[] = Array.from(clientMap.values()).map((c) => ({
    email: c.email,
    displayName: nameFromEmail(c.email),
    shootType: `${c.projectCount} ${c.projectCount === 1 ? 'gallery' : 'galleries'}`,
    price: c.totalPaidCents > 0
      ? `$${Math.floor(c.totalPaidCents / 100).toLocaleString('en-US')}`
      : '',
    stage: deriveStage(c.totalPaidCents, c.lastAccessed, c.accessType),
  }))

  return <ClientsKanbanView clients={clients} />
}
