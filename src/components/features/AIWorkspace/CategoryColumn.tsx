'use client'

import { useState, useRef } from 'react'
import type { MediaItem } from '@/types/media'

interface CategoryColumnProps {
  name: string
  color: string
  photos: MediaItem[]
  selectedIds: Set<string>
  onSelect: (id: string, shiftKey: boolean) => void
  onDoubleClick: (id: string) => void
  /** Called when a photo is dragged from another column and dropped here */
  onDrop?: (mediaId: string, targetCategory: string) => void
}

/* ── Culling flag helpers ─────────────────────────────────────────── */

interface CullFlag {
  label: string
  color: string
}

function getCullFlags(photo: MediaItem): CullFlag[] {
  const flags: CullFlag[] = []
  if (photo.is_blurry) flags.push({ label: 'Blurry / out of focus', color: 'text-amber-300' })
  if (photo.is_duplicate) flags.push({ label: 'Possible duplicate', color: 'text-amber-300' })
  if (photo.is_overexposed) flags.push({ label: 'Overexposed', color: 'text-orange-400' })
  if (photo.is_underexposed) flags.push({ label: 'Underexposed', color: 'text-blue-400' })
  return flags
}

/* ── CullFlagBadge — amber triangle with click popover ────────────── */

function CullFlagBadge({ photo }: { photo: MediaItem }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const flags = getCullFlags(photo)
  if (flags.length === 0) return null

  const confidence = photo.culling_confidence != null
    ? Math.round(photo.culling_confidence * 100)
    : null

  return (
    <div className="absolute top-1.5 right-1.5 z-10">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        title="Flagged by AI quality analysis — click for details"
        className="w-6 h-6 flex items-center justify-center rounded-full
          bg-amber-500/90 hover:bg-amber-400 backdrop-blur-sm
          shadow-lg transition-all duration-150 active:scale-95"
        aria-label="Quality issue detected — click for details"
      >
        {/* Warning triangle icon */}
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-52
            rounded-xl border border-amber-500/30 bg-[#1a1520]/95 backdrop-blur-xl
            shadow-2xl p-3 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-amber-400 text-[11px] font-semibold uppercase tracking-wider">
              Quality Flags
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false) }}
              className="text-white/30 hover:text-white/70 transition-colors"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Flag list */}
          <ul className="flex flex-col gap-1.5">
            {flags.map((f) => (
              <li key={f.label} className="flex items-start gap-2">
                <svg className={`w-3.5 h-3.5 flex-shrink-0 mt-px ${f.color}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd" />
                </svg>
                <span className="text-white/70 text-xs font-[Geist,sans-serif]">{f.label}</span>
              </li>
            ))}
          </ul>

          {/* Confidence footer */}
          {confidence != null && (
            <div className="pt-1.5 border-t border-white/10">
              <span className="text-white/30 text-[10px] font-mono">
                Culling confidence: {confidence}%
              </span>
            </div>
          )}

          <p className="text-white/30 text-[10px] font-[Geist,sans-serif] leading-tight">
            Flag these photos for review or drag them to reject.
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Main Column ──────────────────────────────────────────────────── */

export function CategoryColumn({
  name,
  color,
  photos,
  selectedIds,
  onSelect,
  onDoubleClick,
  onDrop,
}: CategoryColumnProps) {
  const photoCount = photos.length
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (e: React.DragEvent, mediaId: string) => {
    e.dataTransfer.setData('text/plain', mediaId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const mediaId = e.dataTransfer.getData('text/plain')
    if (mediaId && onDrop) {
      onDrop(mediaId, name)
    }
  }

  return (
    <div
      className={`
        flex flex-col gap-2.5 p-3 rounded-[20px] h-full overflow-hidden
        border backdrop-blur-md transition-all duration-150
        ${isDragOver
          ? 'border-white/50 bg-white/[0.12] scale-[1.01]'
          : 'border-white/20 bg-white/[0.08]'
        }
      `}
      style={{
        background: isDragOver
          ? `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)`
          : `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
          <div className={`flex items-center justify-center flex-1 text-sm
            ${isDragOver ? 'text-white/40' : 'text-white/20'}`}>
            {isDragOver ? 'Drop here' : 'No photos'}
          </div>
        ) : (
          photos.map((photo) => {
            const isSelected = selectedIds.has(photo.id)
            const hasCullFlags = getCullFlags(photo).length > 0
            const isRejected = photo.review_flag === 'reject'
            const isKept = photo.review_flag === 'keep'
            const isStarred = photo.is_starred === true

            return (
              <button
                key={photo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, photo.id)}
                onClick={(e) => onSelect(photo.id, e.shiftKey)}
                onDoubleClick={() => onDoubleClick(photo.id)}
                className={`
                  relative rounded-lg overflow-hidden aspect-[4/3] w-full
                  transition-all duration-150 cursor-grab active:cursor-grabbing group
                  ${isSelected
                    ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-transparent'
                    : 'hover:ring-1 hover:ring-white/30'
                  }
                  ${isRejected ? 'opacity-50' : ''}
                `}
              >
                {photo.thumbnail_url ? (
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
                    <span className="text-white/20 text-xs truncate px-2">
                      {photo.filename}
                    </span>
                  </div>
                )}

                {/* Culling flag triangle — top-right */}
                {hasCullFlags && <CullFlagBadge photo={photo} />}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Star indicator */}
                {isStarred && !isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400 drop-shadow" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}

                {/* Review flag badge — bottom-left */}
                {(isKept || isRejected) && (
                  <div className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm
                    ${isKept ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                    {isKept ? 'Keep' : 'Reject'}
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
