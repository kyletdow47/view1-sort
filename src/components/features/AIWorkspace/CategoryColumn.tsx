'use client'

import { useMemo } from 'react'
import type { MediaItem } from '@/types/media'

interface CategoryColumnProps {
  name: string
  color: string
  photos: MediaItem[]
  selectedIds: Set<string>
  onSelect: (id: string, shiftKey: boolean) => void
  onDoubleClick: (id: string) => void
}

export function CategoryColumn({
  name,
  color,
  photos,
  selectedIds,
  onSelect,
  onDoubleClick,
}: CategoryColumnProps) {
  const photoCount = photos.length

  return (
    <div
      className="flex flex-col gap-2.5 p-3 rounded-[20px] h-full overflow-hidden
        bg-white/[0.08] border border-white/20 backdrop-blur-md"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`,
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-white/90 font-sans text-sm font-semibold">
            {name}
          </span>
        </div>
        <span className="text-white/40 font-mono text-xs">
          {photoCount}
        </span>
      </div>

      {/* Photo Grid */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {photos.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-white/20 text-sm">
            No photos
          </div>
        ) : (
          photos.map((photo) => {
            const isSelected = selectedIds.has(photo.id)
            return (
              <button
                key={photo.id}
                onClick={(e) => onSelect(photo.id, e.shiftKey)}
                onDoubleClick={() => onDoubleClick(photo.id)}
                className={`
                  relative rounded-lg overflow-hidden aspect-[4/3] w-full
                  transition-all duration-150 cursor-pointer group
                  ${isSelected
                    ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-transparent'
                    : 'hover:ring-1 hover:ring-white/30'
                  }
                `}
              >
                {photo.thumbnail_url ? (
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
                    <span className="text-white/20 text-xs truncate px-2">
                      {photo.filename}
                    </span>
                  </div>
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Confidence badge */}
                {photo.ai_confidence != null && (
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono
                    bg-black/60 text-white/70 backdrop-blur-sm">
                    {Math.round(photo.ai_confidence * 100)}%
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
