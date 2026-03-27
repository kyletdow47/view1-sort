import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GalleryView } from '@/components/features/gallery/GalleryView'
import { AccessGate } from '@/components/features/gallery/AccessGate'
import { GalleryPaywall } from '@/components/features/gallery/GalleryPaywall'
import type { GalleryTheme, Media, Project } from '@/types/supabase'

interface GalleryPageProps {
  params: Promise<{ id: string }>
  searchParams: { token?: string }
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const { id } = await params
  const token = typeof searchParams.token === 'string' ? searchParams.token : undefined

  const supabase = await createClient()

  // Fetch project
  const { data: projectData } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!projectData) notFound()
  const project = projectData as Project
  const theme: GalleryTheme = project.gallery_theme ?? 'dark'

  // Fetch photographer name via workspace → profile
  let photographerName = 'Photographer'
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id, name')
    .eq('id', project.workspace_id)
    .single()

  if (workspace) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', workspace.owner_id)
      .single()
    photographerName = profile?.display_name ?? workspace.name ?? photographerName
  }

  // If token provided, validate it
  if (token) {
    const now = new Date().toISOString()
    const { data: access } = await supabase
      .from('gallery_access')
      .select('access_type, expires_at')
      .eq('project_id', id)
      .eq('token', token)
      .single()

    const isExpired = access?.expires_at != null && access.expires_at < now
    if (!access || isExpired) {
      return <AccessGate projectId={id} theme={theme} invalidToken />
    }

    // Valid token — fetch media and render gallery
    const { data: mediaData } = await supabase
      .from('media')
      .select('*')
      .eq('project_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    const media = (mediaData ?? []) as Media[]
    const hasPaid = access.access_type === 'full'

    return (
      <GalleryView
        project={project}
        media={media}
        theme={theme}
        accessToken={token}
        hasPaid={hasPaid}
        photographerName={photographerName}
      />
    )
  }

  // No token — check if gallery is publicly accessible
  if (!project.gallery_public || project.status !== 'published') {
    return <AccessGate projectId={id} theme={theme} />
  }

  // Public gallery — fetch media
  const { data: mediaData } = await supabase
    .from('media')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const media = (mediaData ?? []) as Media[]

  // If gallery requires payment, show paywall with sample media
  if (project.pricing_model !== 'free') {
    return (
      <GalleryPaywall
        project={project}
        sampleMedia={media.slice(0, 6)}
        photographerName={photographerName}
      />
    )
  }

  return (
    <GalleryView
      project={project}
      media={media}
      theme={theme}
      hasPaid
      photographerName={photographerName}
    />
  )
}
