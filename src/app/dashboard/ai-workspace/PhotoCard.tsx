'use client'

import { memo, useRef, useState } from 'react'
import { ImageOff, Star, X } from 'lucide-react'
import { clsx } from 'clsx'

export type ColorLabel = 'none' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'

export interface WorkspacePhoto {
  id: string
  filename: string
  thumbnail_url: string | null
  ai_category: string | null
  ai_confidence: number | null
  starRating: number
  colorLabel: ColorLabel
  cullStatus: 'keep' | 'cull' | null
  isBlurry: boolean
  isDuplicate: boolean
  faceCount: number
  sceneTab: string
  aiScore: number
  selected: boolean
}

export const COLOR_LABEL_CLASSES: Record<ColorLabel, string> = {
  none: 'bg-white/20',
  red: 'bg-red-500',
  yellow: 'bg-amber-400',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  purple: 'bg-violet-500',
}

const COLOR_LABELS: ColorLabel[] = ['none', 'red', 'yellow', 'green', 'blue', 'purple']

export interface PhotoCardProps {
  photo: WorkspacePhoto
  selected: boolean
  onSelect: (id: string, shiftKey: boolean) => void
  onStarRating: (id: string, rating: number) => void
  onColorLabel: (id: string, label: ColorLabel) => void
  onToggleCull: (id: string) => void
  onToggleKeep: (id: string) => void
}

export const PhotoCard = memo(function PhotoCard({
  photo,
  selected,
  onSelect,
  onStarRating,
  onColorLabel,
  onToggleCull,
  onToggleKeep,
}: PhotoCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const lastClickRef = useRef<number>(0)
  const isCulled = photo.cullStatus === 'cull'

  function handleClick(e: React.MouseEvent) {
    const now = Date.now()
    if (now - lastClickRef.current < 300) {
      lastClickRef.current = 0
      return
    }
    lastClickRef.current = now
    onSelect(photo.id, e.shiftKey)
  }

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-label={photo.filename}
      tabIndex={0}
      className={clsx(
        'group relative rounded-xl overflow-hidden bg-surface border transition-all duration-150 cursor-pointer select-none',
        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background',
        isCulled && 'opacity-40',
        selected
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-outline-variant/20 hover:border-outline-variant/40',
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(photo.id, e.shiftKey)
        }
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-square w-full relative bg-gradient-to-br from-white/5 to-white/[0.02]">
        {photo.thumbnail_url ? (
          <img
            src={photo.thumbnail_url}
            alt={photo.filename}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-white/20" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150" />

        {/* Selection checkbox */}
        <div
          className={clsx(
            'absolute top-2 left-2 w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center z-10',
            selected
              ? 'bg-primary border-primary opacity-100'
              : 'bg-black/50 border-white/60 opacity-0 group-hover:opacity-100',
          )}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Warning badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {photo.isBlurry && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-white text-[9px] font-bold uppercase tracking-wide">
              Blur
            </span>
          )}
          {photo.isDuplicate && (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/80 text-white text-[9px] font-bold uppercase tracking-wide">
              Dup
            </span>
          )}
        </div>

        {/* AI score */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <span className="px-1.5 py-0.5 rounded bg-black/60 text-white/80 text-[10px] font-mono">
            {photo.aiScore}
          </span>
        </div>

        {/* Color label dot (persistent) */}
        {photo.colorLabel !== 'none' && (
          <div
            className={clsx(
              'absolute bottom-2 right-2 w-3 h-3 rounded-full border border-white/30 z-10',
              COLOR_LABEL_CLASSES[photo.colorLabel],
            )}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1.5 space-y-1.5">
        {/* Filename */}
        <p
          className="text-[11px] text-on-surface-variant truncate font-mono"
          title={photo.filename}
        >
          {photo.filename}
        </p>

        {/* AI label + confidence */}
        {photo.ai_category && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded truncate max-w-[80%]">
              {photo.ai_category}
            </span>
            {photo.ai_confidence != null && (
              <span className="text-[10px] text-on-surface-variant/50 font-mono flex-shrink-0">
                {Math.round(photo.ai_confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Stars + actions row */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Star rating */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStarRating(photo.id, photo.starRating === s ? 0 : s)}
                className={clsx(
                  'transition-colors',
                  s <= photo.starRating
                    ? 'text-amber-400'
                    : 'text-on-surface-variant/20 hover:text-amber-400/60',
                )}
                aria-label={`${s} star${s !== 1 ? 's' : ''}`}
              >
                <Star
                  className="w-3 h-3"
                  fill={s <= photo.starRating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* Color label picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker((v) => !v)}
                className="w-4 h-4 rounded-full border border-white/20 transition-all hover:scale-110 overflow-hidden"
                aria-label="Set color label"
              >
                <div
                  className={clsx(
                    'w-full h-full rounded-full',
                    COLOR_LABEL_CLASSES[photo.colorLabel],
                  )}
                />
              </button>

              {showColorPicker && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="absolute bottom-6 right-0 z-20 flex gap-1 p-1.5 rounded-lg bg-surface border border-outline-variant/40 shadow-elev-3">
                    {COLOR_LABELS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          onColorLabel(photo.id, c)
                          setShowColorPicker(false)
                        }}
                        className={clsx(
                          'w-4 h-4 rounded-full transition-all hover:scale-125',
                          COLOR_LABEL_CLASSES[c],
                          photo.colorLabel === c &&
                            'ring-2 ring-white/60 ring-offset-1 ring-offset-surface',
                        )}
                        aria-label={c === 'none' ? 'No label' : `${c} label`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Keep toggle */}
            <button
              type="button"
              onClick={() => onToggleKeep(photo.id)}
              className={clsx(
                'p-0.5 rounded transition-colors text-[10px] font-bold leading-none',
                photo.cullStatus === 'keep'
                  ? 'text-emerald-400'
                  : 'text-on-surface-variant/20 hover:text-emerald-400',
              )}
              title={photo.cullStatus === 'keep' ? 'Un-keep' : 'Keep'}
              aria-label={photo.cullStatus === 'keep' ? 'Remove keep flag' : 'Mark as keep'}
            >
              ✓
            </button>

            {/* Cull toggle */}
            <button
              type="button"
              onClick={() => onToggleCull(photo.id)}
              className={clsx(
                'p-0.5 rounded transition-colors',
                isCulled
                  ? 'text-red-400'
                  : 'text-on-surface-variant/20 hover:text-red-400',
              )}
              title={isCulled ? 'Restore' : 'Cull'}
              aria-label={isCulled ? 'Restore photo' : 'Cull photo'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
