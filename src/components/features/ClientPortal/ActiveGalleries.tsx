'use client'

import Link from 'next/link'
import { ChevronRight, Camera } from 'lucide-react'
import type { ClientGallery } from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Component — horizontal scrolling strip of active galleries (frame 4lzWb)
// ---------------------------------------------------------------------------

interface ActiveGalleriesProps {
  galleries: ClientGallery[]
}

export function ActiveGalleries({ galleries }: ActiveGalleriesProps) {
  if (galleries.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-white/40">
          Your Active Galleries
        </h2>
        <Link
          href="#all"
          className="flex items-center gap-1 text-[12px] text-white/40 hover:text-white/70 transition-colors"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/gallery/${gallery.id}`}
            className="group shrink-0 w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-all hover:border-white/20"
          >
            {/* Cover */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.04]">
              {gallery.coverUrl ? (
                <img
                  src={gallery.coverUrl}
                  alt={gallery.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Camera className="h-6 w-6 text-white/20" />
                </div>
              )}
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-3 text-[13px] font-semibold text-white drop-shadow-sm truncate max-w-[calc(100%-24px)]">
                {gallery.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
