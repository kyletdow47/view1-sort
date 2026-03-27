import {
  UserPlus,
  TrendingUp,
  Users,
  MoreHorizontal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
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

function initials(email: string): string {
  const words = nameFromEmail(email).split(' ')
  return words
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  'from-[#ffb780] to-[#d48441]',
  'from-[#95d1d1] to-[#6aabab]',
  'from-[#ffb4a5] to-[#e7765f]',
  'from-[#c4a5ff] to-[#9a6de0]',
  'from-[#a8d5a2] to-[#5fa85a]',
]

function avatarColor(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]
  if (!workspace) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant text-sm">No workspace found.</p>
      </div>
    )
  }

  // Fetch project IDs for this workspace
  const { data: projectRows } = await supabase
    .from('projects')
    .select('id, name')
    .eq('workspace_id', workspace.id)

  const projects = (projectRows ?? []) as Pick<Project, 'id' | 'name'>[]
  const projectIds = projects.map((p) => p.id)
  const projectNameMap: Record<string, string> = {}
  for (const p of projects) projectNameMap[p.id] = p.name

  // Parallel fetch: gallery_access + gallery_payments
  const [accessResult, paymentsResult] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from('gallery_access')
          .select('email, project_id, access_type, granted_at, accessed_at')
          .in('project_id', projectIds)
          .order('granted_at', { ascending: false })
      : Promise.resolve({ data: [] as Pick<GalleryAccess, 'email' | 'project_id' | 'access_type' | 'granted_at' | 'accessed_at'>[], error: null }),
    projectIds.length > 0
      ? supabase
          .from('gallery_payments')
          .select('client_email, amount, paid_at')
          .in('project_id', projectIds)
          .eq('status', 'paid')
      : Promise.resolve({ data: [] as Pick<GalleryPayment, 'client_email' | 'amount' | 'paid_at'>[], error: null }),
  ])

  const accessRows = (accessResult.data ?? []) as Pick<GalleryAccess, 'email' | 'project_id' | 'access_type' | 'granted_at' | 'accessed_at'>[]
  const paymentRows = (paymentsResult.data ?? []) as Pick<GalleryPayment, 'client_email' | 'amount' | 'paid_at'>[]

  // Build per-client aggregates
  const clientMap = new Map<string, {
    email: string
    projects: Set<string>
    lastAccessed: string | null
    totalPaidCents: number
    accessType: GalleryAccess['access_type']
  }>()

  for (const row of accessRows) {
    const key = row.email.toLowerCase()
    const existing = clientMap.get(key)
    if (!existing) {
      clientMap.set(key, {
        email: row.email,
        projects: new Set([row.project_id]),
        lastAccessed: row.accessed_at,
        totalPaidCents: 0,
        accessType: row.access_type,
      })
    } else {
      existing.projects.add(row.project_id)
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
    if (existing) {
      existing.totalPaidCents += row.amount ?? 0
    }
  }

  const clients = Array.from(clientMap.values())
    .sort((a, b) => (b.lastAccessed ?? '').localeCompare(a.lastAccessed ?? ''))

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const activeThisMonth = clients.filter((c) => c.lastAccessed && c.lastAccessed >= thirtyDaysAgo).length
  const totalRevenueCents = paymentRows.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Profiles</h1>
            <p className="text-sm text-[#a18d80] mt-1">
              Clients who have accessed your galleries
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#534439] text-sm font-medium text-[#d9c2b4] hover:bg-[#2c2928] transition-colors">
            <UserPlus size={15} />
            Invite Client
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px] bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-4">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-1">Total Clients</p>
            <p className="text-2xl font-bold text-[#95d1d1]">{clients.length}</p>
          </div>
          <div className="flex-1 min-w-[140px] bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-4">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-1">Active This Month</p>
            <p className="text-2xl font-bold text-[#ffb780]">{activeThisMonth}</p>
          </div>
          <div className="flex-1 min-w-[140px] bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-4">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-[#ffb4a5]">
              ${(totalRevenueCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Client Table */}
        <section className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 overflow-hidden">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users size={40} className="text-[#534439]/30" />
              <p className="font-bold text-[#e7e1df]">No clients yet</p>
              <p className="text-sm text-[#a18d80]">
                Share a gallery link to start building your client network
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#534439]/40">
                    {['Client', 'Email', 'Galleries', 'Last Access', 'Paid', 'Actions'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-5 py-3.5 text-[10px] uppercase tracking-widest font-medium text-[#a18d80]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const color = avatarColor(client.email)
                    const ini = initials(client.email)
                    const name = nameFromEmail(client.email)
                    const projectNames = Array.from(client.projects)
                      .map((id) => projectNameMap[id] ?? id)
                      .slice(0, 2)
                      .join(', ')
                    const extra = client.projects.size > 2 ? ` +${client.projects.size - 2}` : ''

                    return (
                      <tr
                        key={client.email}
                        className="border-b border-[#534439]/20 hover:bg-[#211f1e] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-[#4e2600] flex-shrink-0`}
                            >
                              {ini}
                            </div>
                            <span className="text-sm font-medium text-[#e7e1df] truncate max-w-[140px]">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#d9c2b4]">
                          {client.email}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-[#d9c2b4]" title={Array.from(client.projects).map((id) => projectNameMap[id]).join(', ')}>
                            {projectNames}{extra}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#d9c2b4]">
                          {formatDate(client.lastAccessed)}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#ffb780]">
                          {client.totalPaidCents > 0
                            ? `$${(client.totalPaidCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <button className="p-2 rounded-lg hover:bg-[#2c2928] transition-colors text-[#a18d80] hover:text-[#d9c2b4]">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bottom Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                  Total Revenue
                </p>
                <p className="text-xl font-bold text-white mt-1">
                  ${(totalRevenueCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#ffb780]/10">
                <TrendingUp size={18} className="text-[#ffb780]" />
              </div>
            </div>
            <p className="text-xs text-[#a18d80]">From paid gallery downloads</p>
          </div>

          <div className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                  Network Size
                </p>
                <p className="text-xl font-bold text-white mt-1">
                  {clients.length} {clients.length === 1 ? 'client' : 'clients'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#95d1d1]/10">
                <Users size={18} className="text-[#95d1d1]" />
              </div>
            </div>
            <p className="text-xs text-[#a18d80]">Unique emails across all galleries</p>
          </div>
        </div>
      </div>
    </div>
  )
}
