import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeliverGalleryView } from '@/components/features/publish/DeliverGalleryView'
import type { Project } from '@/types/supabase'

export const dynamic = 'force-dynamic'

interface PublishPageProps {
  params: Promise<{ id: string }>
}

// Demo project for non-authenticated preview
const DEMO_PROJECT: Project = {
  id: 'demo-1',
  name: 'Johnson Wedding — Emma & Liam',
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
  created_at: '2026-04-01',
  updated_at: '2026-04-04',
  metadata: null,
}

export default async function PublishPage({ params }: PublishPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  if (isDemo) {
    return (
      <DeliverGalleryView project={{ ...DEMO_PROJECT, id }} photoCount={247} />
    )
  }

  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { count: photoCount } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  return (
    <DeliverGalleryView
      project={project as Project}
      photoCount={photoCount ?? 0}
    />
  )
}
