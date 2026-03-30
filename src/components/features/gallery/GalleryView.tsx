'use client'

import { useState, useMemo } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { GalleryLightbox } from './GalleryLightbox'
import { GalleryPaywall } from './GalleryPaywall'
import darkStyles from './themes/dark.module.css'
import lightStyles from './themes/light.module.css'
import minimalStyles from './themes/minimal.module.css'
import editorialStyles from './themes/editorial.module.css'
import type { Project, Media, GalleryTheme } from '@/types/supabase'

const themeMap: Record<GalleryTheme, Record<string, string>> = {
  dark: darkStyles,
  light: lightStyles,
  minimal: minimalStyles,
  editorial: editorialStyles,
}

interface GalleryViewProps {
  project: Project
  media: Media[]
  theme: GalleryTheme
  accessToken?: string
  hasPaid?: boolean
  photographerName?: string
}

export function GalleryView({
  project,
  media,
  theme,
  accessToken,
  hasPaid,
  photographerName,
}: GalleryViewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // Track which photos are showing their original (pre-edit) version
  const [showingOriginal, setShowingOriginal] = useState<Set<string>>(new Set())
  const styles = themeMap[theme] ?? darkStyles

  function getDisplayUrl(item: Media): string {
    const isViewingOriginal = showingOriginal.has(item.id)
    if (!isViewingOriginal && item.edited_thumbnail_url) {
      return item.edited_thumbnail_url
    }
    return item.watermarked_url ?? item.thumbnail_url ?? item.storage_path
  }

  function toggleOriginal(id: string) {
    setShowingOriginal((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Media[]>()
    for (const item of media) {
      const key = item.ai_category ?? 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [media])

  const isProTier = project.pricing_model !== 'free'

  // Show paywall if gallery has paid pricing and client hasn't paid yet
  if (project.pricing_model !== 'free' && !hasPaid && !accessToken) {
    return (
      <GalleryPaywall
        project={project}
        sampleMedia={media.slice(0, 3)}
        photographerName={photographerName ?? project.name}
      />
    )
  }

  const handleDownloadAll = () => {
    const url = `/api/gallery/${project.id}/download?type=zip${accessToken ? `&token=${accessToken}` : ''}`
    window.location.href = url
  }

  const handleDownloadPhoto = (item: Media) => {
    const url = `/api/gallery/${project.id}/download?mediaId=${item.id}${accessToken ? `&token=${accessToken}` : ''}`
    window.location.href = url
  }

  return (
    <div className={styles.gallery}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.title}>{project.name}</h1>
            <p className={styles.subtitle}>{media.length} photos</p>
          </div>
          <button
            onClick={handleDownloadAll}
            className={styles.downloadAllBtn}
            aria-label="Download all photos"
          >
            <Download size={16} />
            <span>Download All</span>
          </button>
        </div>
      </header>

      {/* Photo grid grouped by category */}
      <main className={styles.main}>
        {grouped.map(([category, photos]) => (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>{category}</h2>
            <div className={styles.grid}>
              {photos.map((item, idx) => {
                const globalIdx = media.indexOf(item)
                const hasEdit = !!item.edited_thumbnail_url
                const isViewingOriginal = showingOriginal.has(item.id)
                return (
                  <div key={item.id} className={styles.photoCard} style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDisplayUrl(item)}
                      alt={item.filename}
                      className={styles.photo}
                      loading="lazy"
                      onClick={() => setLightboxIndex(globalIdx)}
                    />
                    {/* Edited badge */}
                    {hasEdit && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.375rem',
                          left: '0.375rem',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          background: isViewingOriginal ? 'rgba(0,0,0,0.55)' : '#ffb780',
                          color: isViewingOriginal ? '#f0f0f0' : '#4e2600',
                          borderRadius: '0.25rem',
                          padding: '2px 5px',
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      >
                        {isViewingOriginal ? 'Original' : 'Edited'}
                      </span>
                    )}
                    <div className={styles.photoOverlay}>
                      {hasEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleOriginal(item.id) }}
                          aria-label={isViewingOriginal ? `Show edited version of ${item.filename}` : `View original ${item.filename}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.6875rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.15)',
                            color: '#f0f0f0',
                          }}
                        >
                          <RotateCcw size={11} />
                          {isViewingOriginal ? 'View Edited' : 'View Original'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPhoto(item)}
                        className={styles.downloadBtn}
                        aria-label={`Download ${item.filename}`}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                    {/* suppress unused idx warning */}
                    {idx === -1 && null}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        {isProTier ? (
          <p className={styles.footerText}>{project.name}</p>
        ) : (
          <p className={styles.footerText}>
            Powered by <strong>PhotoSorter</strong>
          </p>
        )}
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          media={media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDownload={handleDownloadPhoto}
          theme={theme}
          showingOriginal={showingOriginal}
          onToggleOriginal={toggleOriginal}
        />
      )}
    </div>
  )
}
