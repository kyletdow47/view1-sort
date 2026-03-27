import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/features/workspace/DashboardShell'
import type { Project, UserTier } from '@/types/supabase'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch profile for tier info
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  // Fetch user's primary workspace (owner)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!workspace) {
    // No workspace yet — send to onboarding
    redirect('/onboarding')
  }

  // Fetch projects for workspace
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  const projectList = (projects ?? []) as Project[]

  // Fetch photo counts per project
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
