'use client'

// =============================================================================
// GalleryViewer — Client-facing gallery viewer with category navigation
//
// Two-phase UI:
//   1. Hero splash screen (full-viewport masonry backdrop + center info card)
//      → Matches Pencil frame iTVxS (Gallery — All Photos)
//   2. Photo grid with sticky category nav pills + masonry grid
//
// Features:
//   - Category navigation pills with photo counts
//   - Responsive masonry grid (2 / 3 / 4 columns)
//   - IntersectionObserver lazy loading with blur placeholder
//   - Heart / favorite toggling (TODO: client_reactions API)
//   - Access level banner (preview = watermarked, proofing, delivered)
//   - Lightbox via existing GalleryLightbox component
//   - Gallery theme tokens (dark / light / minimal / editorial)
// =============================================================================

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
} from 'react'
import Image from 'next/image'
import {
  Heart,
  Download,
  ArrowLeft,
  Camera,
  Images,
  ChevronRight,
} from 'lucide-react'
import type { Gallery, Media } from '@/types/supabase'
import type { GalleryAccessLevel, GalleryViewerTheme } from '@/types/gallery-viewer'
import { GALLERY_VIEWER_THEMES, ACCESS_LEVEL_CONFIG } from '@/types/gallery-viewer'
import { GalleryLightbox } from '@/components/features/gallery/GalleryLightbox'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface GalleryViewerProps {
  gallery: Gallery
  media: Media[]
  photographerName: string
  photographerLogoUrl: string | null
  isPaidPlan: boolean
  /** Access level determines watermarking + download availability */
  accessLevel?: GalleryAccessLevel
}

// ---------------------------------------------------------------------------
// Photographer avatar (logo or initials fallback)
// ---------------------------------------------------------------------------

function PhotographerAvatar({
  logoUrl,
  name,
  size = 48,
}: {
  logoUrl: string | null
  name: string
  size?: number
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

  if (logoUrl) {
    return (
      <div
        className="rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold border-2 border-white/20 flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: 'linear-gradient(135deg, #5749F4 0%, #9333ea 100%)',
      }}
    >
      {initials}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Category pill button
// ---------------------------------------------------------------------------

function CategoryPill({
  label,
  count,
  isActive,
  t,
  onClick,
}: {
  label: string
  count: number
  isActive: boolean
  t: GalleryViewerTheme
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: isActive ? t.pillActive : t.pill,
        color: isActive ? t.pillActiveText : t.text,
        border: `1px solid ${isActive ? t.pillActive : t.border}`,
      }}
    >
      {label}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full"
        style={{
          backgroundColor: isActive ? 'rgba(255,255,255,0.20)' : t.badge,
          color: isActive ? t.pillActiveText : t.muted,
        }}
      >
        {count}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Lazy photo card with IntersectionObserver
// ---------------------------------------------------------------------------

interface LazyPhotoProps {
  item: Media
  index: number
  isFavorited: boolean
  accessLevel: GalleryAccessLevel
  placeholderColor: string
  onOpen: (index: number) => void
  onToggleFavorite: (id: string) => void
}

const LazyPhoto = memo(function LazyPhoto({
  item,
  index,
  isFavorited,
  accessLevel,
  placeholderColor,
  onOpen,
  onToggleFavorite,
}: LazyPhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Use watermarked URL for preview access if available
  const imgSrc =
    accessLevel === 'preview' && item.watermarked_url
      ? item.watermarked_url
      : item.thumbnail_url

  // Aspect ratio based on orientation
  const aspectRatio =
    item.orientation === 'portrait'
      ? '3/4'
      : item.orientation === 'landscape'
        ? '4/3'
        : '1/1'

  return (
    <div
      ref={containerRef}
      className="relative group cursor-pointer break-inside-avoid mb-2 sm:mb-3 overflow-hidden rounded-lg"
      style={{ aspectRatio }}
      onClick={() => onOpen(index)}
      role="button"
      tabIndex={0}
      aria-label={`View photo${item.display_name ? `: ${item.display_name}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(index)
        }
      }}
    >
      {/* Blur placeholder */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundColor: placeholderColor,
          opacity: loaded ? 0 : 1,
        }}
        aria-hidden="true"
      />

      {/* Progressive image load */}
      {visible && imgSrc ? (
        <Image
          src={imgSrc}
          alt={item.display_name ?? 'Gallery photo'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          unoptimized
        />
      ) : null}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" aria-hidden="true" />

      {/* Heart button */}
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(item.id)
        }}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className="w-4 h-4 transition-colors"
          style={{ color: isFavorited ? '#ef4444' : '#ffffff' }}
          fill={isFavorited ? '#ef4444' : 'none'}
        />
      </button>

      {/* AI category label on hover */}
      {item.ai_category && (
        <div
          className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-hidden="true"
        >
          <span className="text-[10px] text-white/80 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            {item.ai_category}
          </span>
        </div>
      )}
    </div>
  )
})

