import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { GalleryViewer } from '@/components/features/client-portal/GalleryViewer'
import { GalleryPasswordGate } from '@/components/features/gallery/GalleryPasswordGate'
import type { Gallery, Media, GalleryComment } from '@/types/supabase'
import type { GalleryAccessLevel } from '@/types/gallery-viewer'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('galleries')
    .select('title, photographer_name, cover_photo_url, theme')
    .eq('id', id)
    .single()

  if (!data) {
    return { title: 'Gallery' }
  }

  const title = data.photographer_name
    ? `${data.title} — ${data.photographer_name}`
    : data.title

  const description = data.photographer_name
    ? `View your gallery from ${data.photographer_name}`
    : 'View your photography gallery'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(data.cover_photo_url && {
        images: [{ url: data.cover_photo_url, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(data.cover_photo_url && { images: [data.cover_photo_url] }),
    },
    robots: { index: false, follow: false }, // galleries are private by default
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ClientGalleryPage({ params, searchParams }: Props) {
  const { id } = await params
  const { token } = await searchParams

  const supabase = await createClient()

  // ── Fetch gallery ──────────────────────────────────────────────────────────
  const { data: galleryData } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', id)
    .single()

  if (!galleryData) notFound()

  const gallery = galleryData as Gallery

  // ── Access gate: expired ───────────────────────────────────────────────────
  if (gallery.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] p-6">
        <div className="text-center max-w-sm">
          <p className="text-base text-white/90 font-semibold mb-2">Gallery Expired</p>
          <p className="text-sm text-white/50">
            This gallery link has expired. Please contact your photographer.
          </p>
        </div>
      </div>
    )
  }

  // ── Access gate: draft ─────────────────────────────────────────────────────
  if (gallery.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] p-6">
        <div className="text-center max-w-sm">
          <p className="text-base text-white/90 font-semibold mb-2">Gallery Not Available</p>
          <p className="text-sm text-white/50">This gallery isn&apos;t published yet.</p>
        </div>
      </div>
    )
  }

  // ── Password gate ──────────────────────────────────────────────────────────
  if (gallery.password_protected) {
    let tokenValid = false

    if (token) {
      const now = new Date().toISOString()
      const { data: access } = await supabase
        .from('gallery_access')
        .select('access_type, expires_at')
        .eq('project_id', gallery.project_id)
        .eq('token', token)
        .single()

      tokenValid = !!access && (access.expires_at == null || access.expires_at > now)
    }

    if (!tokenValid) {
      return (
        <GalleryPasswordGate
          galleryId={id}
          galleryTitle={gallery.title}
          theme={gallery.theme}
          photographerName={gallery.photographer_name ?? 'Photographer'}
          photographerLogo={gallery.photographer_logo_url ?? null}
          invalidToken={!!token && !tokenValid}
        />
      )
    }
  }

  // ── Fetch media ────────────────────────────────────────────────────────────
  const { data: mediaData } = await supabase
    .from('media')
    .select('*')
    .eq('project_id', gallery.project_id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const media = (mediaData ?? []) as Media[]

  // ── Photographer info ──────────────────────────────────────────────────────
  let photographerName = gallery.photographer_name ?? 'Photographer'
  let photographerLogoUrl = gallery.photographer_logo_url ?? null

  if (!gallery.photographer_name) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id, name')
      .eq('id', gallery.workspace_id)
      .single()

    if (workspace) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, tier, avatar_url')
        .eq('id', workspace.owner_id)
        .single()

      photographerName = profile?.display_name ?? workspace.name ?? photographerName
      photographerLogoUrl = profile?.avatar_url ?? null
    }
  }

  // ── Determine access level ─────────────────────────────────────────────────
  // Default: delivered (allow_downloads controls whether downloads are shown)
  // If token present: look up access_type from gallery_access
  // TODO(auth): enforce per-client access levels via project_clients table
  let accessLevel: GalleryAccessLevel = 'delivered'

  if (token) {
    const { data: accessRow } = await supabase
      .from('gallery_access')
      .select('access_type')
      .eq('project_id', gallery.project_id)
      .eq('token', token)
      .single()

    if (accessRow?.access_type === 'preview') {
      accessLevel = 'preview'
    }
  }

  const isPaidPlan = !gallery.show_powered_by

  // ── Fetch comments (for lightbox comment panel) ────────────────────────────
  const { data: commentsData } = await supabase
    .from('gallery_comments')
    .select('*')
    .eq('gallery_id', id)
    .order('created_at', { ascending: true })

  // TODO(comments): pass initialComments to GalleryViewer when comment panel
  // is wired into GalleryLightbox via GalleryViewer
  const _initialComments = (commentsData ?? []) as GalleryComment[]
  void _initialComments

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GalleryViewer
      gallery={gallery}
      media={media}
      photographerName={photographerName}
      photographerLogoUrl={photographerLogoUrl}
      isPaidPlan={isPaidPlan}
      accessLevel={accessLevel}
    />
  )
}
