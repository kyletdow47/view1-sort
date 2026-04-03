import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { getProject } from '@/lib/queries/projects'
import { getMedia } from '@/lib/queries/media'
import { AIWorkspaceView } from '@/components/features/AIWorkspace'
import type { Media, Project } from '@/types/supabase'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

const DEMO_PROJECT: Project = {
  id: 'demo-1',
  name: 'Autumn Wedding — Sarah & James',
  preset: 'wedding',
  status: 'active',
  workspace_id: 'demo-ws',
  cover_image_url: null,
  gallery_public: false,
  gallery_theme: 'dark',
  pricing_model: 'free',
  flat_fee_cents: null,
  per_photo_cents: null,
  currency: 'usd',
  created_at: '2024-10-14',
  updated_at: '2024-10-14',
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  if (isDemo) {
    return (
      <AIWorkspaceView
        project={{
          ...DEMO_PROJECT,
          id,
          name:
            id === 'demo-1'
              ? 'Autumn Wedding — Sarah & James'
              : id === 'demo-2'
                ? '123 Oak Street Listing'
                : 'Project',
        } as Project}
        initialMedia={[] as Media[]}
      />
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const project = await getProject(supabase, id)
  if (!project) notFound()

  const media = await getMedia(supabase, id)

  return <AIWorkspaceView project={project as Project} initialMedia={media as Media[]} />
}
