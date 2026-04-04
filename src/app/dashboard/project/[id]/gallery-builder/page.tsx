import { GalleryBuilderView } from '@/components/features/gallery-builder'
import type { Project, Media } from '@/types/supabase'

// TODO: Replace mock data with Supabase queries once DB migration is run
// import { createServerClient } from '@/lib/supabase-server'

interface PageProps {
  params: Promise<{ id: string }>
}

// Mock data for development — replace with Supabase fetch
function getMockProject(id: string): Project {
  return {
    id,
    workspace_id: 'ws-1',
    name: 'Sarah & Tom — Wedding',
    preset: 'wedding',
    status: 'active',
    cover_image_url: null,
    gallery_public: false,
    gallery_theme: 'dark',
    pricing_model: 'flat_fee',
    flat_fee_cents: 25000,
    per_photo_cents: null,
    currency: 'usd',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-04-01T14:30:00Z',
  }
}

function getMockMedia(projectId: string): Media[] {
  const categories = ['Hero', 'Ceremony', 'Reception', 'Portraits', 'Details']
  return Array.from({ length: 48 }, (_, i) => ({
    id: `media-${i + 1}`,
    project_id: projectId,
    storage_path: `/storage/projects/${projectId}/photo-${i + 1}.jpg`,
    filename: `photo-${i + 1}.jpg`,
    display_name: null,
    mime_type: 'image/jpeg',
    size_bytes: 4_200_000 + Math.floor(Math.random() * 2_000_000),
    width: 4000 + Math.floor(Math.random() * 2000),
    height: 2800 + Math.floor(Math.random() * 1200),
    orientation: (i % 3 === 0 ? 'portrait' : 'landscape') as 'portrait' | 'landscape',
    cloudflare_image_id: null,
    thumbnail_url: null,
    watermarked_url: null,
    ai_category: categories[i % categories.length],
    ai_confidence: 0.75 + Math.random() * 0.25,
    ai_labels: null,
    sort_order: i,
    created_at: '2026-04-01T14:30:00Z',
  }))
}

export default async function GalleryBuilderPage({ params }: PageProps) {
  const { id } = await params

  // TODO: Fetch from Supabase
  // const supabase = createServerClient()
  // const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  // const { data: media } = await supabase.from('media').select('*').eq('project_id', id).order('sort_order')
  const project = getMockProject(id)
  const media = getMockMedia(id)

  return <GalleryBuilderView project={project} media={media} />
}
