import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/lib/queries/projects'
import { getMedia } from '@/lib/queries/media'
import { WorkspaceView } from '@/components/features/workspace/WorkspaceView'
import type { Media, Project } from '@/types/supabase'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const project = await getProject(supabase, id)
  if (!project) notFound()

  const media = await getMedia(supabase, id)

  return <WorkspaceView project={project as Project} initialMedia={media as Media[]} />
}
