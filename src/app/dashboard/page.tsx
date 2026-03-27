import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/features/workspace/DashboardShell'
import type { Project, UserTier } from '@/types/supabase'

// Mock data for demo mode
const demoProject = (id: string, name: string, preset: string, status: 'active' | 'published' | 'archived'): Project => ({
  id, name, preset, status, workspace_id: 'demo-ws',
  cover_image_url: null, gallery_public: false, gallery_theme: 'dark',
  pricing_model: 'free', flat_fee_cents: null, per_photo_cents: null, currency: 'usd',
  created_at: '2023-09-14', updated_at: '2023-09-14',
})

const DEMO_PROJECTS: Project[] = [
  demoProject('demo-1', 'Johnson Wedding', 'wedding', 'published'),
  demoProject('demo-2', '123 Oak Street Listing', 'real_estate', 'active'),
  demoProject('demo-3', 'Portugal Travel Series', 'travel', 'active'),
  demoProject('demo-4', 'Corporate Headshots', 'general', 'archived'),
]

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  if (isDemo) {
    return (
      <DashboardShell
        projects={DEMO_PROJECTS}
        photoCounts={{ 'demo-1': 847, 'demo-2': 156, 'demo-3': 432, 'demo-4': 64 }}
        workspaceId="demo-ws"
        activeProjectCount={2}
        tier={'pro' as UserTier}
      />
    )
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!workspace) {
    redirect('/onboarding')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  const projectList = (projects ?? []) as Project[]

  let photoCounts: Record<string, number> = {}
  if (projectList.length > 0) {
    const projectIds = projectList.map((p) => p.id)
    const { data: counts } = await supabase
      .from('media')
      .select('project_id')
      .in('project_id', projectIds)

    if (counts) {
      for (const row of counts) {
        photoCounts[row.project_id] = (photoCounts[row.project_id] ?? 0) + 1
      }
    }
  }

  const activeProjectCount = projectList.filter(
    (p) => p.status === 'active' || p.status === 'published'
  ).length

  return (
    <DashboardShell
      projects={projectList}
      photoCounts={photoCounts}
      workspaceId={workspace.id}
      activeProjectCount={activeProjectCount}
      tier={(profile?.tier ?? 'free') as UserTier}
    />
  )
}
