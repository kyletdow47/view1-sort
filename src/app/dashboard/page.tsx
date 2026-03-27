import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces, getProjects, getActiveProjectCount, getMediaCountForProject } from '@/lib/queries/projects'
import { DashboardShell } from '@/components/features/workspace/DashboardShell'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [workspaces, profile] = await Promise.all([
    getWorkspaces(supabase, user.id),
    supabase.from('profiles').select('tier').eq('id', user.id).single(),
  ])

  const workspace = workspaces[0]
  if (!workspace) redirect('/onboarding')

  const [projects, activeProjectCount] = await Promise.all([
    getProjects(supabase, workspace.id),
    getActiveProjectCount(supabase, workspace.id),
  ])

  const photoCounts: Record<string, number> = {}
  await Promise.all(
    projects.map(async (project) => {
      photoCounts[project.id] = await getMediaCountForProject(supabase, project.id)
    })
  )

  return (
    <DashboardShell
      projects={projects}
      photoCounts={photoCounts}
      workspaceId={workspace.id}
      activeProjectCount={activeProjectCount}
      tier={profile.data?.tier ?? 'free'}
    />
  )
}
