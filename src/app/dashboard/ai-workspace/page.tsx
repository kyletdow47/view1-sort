'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Filter,
  Grid3X3,
  List,
  Monitor,
  Scissors,
  SortAsc,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useClassifier } from '@/hooks/useClassifier'
import type { ClassifierStatus } from '@/hooks/useClassifier'
import { PhotoCard, COLOR_LABEL_CLASSES } from './PhotoCard'
import type { WorkspacePhoto, ColorLabel } from './PhotoCard'

// ─── Types ────────────────────────────────────────────────────────────────────

type SceneTabId =
  | 'all'
  | 'ceremony'
  | 'reception'
  | 'portraits'
  | 'details'
  | 'getting_ready'
  | 'candids'
  | 'venue'

type SortKey = 'ai_score' | 'date' | 'filename'
type StarFilter = 0 | 1 | 2 | 3 | 4 | 5
type ViewMode = 'grid' | 'list'

interface ShotListItem {
  id: string
  label: string
  priority: 'must-have' | 'nice-to-have'
  matched: boolean
}

interface ShotListSection {
  id: string
  title: string
  items: ShotListItem[]
  collapsed: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCENE_TABS: Array<{ id: SceneTabId; label: string }> = [
  { id: 'all', label: 'All Photos' },
  { id: 'ceremony', label: 'Ceremony' },
  { id: 'reception', label: 'Reception' },
  { id: 'portraits', label: 'Portraits' },
  { id: 'details', label: 'Details' },
  { id: 'getting_ready', label: 'Getting Ready' },
  { id: 'candids', label: 'Candids' },
  { id: 'venue', label: 'Venue' },
]

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'ai_score', label: 'AI Score' },
  { value: 'date', label: 'Date' },
  { value: 'filename', label: 'Filename' },
]

const INITIAL_SHOT_SECTIONS: ShotListSection[] = [
  {
    id: 'ceremony',
    title: 'Ceremony',
    collapsed: false,
    items: [
      { id: 'c1', label: 'First look', priority: 'must-have', matched: true },
      { id: 'c2', label: 'Ring exchange', priority: 'must-have', matched: true },
      { id: 'c3', label: 'First kiss', priority: 'must-have', matched: false },
      { id: 'c4', label: 'Processional', priority: 'must-have', matched: true },
      { id: 'c5', label: 'Recessional', priority: 'nice-to-have', matched: false },
    ],
  },
  {
    id: 'portraits',
    title: 'Portraits',
    collapsed: true,
    items: [
      { id: 'p1', label: 'Couple portrait — outdoor', priority: 'must-have', matched: true },
      { id: 'p2', label: 'Bride solo', priority: 'must-have', matched: true },
      { id: 'p3', label: 'Groom solo', priority: 'must-have', matched: false },
      { id: 'p4', label: "Family group — bride's side", priority: 'must-have', matched: false },
      { id: 'p5', label: "Family group — groom's side", priority: 'must-have', matched: false },
      { id: 'p6', label: 'Bridal party', priority: 'nice-to-have', matched: true },
    ],
  },
  {
    id: 'details',
    title: 'Details',
    collapsed: true,
    items: [
      { id: 'd1', label: 'Wedding rings closeup', priority: 'must-have', matched: true },
      { id: 'd2', label: 'Bouquet', priority: 'must-have', matched: false },
      { id: 'd3', label: 'Table decor', priority: 'nice-to-have', matched: true },
      { id: 'd4', label: 'Cake', priority: 'nice-to-have', matched: false },
    ],
  },
]

// ─── Mock data ────────────────────────────────────────────────────────────────

