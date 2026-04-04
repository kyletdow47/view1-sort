'use client'

import { useMemo } from 'react'
import { ExternalLink, Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import type { Media } from '@/types/supabase'
import type { GalleryThemeOption, WatermarkConfig } from '@/types/gallery-builder'

interface GalleryPreviewPanelProps {
  title: string
  selectedPhotos: Media[]
  theme: GalleryThemeOption
  watermark: WatermarkConfig
}

const THEME_STYLES: Record<GalleryThemeOption, { bg: string; text: string; card: string; heading: string }> = {
  dark: { bg: 'bg-[#0A0A0A]', text: 'text-white/80', card: 'bg-white/[0.06]', heading: 'text-white' },
  light: { bg: 'bg-white', text: 'text-gray-600', card: 'bg-gray-100', heading: 'text-gray-900' },
  minimal: { bg: 'bg-[#F5F5F0]', text: 'text-gray-500', card: 'bg-white', heading: 'text-gray-800' },
  editorial: { bg: 'bg-[#1A1916]', text: 'text-[#E8E4DD]/70', card: 'bg-white/[0.04]', heading: 'text-[#E8E4DD]' },
}

export function GalleryPreviewPanel({
  title,
  selectedPhotos,
  theme,
  watermark,
}: GalleryPreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const styles = THEME_STYLES[theme]

  const grouped = useMemo(() => {
    const map = new Map<string, Media[]>()
    for (const item of selectedPhotos) {
      const key = item.ai_category ?? 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [selectedPhotos])

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Live Preview</h3>
          <span className="text-[10px] text-white/40 px-1.5 py-0.5 bg-white/[0.06] rounded">
            {selectedPhotos.length} photos
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
              previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={`
          mx-auto rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl
          ${previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'}
        `}>
          {/* Simulated Gallery */}
          <div className={`${styles.bg} min-h-[400px]`}>
            {/* Gallery Header */}
            <div className="px-6 pt-8 pb-4">
              <h2 className={`text-lg font-bold ${styles.heading}`}>{title || 'Untitled Gallery'}</h2>
              <p className={`text-xs mt-1 ${styles.text}`}>
                {selectedPhotos.length} photos
              </p>
            </div>

            {/* Category Tabs */}
            {grouped.length > 1 && (
              <div className="flex gap-2 px-6 pb-3 overflow-x-auto">
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full
                  ${theme === 'dark' || theme === 'editorial'
                    ? 'bg-white/10 text-white/80'
                    : 'bg-black/5 text-black/60'}`}>
                  All
                </span>
                {grouped.map(([cat]) => (
                  <span key={cat} className={`text-[10px] px-2.5 py-1 rounded-full
                    ${theme === 'dark' || theme === 'editorial'
                      ? 'text-white/40'
                      : 'text-black/40'}`}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Photo Grid */}
            <div className={`px-6 pb-6 grid gap-1.5 ${
              previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {selectedPhotos.slice(0, 12).map((item) => (
                <div key={item.id} className="relative aspect-square rounded-md overflow-hidden">
                  {item.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail_url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full ${styles.card}`} />
                  )}

                  {/* Watermark overlay */}
                  {watermark.enabled && watermark.logoUrl && (
                    <div className={`absolute ${getWatermarkPositionClasses(watermark.position)} p-1`}
                      style={{ opacity: watermark.opacity / 100 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watermark.logoUrl}
                        alt="Watermark"
                        className="object-contain"
                        style={{ width: `${watermark.size}%`, maxWidth: '60px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedPhotos.length > 12 && (
              <p className={`text-center text-[10px] pb-4 ${styles.text}`}>
                +{selectedPhotos.length - 12} more photos
              </p>
            )}

            {selectedPhotos.length === 0 && (
              <div className={`flex items-center justify-center py-16 ${styles.text}`}>
                <p className="text-xs">Select photos to preview gallery</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getWatermarkPositionClasses(position: string): string {
  switch (position) {
    case 'top-left': return 'top-0 left-0'
    case 'top-center': return 'top-0 left-1/2 -translate-x-1/2'
    case 'top-right': return 'top-0 right-0'
    case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    case 'bottom-left': return 'bottom-0 left-0'
    case 'bottom-center': return 'bottom-0 left-1/2 -translate-x-1/2'
    case 'bottom-right': return 'bottom-0 right-0'
    default: return 'bottom-right'
  }
}
