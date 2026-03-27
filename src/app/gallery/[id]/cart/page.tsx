import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CartView } from '@/components/features/gallery/CartView'
import type { Media, Project } from '@/types/supabase'

interface CartPageProps {
  params: Promise<{ id: string }>
}

export default async function CartPage({ params }: CartPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: projectData } = await supabase
    .from('projects')
    .select('id, name, pricing_model, per_photo_cents, flat_fee_cents, currency, gallery_public, status')
    .eq('id', id)
    .single()

  if (!projectData) notFound()
  const project = projectData as Project

  // Cart only makes sense for per_photo pricing
  if (project.pricing_model !== 'per_photo') {
    // Redirect to checkout for flat-fee or free galleries
    notFound()
  }

  const { data: mediaData } = await supabase
    .from('media')
    .select('id, filename, thumbnail_url, width, height, orientation, ai_category')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const media = (mediaData ?? []) as Media[]

  return <CartView project={project} media={media} projectId={id} />
}