function generateMockPhotos(): WorkspacePhoto[] {
  const scenes: SceneTabId[] = [
    'ceremony',
    'reception',
    'portraits',
    'details',
    'getting_ready',
    'candids',
    'venue',
  ]
  const categories = [
    'wedding ceremony',
    'wedding reception',
    'couple portrait',
    'detail shot',
    'getting ready',
    'candid moment',
    'venue exterior',
  ]

  return Array.from({ length: 48 }, (_, i) => {
    const sceneIdx = i % scenes.length
    return {
      id: `photo-${i + 1}`,
      filename: `IMG_${String(i + 1001).padStart(4, '0')}.jpg`,
      thumbnail_url: null,
      ai_category: categories[sceneIdx],
      ai_confidence: 0.65 + (((i * 7) % 32) / 100),
      starRating: 0,
      colorLabel: 'none' as ColorLabel,
      cullStatus: null,
      isBlurry: i % 17 === 0,
      isDuplicate: i % 11 === 0,
      faceCount: i % 3,
      sceneTab: scenes[sceneIdx],
      aiScore: 60 + ((i * 13) % 40),
      selected: false,
    }
  })
}

// ─── ClassifierStatusBadge ────────────────────────────────────────────────────

function ClassifierStatusBadge({ status }: { status: ClassifierStatus }) {
  const map: Record<ClassifierStatus, { label: string; color: string; dot: string }> = {
    idle: { label: 'Not started', color: 'text-on-surface-variant', dot: 'bg-white/20' },
    loading: {
      label: 'Loading model…',
      color: 'text-amber-400',
      dot: 'bg-amber-400 animate-pulse',
    },
    ready: { label: 'Ready', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    classifying: {
      label: 'Classifying…',
      color: 'text-blue-400',
      dot: 'bg-blue-400 animate-pulse',
    },
    error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
  }
  const m = map[status]
  return (
    <div className="flex items-center gap-1.5">
      <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', m.dot)} />
      <span className={clsx('text-xs', m.color)}>{m.label}</span>
    </div>
  )
}

// ─── CullModeView ─────────────────────────────────────────────────────────────

function CullModeView({
  photos,
  cullIndex,
  onCullLeft,
  onCullRight,
  onKeepBoth,
}: {
  photos: WorkspacePhoto[]
  cullIndex: number
  onCullLeft: () => void
  onCullRight: () => void
  onKeepBoth: () => void
}) {
  const left = photos[cullIndex]
  const right = photos[cullIndex + 1]

  if (!left) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
        <h3 className="text-on-surface font-semibold mb-1">Culling complete!</h3>
        <p className="text-on-surface-variant text-sm">
          {photos.filter((p) => p.cullStatus !== 'cull').length} photos kept
        </p>
      </div>
    )
  }

  function PhotoPane({ photo, onCull }: { photo: WorkspacePhoto; onCull: () => void }) {
    return (
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex-1 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 relative min-h-0">
          {photo.thumbnail_url ? (
            <img
              src={photo.thumbnail_url}
              alt={photo.filename}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-surface-container">
              <span className="text-on-surface-variant/30 font-mono text-sm">{photo.filename}</span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
            {photo.isBlurry && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/80 text-white text-[10px] font-medium">
                Blurry
              </span>
            )}
            {photo.isDuplicate && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/80 text-white text-[10px] font-medium">
                Dup
              </span>
            )}
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between z-10">
            <span className="text-xs text-white/60 font-mono truncate bg-black/40 px-2 py-0.5 rounded">
              {photo.filename}
            </span>
            <span className="text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded font-mono">
              {photo.aiScore}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCull}
          className="py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          Cull
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Progress + keyboard hints */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm text-on-surface-variant font-mono">
          {cullIndex + 1}–{Math.min(cullIndex + 2, photos.length)} of {photos.length}
        </span>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 font-mono text-[10px]">
              ←
            </kbd>
            Cull left
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 font-mono text-[10px]">
              →
            </kbd>
            Cull right
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 font-mono text-[10px]">
              Space
            </kbd>
            Keep both
          </span>
        </div>
      </div>

      {/* Side-by-side panes */}
      <div className="flex gap-4 flex-1 min-h-0">
        <PhotoPane photo={left} onCull={onCullLeft} />
        {right ? (
          <PhotoPane photo={right} onCull={onCullRight} />
        ) : (
          <div className="flex-1 rounded-xl border-2 border-dashed border-outline-variant/20 flex items-center justify-center">
            <p className="text-on-surface-variant/40 text-sm">Last photo</p>
          </div>
        )}
      </div>

      {/* Keep both */}
      <button
        type="button"
        onClick={onKeepBoth}
        className="py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
      >
        Keep Both — Next Pair
      </button>
    </div>
  )
}

