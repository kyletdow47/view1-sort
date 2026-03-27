import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/lib/queries/projects'
import { getMedia } from '@/lib/queries/media'
import { WorkspaceView } from '@/components/features/workspace/WorkspaceView'
import type { Media, Project } from '@/types/supabase'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

const DEMO_PROJECT: Project = {
  id: 'demo-1',
  name: 'Johnson Wedding',
  preset: 'wedding',
  status: 'published',
  workspace_id: 'demo-ws',
  cover_image_url: null,
  gallery_public: false,
  gallery_theme: 'dark',
  pricing_model: 'free',
  flat_fee_cents: null,
  per_photo_cents: null,
  currency: 'usd',
  created_at: '2023-09-14',
  updated_at: '2023-09-14',
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  if (isDemo) {
    return <WorkspaceView project={{ ...DEMO_PROJECT, id, name: id === 'demo-1' ? 'Johnson Wedding' : id === 'demo-2' ? '123 Oak Street Listing' : 'Project' } as Project} initialMedia={[] as Media[]} />
  }

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