// ---------------------------------------------------------------------------
// Hero splash screen (Pencil frame iTVxS)
// ---------------------------------------------------------------------------

function GalleryHeroScreen({
  gallery,
  media,
  photographerName,
  photographerLogoUrl,
  accessLevel,
  isPaidPlan,
  t,
  onEnter,
}: {
  gallery: Gallery
  media: Media[]
  photographerName: string
  photographerLogoUrl: string | null
  accessLevel: GalleryAccessLevel
  isPaidPlan: boolean
  t: GalleryViewerTheme
  onEnter: () => void
}) {
  // Background grid: up to 12 photos sampled evenly from the gallery
  const heroBgPhotos = useMemo(() => {
    if (media.length === 0) return []
    const step = Math.max(1, Math.floor(media.length / 12))
    return media.filter((_, i) => i % step === 0).slice(0, 12)
  }, [media])

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(gallery.created_at))
    } catch {
      return null
    }
  }, [gallery.created_at])

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: t.bg }}
    >
      {/* Background masonry grid (dimmed, matching Pencil iTVxS) */}
      {heroBgPhotos.length > 0 && (
        <div
          className="absolute inset-0 columns-3 sm:columns-4 gap-1 p-1 pointer-events-none select-none"
          style={{ filter: 'brightness(0.30) saturate(0.60)' }}
          aria-hidden="true"
        >
          {heroBgPhotos.map((photo) => {
            if (!photo.thumbnail_url) return null
            return (
              <div key={photo.id} className="break-inside-avoid mb-1 overflow-hidden rounded">
                <Image
                  src={photo.thumbnail_url}
                  alt=""
                  width={400}
                  height={300}
                  className="w-full object-cover"
                  unoptimized
                  priority={false}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${t.heroBg} 25%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Hero info card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-8 py-10 rounded-2xl mx-4 max-w-sm w-full"
        style={{
          backgroundColor: 'rgba(0,0,0,0.42)',
          backdropFilter: 'blur(28px)',
          border: `1px solid ${t.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
        <PhotographerAvatar logoUrl={photographerLogoUrl} name={photographerName} size={56} />

        <p className="mt-3 text-sm font-medium" style={{ color: t.muted }}>
          {photographerName}
        </p>

        <h1
          className="mt-1.5 text-3xl font-bold leading-tight tracking-tight"
          style={{
            color: t.text,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {gallery.title}
        </h1>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3 text-sm" style={{ color: t.muted }}>
          <span className="flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5" aria-hidden="true" />
            {media.length} {media.length === 1 ? 'Photo' : 'Photos'}
          </span>
          {formattedDate && (
            <>
              <span aria-hidden="true">·</span>
              <time>{formattedDate}</time>
            </>
          )}
        </div>

        {/* Access level badge */}
        {accessLevel !== 'delivered' && (
          <div
            className="mt-3 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${ACCESS_LEVEL_CONFIG[accessLevel].color}22`,
              color: ACCESS_LEVEL_CONFIG[accessLevel].color,
              border: `1px solid ${ACCESS_LEVEL_CONFIG[accessLevel].color}40`,
            }}
          >
            {ACCESS_LEVEL_CONFIG[accessLevel].label}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onEnter}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2"
          style={{
            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accent}cc 100%)`,
            color: t.accentText,
            boxShadow: `0 4px 20px ${t.accent}44`,
          }}
        >
          View Photos
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {!isPaidPlan && (
          <p className="mt-4 text-[11px]" style={{ color: t.muted }}>
            Delivered via{' '}
            <span style={{ color: t.accent }} className="font-semibold">
              View1 Sort
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main GalleryViewer component
// ---------------------------------------------------------------------------

export function GalleryViewer({
  gallery,
  media,
  photographerName,
  photographerLogoUrl,
  isPaidPlan,
  accessLevel = 'delivered',
}: GalleryViewerProps) {
  const t = GALLERY_VIEWER_THEMES[gallery.theme] ?? GALLERY_VIEWER_THEMES.dark

  // Phase: hero → grid
  const [inGrid, setInGrid] = useState(false)

  // Active category filter (null = All Photos)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Favorited photo IDs
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Category list derived from media ai_category
  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of media) {
      const cat = item.ai_category ?? 'Uncategorized'
      map.set(cat, (map.get(cat) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [media])

  // Filtered media for active category
  const filteredMedia = useMemo(() => {
    if (!activeCategory) return media
    return media.filter((m) => (m.ai_category ?? 'Uncategorized') === activeCategory)
  }, [media, activeCategory])

  const handleOpen = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    // TODO(db): POST /api/gallery/${gallery.id}/reactions { mediaId: id, type: 'heart' }
  }, [])

  // GalleryLightbox onFavorite expects (item: Media) => void
  const handleLightboxFavorite = useCallback(
    (item: Media) => handleToggleFavorite(item.id),
    [handleToggleFavorite]
  )

  const handleDownload = useCallback((item: Media) => {
    const url = item.thumbnail_url
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = item.display_name ?? `photo-${item.id}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // TODO(cloudflare): Use full-res Cloudflare Images URL instead of thumbnail
  }, [])

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxIndex])

  const canDownload = accessLevel === 'delivered' && gallery.allow_downloads

  // ── Phase 1: Hero splash ──────────────────────────────────────────────────
  if (!inGrid) {
    return (
      <GalleryHeroScreen
        gallery={gallery}
        media={media}
        photographerName={photographerName}
        photographerLogoUrl={photographerLogoUrl}
        accessLevel={accessLevel}
        isPaidPlan={isPaidPlan}
        t={t}
        onEnter={() => setInGrid(true)}
      />
    )
  }

  // ── Phase 2: Photo grid ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }}>
      {/* Access level banner */}
      {accessLevel !== 'delivered' && (
        <div
          role="status"
          className="w-full px-4 py-2.5 text-center text-xs font-medium"
          style={{
            backgroundColor: `${ACCESS_LEVEL_CONFIG[accessLevel].color}18`,
            borderBottom: `1px solid ${ACCESS_LEVEL_CONFIG[accessLevel].color}33`,
            color: ACCESS_LEVEL_CONFIG[accessLevel].color,
          }}
        >
          {ACCESS_LEVEL_CONFIG[accessLevel].description}
        </div>
      )}

      {/* Sticky header */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
        style={{
          backgroundColor: t.navBg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setInGrid(false)}
            className="flex-shrink-0 p-1.5 rounded-lg transition-opacity hover:opacity-60"
            style={{ color: t.muted }}
            aria-label="Back to gallery overview"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <PhotographerAvatar logoUrl={photographerLogoUrl} name={photographerName} size={28} />
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate leading-tight"
                style={{ color: t.text, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                {gallery.title}
              </p>
              <p className="text-[11px] leading-tight" style={{ color: t.muted }}>
                {photographerName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs hidden sm:block" style={{ color: t.muted }}>
            {filteredMedia.length} {filteredMedia.length === 1 ? 'photo' : 'photos'}
          </span>
          {canDownload && (
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: t.pill,
                color: t.text,
                border: `1px solid ${t.border}`,
              }}
              aria-label="Download all photos"
              onClick={() => {
                // TODO(cloudflare): POST /api/gallery/${gallery.id}/download to trigger zip
              }}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Download All</span>
            </button>
          )}
        </div>
      </header>

      {/* Category navigation pills */}
      {categories.length > 1 && (
        <nav
          aria-label="Filter by category"
          className="sticky z-20 px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto"
          style={{
            top: '57px',
            backgroundColor: t.navBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${t.border}`,
            scrollbarWidth: 'none',
          }}
        >
          <CategoryPill
            label="All Photos"
            count={media.length}
            isActive={activeCategory === null}
            t={t}
            onClick={() => setActiveCategory(null)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.name}
              label={cat.name}
              count={cat.count}
              isActive={activeCategory === cat.name}
              t={t}
              onClick={() => setActiveCategory(cat.name)}
            />
          ))}
        </nav>
      )}

      {/* Photo masonry grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Camera className="w-12 h-12 opacity-20" style={{ color: t.muted }} aria-hidden="true" />
            <p className="text-sm" style={{ color: t.muted }}>
              No photos in this category
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3">
            {filteredMedia.map((item, index) => (
              <LazyPhoto
                key={item.id}
                item={item}
                index={index}
                isFavorited={favorites.has(item.id)}
                accessLevel={accessLevel}
                placeholderColor={t.imgPlaceholder}
                onOpen={handleOpen}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Powered by footer (free tier) */}
        {!isPaidPlan && (
          <div
            className="mt-12 pb-6 flex items-center justify-center gap-2 text-xs"
            style={{ color: t.muted }}
          >
            <span>Delivered via</span>
            <span style={{ color: t.accent }} className="font-semibold">
              View1 Sort
            </span>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          media={filteredMedia}
          initialIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onFavorite={handleLightboxFavorite}
          favoriteIds={favorites}
          theme={gallery.theme}
          canDownload={canDownload}
          onDownload={canDownload ? handleDownload : undefined}
        />
      )}
    </div>
  )
}