// ─── PhotoListRow ─────────────────────────────────────────────────────────────

function PhotoListRow({
  photo,
  selected,
  onSelect,
  onStarRating,
  onToggleCull,
}: {
  photo: WorkspacePhoto
  selected: boolean
  onSelect: (id: string) => void
  onStarRating: (id: string, r: number) => void
  onToggleCull: (id: string) => void
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150',
        photo.cullStatus === 'cull' ? 'opacity-40' : '',
        selected
          ? 'bg-primary/10 border-primary/30'
          : 'bg-surface border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container/50',
      )}
      onClick={() => onSelect(photo.id)}
    >
      {/* Thumbnail swatch */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
        {photo.thumbnail_url ? (
          <img
            src={photo.thumbnail_url}
            alt={photo.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={clsx(
              'w-full h-full',
              photo.colorLabel !== 'none'
                ? COLOR_LABEL_CLASSES[photo.colorLabel] + '/30'
                : 'bg-white/5',
            )}
          />
        )}
      </div>

      {/* Filename */}
      <span className="flex-1 text-sm text-on-surface font-mono truncate min-w-0">
        {photo.filename}
      </span>

      {/* AI category */}
      {photo.ai_category && (
        <span className="text-xs text-on-surface-variant/70 truncate max-w-[120px] hidden md:block">
          {photo.ai_category}
        </span>
      )}

      {/* Confidence */}
      {photo.ai_confidence != null && (
        <span className="text-xs font-mono text-on-surface-variant/50 w-10 text-right flex-shrink-0 hidden sm:block">
          {Math.round(photo.ai_confidence * 100)}%
        </span>
      )}

      {/* Stars */}
      <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStarRating(photo.id, photo.starRating === s ? 0 : s)}
            className={clsx(
              'transition-colors',
              s <= photo.starRating
                ? 'text-amber-400'
                : 'text-on-surface-variant/20 hover:text-amber-400/50',
            )}
            aria-label={`${s} star${s !== 1 ? 's' : ''}`}
          >
            <Star
              className="w-3.5 h-3.5"
              fill={s <= photo.starRating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>

      {/* Color dot */}
      <div
        className={clsx('w-3 h-3 rounded-full flex-shrink-0', COLOR_LABEL_CLASSES[photo.colorLabel])}
      />

      {/* Flags */}
      {photo.isBlurry && (
        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded hidden sm:block">
          Blurry
        </span>
      )}
      {photo.isDuplicate && (
        <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded hidden sm:block">
          Dup
        </span>
      )}

      {/* Cull */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleCull(photo.id)
        }}
        className={clsx(
          'p-1 rounded transition-colors flex-shrink-0',
          photo.cullStatus === 'cull'
            ? 'text-red-400 bg-red-400/10'
            : 'text-on-surface-variant/40 hover:text-red-400 hover:bg-red-400/10',
        )}
        title={photo.cullStatus === 'cull' ? 'Restore' : 'Cull'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIWorkspacePage() {
  const { status: classifierStatus, loadProgress, error: classifierError } = useClassifier()

  const [photos, setPhotos] = useState<WorkspacePhoto[]>(() => generateMockPhotos())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [activeTab, setActiveTab] = useState<SceneTabId>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortKey>('ai_score')
  const [starFilter, setStarFilter] = useState<StarFilter>(0)
  const [colorFilter, setColorFilter] = useState<ColorLabel>('none')
  const [cullMode, setCullMode] = useState(false)
  const [cullIndex, setCullIndex] = useState(0)
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const [shotSections, setShotSections] = useState<ShotListSection[]>(INITIAL_SHOT_SECTIONS)

  // Mock classified count — in production this comes from the classifier worker
  const classifiedCount = 248
  const totalCount = photos.length

  // ── Filtered + sorted photos ───────────────────────────────────────
  const visiblePhotos = useMemo(() => {
    const list = photos.filter((p) => {
      if (activeTab !== 'all' && p.sceneTab !== activeTab) return false
      if (starFilter > 0 && p.starRating < starFilter) return false
      if (colorFilter !== 'none' && p.colorLabel !== colorFilter) return false
      return true
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'ai_score') return b.aiScore - a.aiScore
      if (sortBy === 'filename') return a.filename.localeCompare(b.filename)
      return 0
    })
  }, [photos, activeTab, starFilter, colorFilter, sortBy])

  // Photo counts per tab
  const tabCounts = useMemo(() => {
    const counts: Record<SceneTabId, number> = {
      all: photos.length,
      ceremony: 0,
      reception: 0,
      portraits: 0,
      details: 0,
      getting_ready: 0,
      candids: 0,
      venue: 0,
    }
    photos.forEach((p) => {
      counts[p.sceneTab as SceneTabId]++
    })
    return counts
  }, [photos])

  // Photos available for cull mode (exclude already-culled)
  const cullPhotos = useMemo(
    () => visiblePhotos.filter((p) => p.cullStatus !== 'cull'),
    [visiblePhotos],
  )

  // ── Selection ──────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (shiftKey && prev.size > 0) {
          const ids = visiblePhotos.map((p) => p.id)
          let lastIdx = -1
          for (let i = ids.length - 1; i >= 0; i--) {
            if (prev.has(ids[i])) {
              lastIdx = i
              break
            }
          }
          const currIdx = ids.indexOf(id)
          if (lastIdx >= 0) {
            const lo = Math.min(lastIdx, currIdx)
            const hi = Math.max(lastIdx, currIdx)
            ids.slice(lo, hi + 1).forEach((i) => next.add(i))
            return next
          }
        }
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [visiblePhotos],
  )

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(visiblePhotos.map((p) => p.id)))
  }, [visiblePhotos])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // ── Photo mutations ────────────────────────────────────────────────
  const setStarRating = useCallback((id: string, rating: number) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, starRating: rating } : p)))
  }, [])

  const setColorLabel = useCallback((id: string, label: ColorLabel) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, colorLabel: label } : p)))
  }, [])

  const toggleCullStatus = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cullStatus: p.cullStatus === 'cull' ? null : 'cull' } : p,
      ),
    )
  }, [])

  const toggleKeepStatus = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cullStatus: p.cullStatus === 'keep' ? null : 'keep' } : p,
      ),
    )
  }, [])

  // ── Cull mode keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    if (!cullMode) return

    function onKey(e: KeyboardEvent) {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      const left = cullPhotos[cullIndex]
      const right = cullPhotos[cullIndex + 1]

      if (e.key === 'ArrowLeft' && left) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === left.id ? { ...p, cullStatus: 'cull' } : p)),
        )
      } else if (e.key === 'ArrowRight' && right) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === right.id ? { ...p, cullStatus: 'cull' } : p)),
        )
        setCullIndex((i) => Math.min(i + 2, Math.max(0, cullPhotos.length - 2)))
      } else if (e.key === ' ') {
        setCullIndex((i) => Math.min(i + 2, Math.max(0, cullPhotos.length - 2)))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cullMode, cullIndex, cullPhotos])

  // ── Shot list ──────────────────────────────────────────────────────
  function toggleShotSection(id: string) {
    setShotSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)),
    )
  }

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      scenes: SCENE_TABS.length - 1,
      blurry: photos.filter((p) => p.isBlurry).length,
      duplicates: photos.filter((p) => p.isDuplicate).length,
      faces: photos.reduce((acc, p) => acc + p.faceCount, 0),
    }),
    [photos],
  )

  const shotListStats = useMemo(() => {
    const all = shotSections.flatMap((s) => s.items)
    return { total: all.length, matched: all.filter((i) => i.matched).length }
  }, [shotSections])

  const activeFiltersCount = (starFilter > 0 ? 1 : 0) + (colorFilter !== 'none' ? 1 : 0)

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-5 h-[calc(100vh-80px)] min-h-0">

      {/* ── Left panel (70%) ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 gap-3">

        {/* Scene tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {SCENE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0',
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-container text-on-surface-variant',
                )}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-outline-variant/30 overflow-hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={clsx(
                'flex items-center justify-center p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={clsx(
                'flex items-center justify-center p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen((v) => !v)
                setFilterOpen(false)
              }}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50 transition-colors"
            >
              <SortAsc className="w-3.5 h-3.5" />
              {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-xl border border-outline-variant/40 bg-surface shadow-elev-3 overflow-hidden">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        setSortBy(s.value)
                        setSortOpen(false)
                      }}
                      className={clsx(
                        'w-full px-3 py-2.5 text-sm text-left transition-colors',
                        sortBy === s.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFilterOpen((v) => !v)
                setSortOpen(false)
              }}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors',
                activeFiltersCount > 0
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-outline-variant/30 bg-surface text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50',
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-56 rounded-xl border border-outline-variant/40 bg-surface shadow-elev-3 p-3 space-y-3">
                  {/* Star filter */}
                  <div>
                    <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Min Stars
                    </p>
                    <div className="flex gap-1">
                      {([0, 1, 2, 3, 4, 5] as StarFilter[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStarFilter(s)}
                          className={clsx(
                            'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                            starFilter === s
                              ? 'bg-amber-400/20 text-amber-400'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                          )}
                        >
                          {s === 0 ? 'All' : s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color label filter */}
                  <div>
                    <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Color Label
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['none', 'red', 'yellow', 'green', 'blue', 'purple'] as ColorLabel[]).map(
                        (c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColorFilter(c)}
                            className={clsx(
                              'w-6 h-6 rounded-full transition-all hover:scale-110',
                              COLOR_LABEL_CLASSES[c],
                              colorFilter === c &&
                                'ring-2 ring-white/60 ring-offset-1 ring-offset-surface scale-110',
                            )}
                            aria-label={c === 'none' ? 'No filter' : `${c} label`}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStarFilter(0)
                        setColorFilter('none')
                      }}
                      className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Select All / clear */}
          {selectedIds.size === 0 ? (
            <button
              type="button"
              onClick={selectAll}
              className="px-2 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Select All
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">
                {selectedIds.size} selected
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cull mode toggle */}
          <button
            type="button"
            onClick={() => {
              setCullMode((v) => !v)
              setCullIndex(0)
            }}
            className={clsx(
              'ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-shrink-0',
              cullMode
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                : 'border border-outline-variant/30 bg-surface text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50',
            )}
          >
            <Scissors className="w-3.5 h-3.5" />
            {cullMode ? 'Exit Cull Mode' : 'Cull Mode'}
          </button>
        </div>

        {/* Photo area */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {cullMode ? (
            <CullModeView
              photos={cullPhotos}
              cullIndex={cullIndex}
              onCullLeft={() => {
                const left = cullPhotos[cullIndex]
                if (left) {
                  setPhotos((prev) =>
                    prev.map((p) => (p.id === left.id ? { ...p, cullStatus: 'cull' } : p)),
                  )
                }
              }}
              onCullRight={() => {
                const right = cullPhotos[cullIndex + 1]
                if (right) {
                  setPhotos((prev) =>
                    prev.map((p) => (p.id === right.id ? { ...p, cullStatus: 'cull' } : p)),
                  )
                  setCullIndex((i) => Math.min(i + 2, Math.max(0, cullPhotos.length - 2)))
                }
              }}
              onKeepBoth={() =>
                setCullIndex((i) => Math.min(i + 2, Math.max(0, cullPhotos.length - 2)))
              }
            />
          ) : visiblePhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-on-surface-variant text-sm">No photos match the current filters.</p>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter(0)
                    setColorFilter('none')
                  }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visiblePhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  selected={selectedIds.has(photo.id)}
                  onSelect={handleSelect}
                  onStarRating={setStarRating}
                  onColorLabel={setColorLabel}
                  onToggleCull={toggleCullStatus}
                  onToggleKeep={toggleKeepStatus}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {visiblePhotos.map((photo) => (
                <PhotoListRow
                  key={photo.id}
                  photo={photo}
                  selected={selectedIds.has(photo.id)}
                  onSelect={(id) => handleSelect(id, false)}
                  onStarRating={setStarRating}
                  onToggleCull={toggleCullStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel (30%) ─────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">

        {/* AI Classifier Status */}
        <div className="rounded-xl bg-surface border border-outline-variant/20 p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface">AI Classification</h3>
            <ClassifierStatusBadge status={classifierStatus} />
          </div>

          {/* Classification progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>
                Classified {classifiedCount} / {totalCount} photos
              </span>
              <span>{Math.round((classifiedCount / totalCount) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
                style={{ width: `${(classifiedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Model info row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Zap className="w-3.5 h-3.5" />
              <span>SigLIP (CLIP)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Monitor className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">In browser</span>
            </div>
          </div>

          {/* Privacy badge */}
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-400/80 leading-snug">
              Running in your browser — private & free. Photos never leave your device.
            </p>
          </div>

          {/* Model loading progress */}
          {classifierStatus === 'loading' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-on-surface-variant">
                <span>Loading model…</span>
                <span>{loadProgress}%</span>
              </div>
              <div className="h-1 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-200"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          )}

          {classifierError && (
            <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-400">{classifierError}</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl bg-surface border border-outline-variant/20 p-4 flex-shrink-0">
          <h3 className="text-sm font-semibold text-on-surface mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: 'Scenes found',
                value: stats.scenes,
                icon: <Sparkles className="w-4 h-4" />,
                color: 'text-violet-400',
              },
              {
                label: 'Blurry flagged',
                value: stats.blurry,
                icon: <AlertTriangle className="w-4 h-4" />,
                color: 'text-amber-400',
              },
              {
                label: 'Duplicates',
                value: stats.duplicates,
                icon: <Copy className="w-4 h-4" />,
                color: 'text-blue-400',
              },
              {
                label: 'Faces detected',
                value: stats.faces,
                icon: <Eye className="w-4 h-4" />,
                color: 'text-emerald-400',
              },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-lg bg-surface-container p-3 space-y-1">
                <div className={clsx('flex items-center gap-1.5', color)}>
                  {icon}
                  <span className="text-xl font-bold font-mono">{value}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shot List */}
        <div className="rounded-xl bg-surface border border-outline-variant/20 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 flex-shrink-0">
            <h3 className="text-sm font-semibold text-on-surface">Shot List</h3>
            <span className="text-xs text-on-surface-variant font-mono">
              {shotListStats.matched}/{shotListStats.total}
            </span>
          </div>

          {/* Shot list overall progress */}
          <div className="px-4 py-2 border-b border-outline-variant/10 flex-shrink-0">
            <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${(shotListStats.matched / shotListStats.total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-outline-variant/10">
            {shotSections.map((section) => (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggleShotSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-container/50 transition-colors"
                >
                  <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                    {section.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {section.items.filter((i) => i.matched).length}/{section.items.length}
                    </span>
                    {section.collapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
                    )}
                  </div>
                </button>

                {!section.collapsed && (
                  <div className="pb-1">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 px-4 py-2 hover:bg-surface-container/30 transition-colors"
                      >
                        <div
                          className={clsx(
                            'mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border',
                            item.matched
                              ? 'bg-emerald-500/20 border-emerald-500/50'
                              : 'border-outline-variant/40',
                          )}
                        >
                          {item.matched && (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          )}
                        </div>
                        <p
                          className={clsx(
                            'flex-1 text-xs leading-snug',
                            item.matched
                              ? 'text-on-surface/50 line-through'
                              : 'text-on-surface',
                          )}
                        >
                          {item.label}
                        </p>
                        {item.priority === 'must-have' && !item.matched && (
                          <span className="flex-shrink-0 text-[9px] font-semibold text-amber-400/80 uppercase tracking-wider mt-0.5">
                            Must
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
