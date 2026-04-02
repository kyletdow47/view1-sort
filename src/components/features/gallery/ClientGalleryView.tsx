'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Download,
  CheckSquare,
  Square,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Heart,
  Send,
  Phone,
  Check,
} from 'lucide-react'
import type { Media, GalleryTheme, Gallery, GalleryComment } from '@/types/supabase'

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------

const THEMES: Record<
  GalleryTheme,
  {
    bg: string
    surface: string
    surfaceHover: string
    border: string
    text: string
    muted: string
    accent: string
    accentText: string
    overlay: string
    font: string
  }
> = {
  dark: {
    bg: '#0c0c0e',
    surface: '#16161a',
    surfaceHover: '#1e1e24',
    border: '#2a2a2e',
    text: '#f0f0f0',
    muted: '#8a8a8a',
    accent: '#22c55e',
    accentText: '#000',
    overlay: 'rgba(0,0,0,0.92)',
    font: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  light: {
    bg: '#ffffff',
    surface: '#f3f4f6',
    surfaceHover: '#e5e7eb',
    border: '#e5e7eb',
    text: '#111827',
    muted: '#6b7280',
    accent: '#2563eb',
    accentText: '#fff',
    overlay: 'rgba(255,255,255,0.94)',
    font: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  minimal: {
    bg: '#f9fafb',
    surface: '#ffffff',
    surfaceHover: '#f3f4f6',
    border: '#e5e7eb',
    text: '#1f2937',
    muted: '#9ca3af',
    accent: '#111827',
    accentText: '#fff',
    overlay: 'rgba(249,250,251,0.96)',
    font: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  editorial: {
    bg: '#1c1917',
    surface: '#292524',
    surfaceHover: '#3c3330',
    border: '#3c3330',
    text: '#fafaf9',
    muted: '#78716c',
    accent: '#e7c08a',
    accentText: '#1c1917',
    overlay: 'rgba(12,10,9,0.95)',
    font: 'Georgia, Times New Roman, serif',
  },
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ClientGalleryViewProps {
  gallery: Gallery
  media: Media[]
  initialComments: GalleryComment[]
  photographerName: string
  isPaidPlan: boolean
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ClientGalleryView({
  gallery,
  media,
  initialComments,
  photographerName,
  isPaidPlan,
}: ClientGalleryViewProps) {
  const t = THEMES[gallery.theme] ?? THEMES.dark

  // --- selection state ---
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // --- lightbox state ---
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxComment, setLightboxComment] = useState('')
  const [lightboxAuthor, setLightboxAuthor] = useState('')
  const [lightboxSubmitting, setLightboxSubmitting] = useState(false)

  // --- comments panel state ---
  const [commentsPanelMediaId, setCommentsPanelMediaId] = useState<string | null>(null)
  const [comments, setComments] = useState<GalleryComment[]>(initialComments)

  // --- selections submission ---
  const [savingSelections, setSavingSelections] = useState(false)
  const [selectionsSaved, setSelectionsSaved] = useState(false)

  const commentInputRef = useRef<HTMLInputElement>(null)

  // Distribute photos into 3 columns (round-robin for masonry effect)
  const cols = [0, 1, 2].map((ci) => media.filter((_, i) => i % 3 === ci))

  // --- keyboard nav in lightbox ---
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(
    () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : media.length - 1)),
    [media.length]
  )
  const nextPhoto = useCallback(
    () => setLightboxIndex((i) => (i !== null && i < media.length - 1 ? i + 1 : 0)),
    [media.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto])

  // Lock body scroll when lightbox or panel is open
  useEffect(() => {
    const shouldLock = lightboxIndex !== null || commentsPanelMediaId !== null
    document.body.style.overflow = shouldLock ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex, commentsPanelMediaId])

  // --- selection toggle ---
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // --- confirm selections ---
  const handleConfirmSelections = async () => {
    setSavingSelections(true)
    try {
      // TODO: implement POST /api/gallery/[galleryId]/selections
      await fetch(`/api/gallery/${gallery.id}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: Array.from(selectedIds) }),
      })
      setSelectionsSaved(true)
      setSelectionMode(false)
    } catch {
      // silently fail — TODO: add toast notification
    } finally {
      setSavingSelections(false)
    }
  }

  // --- submit comment ---
  const handleSubmitComment = async (mediaId: string) => {
    if (!lightboxComment.trim() || !lightboxAuthor.trim()) return
    setLightboxSubmitting(true)
    try {
      // TODO: implement POST /api/gallery/[galleryId]/comments
      const res = await fetch(`/api/gallery/${gallery.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          authorName: lightboxAuthor.trim(),
          body: lightboxComment.trim(),
        }),
      })
      if (res.ok) {
        const { comment } = await res.json() as { comment: GalleryComment }
        setComments((prev) => [...prev, comment])
        setLightboxComment('')
      }
    } catch {
      // silently fail — TODO: add toast notification
    } finally {
      setLightboxSubmitting(false)
    }
  }

  // --- download ---
  const handleDownloadAll = () => {
    window.location.href = `/api/gallery/${gallery.id}/download?type=zip`
  }
  const handleDownloadPhoto = (item: Media) => {
    window.location.href = `/api/gallery/${gallery.id}/download?mediaId=${item.id}`
  }

  const coverUrl =
    gallery.cover_photo_url ?? media[0]?.watermarked_url ?? media[0]?.thumbnail_url ?? null

  const currentLightboxItem = lightboxIndex !== null ? media[lightboxIndex] : null
  const panelComments = commentsPanelMediaId
    ? comments.filter((c) => c.media_id === commentsPanelMediaId)
    : []

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: t.bg,
        color: t.text,
        fontFamily: t.font,
        position: 'relative',
      }}
    >
      {/* ── Top bar ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: t.bg,
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          gap: '1rem',
        }}
      >
        {/* Photographer info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          {gallery.photographer_logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={gallery.photographer_logo_url}
              alt={photographerName}
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: t.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: t.accentText,
                flexShrink: 0,
              }}
            >
              {photographerName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: t.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {photographerName}
          </span>
        </div>

        {/* Gallery title — center */}
        <h1
          style={{
            fontSize: '1rem',
            fontWeight: gallery.theme === 'editorial' ? 400 : 700,
            fontStyle: gallery.theme === 'editorial' ? 'italic' : 'normal',
            color: t.text,
            margin: 0,
            textAlign: 'center',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {gallery.title}
        </h1>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {gallery.allow_downloads && (
            <button
              onClick={handleDownloadAll}
              aria-label="Download all photos"
              style={btnStyle(t)}
            >
              <Download size={15} />
              <span style={{ display: 'none' }} className="sm:inline">Download</span>
            </button>
          )}
          <button
            onClick={() => {
              setSelectionMode((m) => !m)
              if (selectionMode) setSelectedIds(new Set())
            }}
            aria-pressed={selectionMode}
            style={{
              ...btnStyle(t),
              backgroundColor: selectionMode ? t.accent : undefined,
              color: selectionMode ? t.accentText : t.text,
            }}
          >
            <CheckSquare size={15} />
            <span>{selectionMode ? 'Cancel' : 'Select Favorites'}</span>
          </button>
        </div>
      </header>

      {/* ── Hero section ── */}
      {coverUrl && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'min(60vh, 480px)',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={gallery.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Gradient overlay + title */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '2.5rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  fontWeight: gallery.theme === 'editorial' ? 400 : 800,
                  fontStyle: gallery.theme === 'editorial' ? 'italic' : 'normal',
                  color: '#fff',
                  margin: 0,
                  lineHeight: 1.1,
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}
              >
                {gallery.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
                {media.length} photos · {photographerName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo grid (masonry 3-col) ── */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem 8rem' }}>
        {!coverUrl && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: t.muted, fontSize: '0.875rem' }}>
              {media.length} photos
            </p>
          </div>
        )}

        {media.length === 0 ? (
          <p style={{ color: t.muted, textAlign: 'center', padding: '4rem 0' }}>
            No photos in this gallery yet.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            {cols.map((col, ci) => (
              <div
                key={ci}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {col.map((item) => {
                  const globalIdx = media.indexOf(item)
                  const isSelected = selectedIds.has(item.id)
                  const isFavorited = favorites.has(item.id)
                  const photoComments = comments.filter((c) => c.media_id === item.id)

                  return (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      globalIdx={globalIdx}
                      t={t}
                      theme={gallery.theme}
                      selectionMode={selectionMode}
                      isSelected={isSelected}
                      isFavorited={isFavorited}
                      commentCount={photoComments.length}
                      allowDownload={gallery.allow_downloads}
                      onSelect={() => toggleSelect(item.id)}
                      onFavorite={() => toggleFavorite(item.id)}
                      onOpenLightbox={() => setLightboxIndex(globalIdx)}
                      onOpenComments={() => setCommentsPanelMediaId(item.id)}
                      onDownload={() => handleDownloadPhoto(item)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Comments slide-in panel ── */}
      {commentsPanelMediaId !== null && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setCommentsPanelMediaId(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <aside
            role="complementary"
            aria-label="Photo comments"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              width: 'min(380px, 100vw)',
              backgroundColor: t.surface,
              borderLeft: `1px solid ${t.border}`,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: `1px solid ${t.border}`,
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: t.text }}>
                Comments ({panelComments.length})
              </span>
              <button
                onClick={() => setCommentsPanelMediaId(null)}
                aria-label="Close comments panel"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, display: 'flex', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Comments list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {panelComments.length === 0 ? (
                <p style={{ color: t.muted, fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
                  No comments yet on this photo.
                </p>
              ) : (
                panelComments.map((c) => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: t.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: t.accentText,
                          flexShrink: 0,
                        }}
                      >
                        {c.author_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: t.text }}>{c.author_name}</span>
                      <span style={{ fontSize: '0.75rem', color: t.muted, marginLeft: 'auto' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: t.text, margin: 0, paddingLeft: '2.25rem', lineHeight: 1.5 }}>
                      {c.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* ── Lightbox ── */}
      {currentLightboxItem !== null && lightboxIndex !== null && (
        <Lightbox
          item={currentLightboxItem}
          index={lightboxIndex}
          total={media.length}
          t={t}
          theme={gallery.theme}
          allowDownload={gallery.allow_downloads}
          commentValue={lightboxComment}
          authorValue={lightboxAuthor}
          submitting={lightboxSubmitting}
          onCommentChange={setLightboxComment}
          onAuthorChange={setLightboxAuthor}
          onSubmitComment={() => handleSubmitComment(currentLightboxItem.id)}
          onDownload={() => handleDownloadPhoto(currentLightboxItem)}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onClose={closeLightbox}
          onOpenComments={() => {
            setCommentsPanelMediaId(currentLightboxItem.id)
            closeLightbox()
          }}
          commentInputRef={commentInputRef}
          commentCount={comments.filter((c) => c.media_id === currentLightboxItem.id).length}
        />
      )}

      {/* ── Selection confirm bar (sticky, shown in selection mode) ── */}
      {selectionMode && selectedIds.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            backgroundColor: t.accent,
            color: t.accentText,
            borderRadius: '999px',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          <span>{selectedIds.size} selected</span>
          <button
            onClick={handleConfirmSelections}
            disabled={savingSelections}
            style={{
              background: 'rgba(0,0,0,0.18)',
              border: 'none',
              borderRadius: '999px',
              padding: '0.375rem 1rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: t.accentText,
              cursor: savingSelections ? 'not-allowed' : 'pointer',
              opacity: savingSelections ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {savingSelections ? 'Saving…' : (
              <>
                <Check size={14} />
                Confirm Selections
              </>
            )}
          </button>
        </div>
      )}

      {selectionsSaved && (
        <div
          style={{
            position: 'fixed',
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            backgroundColor: t.accent,
            color: t.accentText,
            borderRadius: '999px',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          <Check size={16} />
          Selections saved!
        </div>
      )}

      {/* ── Sticky bottom bar ── */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          backgroundColor: t.surface,
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          gap: '1rem',
        }}
      >
        {/* Photographer branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>
            {isPaidPlan ? photographerName : (
              <>
                {photographerName} ·{' '}
                <span style={{ color: t.muted, fontWeight: 400 }}>Powered by View1 Sort</span>
              </>
            )}
          </span>
        </div>

        {/* Contact photographer */}
        <a
          href={`mailto:?subject=Gallery: ${encodeURIComponent(gallery.title)}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: t.muted,
            textDecoration: 'none',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            border: `1px solid ${t.border}`,
          }}
        >
          <Phone size={13} />
          Contact
        </a>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PhotoCard sub-component
// ---------------------------------------------------------------------------

interface ThemeTokens {
  bg: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  muted: string
  accent: string
  accentText: string
  overlay: string
  font: string
}

interface PhotoCardProps {
  item: Media
  globalIdx: number
  t: ThemeTokens
  theme: GalleryTheme
  selectionMode: boolean
  isSelected: boolean
  isFavorited: boolean
  commentCount: number
  allowDownload: boolean
  onSelect: () => void
  onFavorite: () => void
  onOpenLightbox: () => void
  onOpenComments: () => void
  onDownload: () => void
}

function PhotoCard({
  item,
  t,
  theme,
  selectionMode,
  isSelected,
  isFavorited,
  commentCount,
  allowDownload,
  onSelect,
  onFavorite,
  onOpenLightbox,
  onOpenComments,
  onDownload,
}: PhotoCardProps) {
  const [hovered, setHovered] = useState(false)

  const imgSrc = item.watermarked_url ?? item.thumbnail_url ?? item.storage_path

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: theme === 'editorial' ? 0 : '0.375rem',
        overflow: 'hidden',
        cursor: 'pointer',
        outline: isSelected ? `2px solid ${t.accent}` : '2px solid transparent',
        outlineOffset: '2px',
        transition: 'outline 0.1s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (selectionMode) {
          onSelect()
        } else {
          onOpenLightbox()
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={item.display_name ?? item.filename}
        loading="lazy"
        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
      />

      {/* Hover overlay */}
      {(hovered || selectionMode) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: selectionMode
              ? isSelected
                ? 'rgba(0,0,0,0.3)'
                : 'rgba(0,0,0,0.12)'
              : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0.5rem',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Selection checkbox (bottom-left in selection mode, always visible) */}
          {selectionMode ? (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect() }}
              aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? t.accent : '#fff', display: 'flex', padding: 2 }}
            >
              {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
            </button>
          ) : (
            <div />
          )}

          {/* Action buttons (bottom-right) */}
          {!selectionMode && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onFavorite() }}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                  background: 'rgba(0,0,0,0.45)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: isFavorited ? '#f43f5e' : '#fff',
                  display: 'flex',
                  padding: '0.3rem',
                }}
              >
                <Heart size={15} fill={isFavorited ? '#f43f5e' : 'none'} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenComments() }}
                aria-label={`View ${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
                style={{
                  background: 'rgba(0,0,0,0.45)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: '0.3rem',
                  fontSize: '0.6875rem',
                }}
              >
                <MessageCircle size={15} />
                {commentCount > 0 && <span>{commentCount}</span>}
              </button>
              {allowDownload && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload() }}
                  aria-label="Download photo"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    padding: '0.3rem',
                  }}
                >
                  <Download size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected checkmark badge */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: t.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={12} color={t.accentText} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lightbox sub-component
// ---------------------------------------------------------------------------

interface LightboxProps {
  item: Media
  index: number
  total: number
  t: ThemeTokens
  theme: GalleryTheme
  allowDownload: boolean
  commentValue: string
  authorValue: string
  submitting: boolean
  commentCount: number
  onCommentChange: (v: string) => void
  onAuthorChange: (v: string) => void
  onSubmitComment: () => void
  onDownload: () => void
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onOpenComments: () => void
  commentInputRef: React.RefObject<HTMLInputElement | null>
}

function Lightbox({
  item,
  index,
  total,
  t,
  theme,
  allowDownload,
  commentValue,
  authorValue,
  submitting,
  commentCount,
  onCommentChange,
  onAuthorChange,
  onSubmitComment,
  onDownload,
  onPrev,
  onNext,
  onClose,
  onOpenComments,
  commentInputRef,
}: LightboxProps) {
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) onNext()
      else onPrev()
    }
    touchStartX.current = null
  }

  const btnBg = theme === 'minimal' || theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'
  const btnColor = theme === 'minimal' || theme === 'light' ? '#1f2937' : '#f0f0f0'
  const overlayBg = theme === 'minimal' ? 'rgba(249,250,251,0.97)' : theme === 'light' ? 'rgba(255,255,255,0.97)' : 'rgba(0,0,0,0.95)'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: overlayBg,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          flexShrink: 0,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: t.muted }}>
            {index + 1} / {total}
          </span>
          {item.ai_category && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: t.surface,
                color: t.muted,
                padding: '0.125rem 0.5rem',
                borderRadius: '999px',
                border: `1px solid ${t.border}`,
              }}
            >
              {item.ai_category}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={onOpenComments}
            aria-label={`View ${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
            style={{ ...iconBtn(btnBg, btnColor), gap: '0.3rem' }}
          >
            <MessageCircle size={15} />
            {commentCount > 0 && <span style={{ fontSize: '0.75rem' }}>{commentCount}</span>}
          </button>
          {allowDownload && (
            <button
              onClick={onDownload}
              aria-label="Download photo"
              style={iconBtn(btnBg, btnColor)}
            >
              <Download size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close lightbox"
            style={iconBtn(btnBg, btnColor)}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 4rem',
          minHeight: 0,
        }}
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.watermarked_url ?? item.thumbnail_url ?? item.storage_path}
          alt={item.display_name ?? item.filename}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: theme === 'editorial' ? 0 : '0.25rem',
            userSelect: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />

        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev() }}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                ...circleBtn(btnBg, btnColor),
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext() }}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                ...circleBtn(btnBg, btnColor),
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Comment input */}
      <div
        style={{
          flexShrink: 0,
          padding: '0.875rem 1.25rem',
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Your name"
          value={authorValue}
          onChange={(e) => onAuthorChange(e.target.value)}
          style={{
            width: 110,
            flexShrink: 0,
            padding: '0.5rem 0.625rem',
            backgroundColor: t.surface,
            color: t.text,
            border: `1px solid ${t.border}`,
            borderRadius: '0.375rem',
            fontSize: '0.8125rem',
            outline: 'none',
          }}
        />
        <input
          ref={commentInputRef as React.RefObject<HTMLInputElement>}
          type="text"
          placeholder="Leave a comment…"
          value={commentValue}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmitComment() } }}
          style={{
            flex: 1,
            padding: '0.5rem 0.625rem',
            backgroundColor: t.surface,
            color: t.text,
            border: `1px solid ${t.border}`,
            borderRadius: '0.375rem',
            fontSize: '0.8125rem',
            outline: 'none',
          }}
        />
        <button
          onClick={onSubmitComment}
          disabled={submitting || !commentValue.trim() || !authorValue.trim()}
          aria-label="Submit comment"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.accent,
            color: t.accentText,
            border: 'none',
            borderRadius: '0.375rem',
            width: 36,
            height: 36,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting || !commentValue.trim() || !authorValue.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

function btnStyle(t: ThemeTokens): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.4375rem 0.75rem',
    backgroundColor: t.surface,
    color: t.text,
    border: `1px solid ${t.border}`,
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  }
}

function iconBtn(bg: string, color: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: bg,
    color,
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.4375rem',
    cursor: 'pointer',
  }
}

function circleBtn(bg: string, color: string): React.CSSProperties {
  return {
    backgroundColor: bg,
    color,
    border: 'none',
    borderRadius: '50%',
    width: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
}
