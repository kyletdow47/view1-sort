'use client'

import Link from 'next/link'
import { Camera, ChevronRight } from 'lucide-react'
import type { ClientGallery } from '@/types/client-portal'
import { GALLERY_STATUS_CONFIG } from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GalleryCardProps {
  gallery: ClientGallery
  /** 'row' for list layout, 'card' for grid layout */
  variant?: 'row' | 'card'
}

export function GalleryCard({ gallery, variant = 'row' }: GalleryCardProps) {
  const status = GALLERY_STATUS_CONFIG[gallery.status]

  if (variant === 'card') {
    return (
      <Link
        href={`/gallery/${gallery.id}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-all hover:border-white/20 hover:shadow-elev-2"
      >
        {/* Cover image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/[0.04]">
          {gallery.coverUrl ? (
            <img
              src={gallery.coverUrl}
              alt={gallery.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Camera className="h-8 w-8 text-white/20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-white/40">
              {gallery.photoCount} photos
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.colorClass}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-[14px] font-semibold text-white/90 truncate">
            {gallery.name}
          </p>
        </div>
      </Link>
    )
  }

  // Row variant (list)
  return (
    <Link
      href={`/gallery/${gallery.id}`}
      className="group flex items-center gap-4 rounded-2xl p-4 border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.06]"
    >
      {/* Cover thumbnail */}
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[0.06]">
        {gallery.coverUrl ? (
          <img
            src={gallery.coverUrl}
            alt={gallery.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Camera className="h-4 w-4 text-white/20" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white/90 truncate">
          {gallery.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-white/45">
          <Camera className="h-3 w-3" />
          <span>{gallery.photoCount} photos</span>
          {gallery.shootDate && (
            <>
              <span className="text-white/20">·</span>
              <span>{gallery.shootDate}</span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.colorClass}`}
        >
          {status.label}
        </span>
        <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
