'use client'

import { Heart } from 'lucide-react'
import type { FavoritePhoto } from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Component — horizontal strip of favorited photos (both frames)
// ---------------------------------------------------------------------------

interface FavoritesStripProps {
  favorites: FavoritePhoto[]
  totalCount?: number
}

export function FavoritesStrip({ favorites, totalCount }: FavoritesStripProps) {
  if (favorites.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-rose-400" />
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-white/40">
            Your Favorites
          </h2>
        </div>
        {totalCount !== undefined && (
          <span className="text-[12px] text-white/30">
            {totalCount} photos
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {favorites.map((photo) => (
          <div
            key={photo.id}
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-white/10 transition-all hover:border-white/30"
          >
            {photo.thumbnailUrl ? (
              <img
                src={photo.thumbnailUrl}
                alt={photo.alt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full bg-white/5"
                role="img"
                aria-label={photo.alt}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
