'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Share2,
  Film,
  Info,
} from 'lucide-react'
import type { Media, GalleryTheme } from '@/types/supabase'

// ─── Theme tokens ────────────────────────────────────────────────────────────

type ThemeTokens = {
  backdrop: string
  border: string
  text: string
  muted: string
  btnBg: string
  btnHover: string
  infoBg: string
}

const TOKENS: Record<GalleryTheme, ThemeTokens> = {
  dark: {
    backdrop: 'rgba(0,0,0,0.95)',
    border: 'rgba(255,255,255,0.10)',
    text: '#f0f0f0',
    muted: '#8a8a8a',
    btnBg: 'rgba(255,255,255,0.10)',
    btnHover: 'rgba(255,255,255,0.20)',
    infoBg: 'rgba(0,0,0,0.75)',
  },
  light: {
    backdrop: 'rgba(249,250,251,0.97)',
    border: 'rgba(0,0,0,0.10)',
    text: '#111827',
    muted: '#6b7280',
    btnBg: 'rgba(0,0,0,0.07)',
    btnHover: 'rgba(0,0,0,0.13)',
    infoBg: 'rgba(0,0,0,0.70)',
  },
  minimal: {
    backdrop: 'rgba(249,250,251,0.98)',
    border: 'rgba(0,0,0,0.08)',
    text: '#1f2937',
    muted: '#9ca3af',
    btnBg: 'rgba(0,0,0,0.06)',
    btnHover: 'rgba(0,0,0,0.12)',
    infoBg: 'rgba(0,0,0,0.72)',
  },
  editorial: {
    backdrop: 'rgba(12,10,9,0.97)',
    border: 'rgba(255,255,255,0.08)',
    text: '#f0f0f0',
    muted: '#8a8a8a',
    btnBg: 'rgba(255,255,255,0.08)',
    btnHover: 'rgba(255,255,255,0.18)',
    infoBg: 'rgba(0,0,0,0.78)',
  },
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface GalleryLightboxProps {
  media: Media[]
  initialIndex: number
  onClose: () => void
  /** Called when user clicks Download. Leave undefined to hide the button. */
  onDownload?: (item: Media) => void
  /** Called when user clicks Heart or presses F. Leave undefined to hide the button. */
  onFavorite?: (item: Media) => void
  /** Set of media IDs that are currently favorited. */
  favoriteIds?: Set<string>
  /** Gallery theme (dark | light | minimal | editorial). Defaults to 'dark'. */
  theme?: GalleryTheme
  /** Whether download is allowed at the current access level. Defaults to true. */
  canDownload?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GalleryLightbox({
  media,
  initialIndex,
  onClose,
  onDownload,
  onFavorite,
  favoriteIds = new Set(),
  theme = 'dark',
  canDownload = true,
}: GalleryLightboxProps) {
  const tk = TOKENS[theme] ?? TOKENS.dark

  // ── State ──────────────────────────────────────────────────────────────────
  const [index, setIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [showFilmstrip, setShowFilmstrip] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Touch / pinch refs ─────────────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const pinchStartDist = useRef<number | null>(null)
  const pinchBaseZoom = useRef(1)

  // ── Filmstrip refs ─────────────────────────────────────────────────────────
  const activeThumbRef = useRef<HTMLButtonElement | null>(null)

  const current = media[index]

  // ── Mount fade-in ──────────────────────────────────────────────────────────
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // ── Lock body scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : media.length - 1))
    setZoom(1)
  }, [media.length])

  const next = useCallback(() => {
    setIndex((i) => (i < media.length - 1 ? i + 1 : 0))
    setZoom(1)
  }, [media.length])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          prev()
          break
        case 'ArrowRight':
          next()
          break
        case 'f':
        case 'F':
          if (onFavorite && current) onFavorite(current)
          break
        case 'd':
        case 'D':
          if (canDownload && onDownload && current) onDownload(current)
          break
        case 'i':
        case 'I':
          setShowInfo((v) => !v)
          break
        case 't':
        case 'T':
          setShowFilmstrip((v) => !v)
          break
        case '+':
        case '=':
          setZoom((z) => Math.min(5, z + 0.5))
          break
        case '-':
          setZoom((z) => Math.max(1, z - 0.5))
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next, onFavorite, onDownload, current, canDownload])

  // ── Preload adjacent photos ─────────────────────────────────────────────────
  useEffect(() => {
    const neighbors = [index - 2, index - 1, index + 1, index + 2]
      .filter((i) => i >= 0 && i < media.length)

    neighbors.forEach((i) => {
      const item = media[i]
      const url = item.watermarked_url ?? item.thumbnail_url
      if (!url) return
      const img = new window.Image()
      img.src = url
    })
  }, [index, media])

  // ── Scroll filmstrip to current ─────────────────────────────────────────────
  useEffect(() => {
    if (showFilmstrip) {
      activeThumbRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [index, showFilmstrip])

  // ── Touch events ───────────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartDist.current = Math.hypot(dx, dy)
      pinchBaseZoom.current = zoom
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / pinchStartDist.current
      setZoom(Math.min(5, Math.max(1, pinchBaseZoom.current * ratio)))
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Single-touch swipe (only when not zoomed)
    if (
      e.changedTouches.length === 1 &&
      touchStartX.current !== null &&
      touchStartY.current !== null &&
      zoom === 1
    ) {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) next()
        else prev()
      }
    }
    pinchStartDist.current = null
    touchStartX.current = null
    touchStartY.current = null
  }

  // ── Scroll-wheel zoom ──────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.min(5, Math.max(1, z - e.deltaY * 0.0015)))
  }

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }, [])

  if (!current) return null

  const isFavorited = favoriteIds.has(current.id)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: tk.backdrop,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${tk.border}` }}
      >
        {/* Title */}
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-semibold truncate" style={{ color: tk.text }}>
            {current.filename}
          </p>
          {current.ai_category && (
            <p className="text-xs mt-0.5 truncate" style={{ color: tk.muted }}>
              {current.ai_category}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Heart / Favorite */}
          {onFavorite && (
            <button
              onClick={() => onFavorite(current)}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity"
              style={{
                backgroundColor: tk.btnBg,
                color: isFavorited ? '#f43f5e' : tk.text,
              }}
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            aria-label="Copy link to this photo"
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-opacity"
            style={{ backgroundColor: tk.btnBg, color: tk.text }}
          >
            <Share2 size={13} />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Download */}
          {canDownload && onDownload && (
            <button
              onClick={() => onDownload(current)}
              aria-label="Download photo"
              className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-opacity"
              style={{ backgroundColor: tk.btnBg, color: tk.text }}
            >
              <Download size={13} />
              <span>Download</span>
            </button>
          )}

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo((v) => !v)}
            aria-label="Toggle info panel"
            aria-pressed={showInfo}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity"
            style={{
              backgroundColor: showInfo ? tk.btnHover : tk.btnBg,
              color: tk.text,
            }}
          >
            <Info size={16} />
          </button>

          {/* Filmstrip toggle */}
          <button
            onClick={() => setShowFilmstrip((v) => !v)}
            aria-label="Toggle filmstrip"
            aria-pressed={showFilmstrip}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity"
            style={{
              backgroundColor: showFilmstrip ? tk.btnHover : tk.btnBg,
              color: tk.text,
            }}
          >
            <Film size={16} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close lightbox"
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity"
            style={{ backgroundColor: tk.btnBg, color: tk.text }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main area (image + nav arrows) ── */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onClick={onClose}
      >
        {/* Prev arrow */}
        {media.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: tk.btnBg, color: tk.text }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.watermarked_url ?? current.thumbnail_url ?? current.storage_path}
          alt={current.filename}
          className="max-w-full max-h-full object-contain select-none rounded-sm"
          style={{
            transform: `scale(${zoom})`,
            transition: zoom === 1 ? 'transform 200ms ease' : 'none',
            cursor: zoom > 1 ? 'zoom-out' : 'default',
            padding: '0 3.5rem',
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (zoom > 1) setZoom(1)
          }}
          draggable={false}
        />

        {/* Next arrow */}
        {media.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: tk.btnBg, color: tk.text }}
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Info panel overlay */}
        {showInfo && (
          <div
            className="absolute bottom-0 left-0 right-0 px-6 py-4"
            style={{
              backgroundColor: tk.infoBg,
              backdropFilter: 'blur(8px)',
              color: '#f0f0f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{current.filename}</p>
                {current.ai_category && (
                  <p className="text-xs mt-1 opacity-70">Category: {current.ai_category}</p>
                )}
                {current.orientation && (
                  <p className="text-xs mt-0.5 opacity-70">
                    Orientation: {current.orientation}
                  </p>
                )}
              </div>
              <p className="text-xs tabular-nums font-mono opacity-70 flex-shrink-0">
                {index + 1} of {media.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom area ── */}
      <div className="flex-shrink-0" style={{ borderTop: `1px solid ${tk.border}` }}>
        {/* Filmstrip */}
        {showFilmstrip && (
          <div
            className="flex items-center gap-1.5 overflow-x-auto px-4 py-2"
            style={{ borderBottom: `1px solid ${tk.border}` }}
          >
            {media.map((item, i) => (
              <button
                key={item.id}
                ref={i === index ? activeThumbRef : null}
                onClick={() => {
                  setIndex(i)
                  setZoom(1)
                }}
                aria-label={`Go to photo ${i + 1}`}
                className="flex-shrink-0 w-14 h-14 rounded overflow-hidden"
                style={{
                  outline: i === index ? '2px solid #5749F4' : '2px solid transparent',
                  outlineOffset: '1px',
                  opacity: i === index ? 1 : 0.5,
                  transition: 'opacity 150ms ease, outline-color 150ms ease',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail_url ?? item.storage_path}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Counter + keyboard hints */}
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-xs tabular-nums font-mono" style={{ color: tk.muted }}>
            {index + 1} / {media.length}
          </p>

          <div className="flex items-center gap-3">
            {zoom > 1 && (
              <button
                onClick={() => setZoom(1)}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: tk.btnBg, color: tk.muted }}
              >
                Reset zoom
              </button>
            )}
            <p className="text-xs hidden md:block" style={{ color: tk.muted }}>
              ← → navigate &middot; F favorite &middot; I info &middot; T filmstrip &middot; Esc close
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
