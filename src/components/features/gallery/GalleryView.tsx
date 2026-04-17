'use client'

import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { VirtualGrid } from '@/components/ui/VirtualGrid'
import { GalleryLightbox } from './GalleryLightbox'
import { GalleryPaywall } from './GalleryPaywall'
import darkStyles from './themes/dark.module.css'
import lightStyles from './themes/light.module.css'
import minimalStyles from './themes/minimal.module.css'
import editorialStyles from './themes/editorial.module.css'
import type { Project, Media, GalleryTheme } from '@/types/supabase'

const GALLERY_MIN_ITEM_WIDTH = 240
const GALLERY_GAP = 12
// Sections above this photo count switch to virtualized rendering. Smaller
// categories render as a plain CSS grid so short galleries keep their themed
// styling unchanged.
const GALLERY_VIRTUALIZE_THRESHOLD = 40

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
  const styles = themeMap[theme] ?? darkStyles

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
        {grouped.map(([category, photos]) => {
          const renderCard = (item: Media) => {
            const globalIdx = media.indexOf(item)
            return (
              <div className={styles.photoCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.watermarked_url ?? item.thumbnail_url ?? item.storage_path}
                  alt={item.filename}
                  className={styles.photo}
                  loading="lazy"
                  onClick={() => setLightboxIndex(globalIdx)}
                />
                <div className={styles.photoOverlay}>
                  <button
                    onClick={() => handleDownloadPhoto(item)}
                    className={styles.downloadBtn}
                    aria-label={`Download ${item.filename}`}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            )
          }

          return (
            <section key={category} className={styles.section}>
              <h2 className={styles.sectionTitle}>{category}</h2>
              {photos.length > GALLERY_VIRTUALIZE_THRESHOLD ? (
                <VirtualGrid
                  items={photos}
                  getItemKey={(item) => item.id}
                  minItemWidth={GALLERY_MIN_ITEM_WIDTH}
                  gap={GALLERY_GAP}
                  // Gallery thumbnails use aspect-ratio 3/2
                  rowHeight={(columnWidth) => Math.round(columnWidth * (2 / 3))}
                  overscan={4}
                  className="max-h-[80vh]"
                  renderItem={renderCard}
                />
              ) : (
                <div className={styles.grid}>
                  {photos.map((item) => (
                    <div key={item.id}>{renderCard(item)}</div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
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
        />
      )}
    </div>
  )
}
