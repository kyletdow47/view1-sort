import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientGalleryView } from '@/components/features/gallery/ClientGalleryView'
import { GalleryPasswordGate } from '@/components/features/gallery/GalleryPasswordGate'
import type { Gallery, Media, GalleryComment } from '@/types/supabase'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

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

  // Expired galleries are inaccessible
  if (gallery.status === 'expired') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
          color: '#8a8a8a',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <p style={{ fontSize: '1.125rem', color: '#f0f0f0', marginBottom: '0.5rem' }}>
            Gallery Expired
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            This gallery link has expired. Please contact your photographer.
          </p>
        </div>
      </div>
    )
  }

  // Draft galleries are not publicly accessible
  if (gallery.status !== 'published') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
          color: '#8a8a8a',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <p style={{ fontSize: '1.125rem', color: '#f0f0f0', marginBottom: '0.5rem' }}>
            Gallery Not Available
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            This gallery isn&apos;t published yet.
          </p>
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

  // ── Fetch initial comments ─────────────────────────────────────────────────
  const { data: commentsData } = await supabase
    .from('gallery_comments')
    .select('*')
    .eq('gallery_id', id)
    .order('created_at', { ascending: true })

  const initialComments = (commentsData ?? []) as GalleryComment[]

  // ── Fetch photographer info ────────────────────────────────────────────────
  let photographerName = gallery.photographer_name ?? 'Photographer'

  if (!gallery.photographer_name) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id, name')
      .eq('id', gallery.workspace_id)
      .single()

    if (workspace) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, tier')
        .eq('id', workspace.owner_id)
        .single()

      photographerName = profile?.display_name ?? workspace.name ?? photographerName
    }
  }

  // ── Determine plan tier for branding ──────────────────────────────────────
  // show_powered_by is stored on gallery; fall back to profile tier check
  const isPaidPlan = !gallery.show_powered_by

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ClientGalleryView
      gallery={gallery}
      media={media}
      initialComments={initialComments}
      photographerName={photographerName}
      isPaidPlan={isPaidPlan}
    />
  )
}
