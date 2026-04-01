'use client'

import React, { useCallback, useState } from 'react'
import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Info,
  KeyRound,
  Layout,
  Link2,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  QrCode,
  Send,
  Settings2,
  Sliders,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockProject {
  id: string
  name: string
  photoCount: number
  date: string
}

interface GalleryPhoto {
  id: string
  hue: number
  included: boolean
  isCover: boolean
  filename: string
  resolution: string
  aiScore: number
}

type TabId = 'curate' | 'present' | 'deliver'
type GalleryTheme = 'minimal' | 'editorial' | 'classic' | 'film'
type TransitionStyle = 'fade' | 'slide' | 'zoom' | 'none'
type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
type AccessMode = 'public' | 'password' | 'email'
type DownloadFormat = 'jpeg' | 'raw' | 'both'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: MockProject[] = [
  { id: 'p1', name: 'Johnson Wedding', photoCount: 428, date: 'Mar 22, 2026' },
  { id: 'p2', name: 'Smith Engagement', photoCount: 186, date: 'Mar 15, 2026' },
  { id: 'p3', name: 'Rivera Quinceañera', photoCount: 312, date: 'Mar 8, 2026' },
  { id: 'p4', name: 'Chen Family Session', photoCount: 94, date: 'Feb 28, 2026' },
]

const MOCK_PHOTOS: GalleryPhoto[] = Array.from({ length: 40 }, (_, i) => ({
  id: `photo-${i}`,
  hue: [25, 180, 340, 50, 210, 290, 130, 10, 260, 160][i % 10],
  included: i < 30,
  isCover: i === 0,
  filename: `DSC_${String(1000 + i * 47).padStart(4, '0')}.ARW`,
  resolution: ['6240×4160', '5472×3648', '7952×5304'][i % 3],
  aiScore: Math.round(60 + (i % 7) * 6 + (i % 3) * 4),
}))

const PRINT_PRODUCTS = [
  { id: 'pr1', label: '4×6 Print', defaultPrice: '8' },
  { id: 'pr2', label: '5×7 Print', defaultPrice: '12' },
  { id: 'pr3', label: '8×10 Print', defaultPrice: '24' },
  { id: 'pr4', label: '11×14 Print', defaultPrice: '45' },
  { id: 'pr5', label: '16×20 Print', defaultPrice: '85' },
  { id: 'pr6', label: 'Canvas Wrap', defaultPrice: '120' },
  { id: 'pr7', label: 'Metal Print', defaultPrice: '160' },
  { id: 'pr8', label: 'Photo Book', defaultPrice: '95' },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function toggle(current: boolean): boolean {
  return !current
}

// ─── Project Selector ─────────────────────────────────────────────────────────

function ProjectSelector({
  selected,
  onSelect,
}: {
  selected: MockProject
  onSelect: (p: MockProject) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm font-sans text-on-surface hover:bg-surface-container-high transition-colors"
      >
        <Layout className="w-4 h-4 text-on-surface-variant/50" />
        <span className="font-medium">{selected.name}</span>
        <span className="font-mono text-xs text-on-surface-variant/40">{selected.photoCount}</span>
        <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant/40 ml-1" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-surface-container border border-outline-variant/20 rounded-xl shadow-elev-2 overflow-hidden">
          {MOCK_PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false) }}
              className={[
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                p.id === selected.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-surface-container-high text-on-surface',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium truncate">{p.name}</p>
                <p className="text-xs font-mono text-on-surface-variant/40 mt-0.5">{p.date} · {p.photoCount} photos</p>
              </div>
              {p.id === selected.id && <Star className="w-3.5 h-3.5 fill-primary text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sortable Photo Card ──────────────────────────────────────────────────────

function SortablePhotoCard({
  photo,
  onToggleInclude,
  onSetCover,
}: {
  photo: GalleryPhoto
  onToggleInclude: (id: string) => void
  onSetCover: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing aspect-square"
    >
      {/* Coloured placeholder thumbnail */}
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, hsl(${photo.hue},40%,16%) 0%, hsl(${photo.hue},55%,26%) 100%)`,
        }}
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <div className="flex items-start justify-between gap-1">
          {/* Include/Exclude toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleInclude(photo.id) }}
            onPointerDown={(e) => e.stopPropagation()}
            className={[
              'px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold transition-colors',
              photo.included
                ? 'bg-success/20 text-success'
                : 'bg-error/20 text-error',
            ].join(' ')}
          >
            {photo.included ? 'Included' : 'Excluded'}
          </button>
          {/* AI score */}
          <span className="px-1.5 py-0.5 bg-black/50 rounded text-[9px] font-mono text-white/70">
            {photo.aiScore}%
          </span>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-[8px] font-mono text-white/60 truncate flex-1">{photo.filename}</p>
          {/* Set as cover */}
          <button
            onClick={(e) => { e.stopPropagation(); onSetCover(photo.id) }}
            onPointerDown={(e) => e.stopPropagation()}
            className={[
              'ml-1 p-1 rounded transition-colors',
              photo.isCover
                ? 'text-warning bg-warning/20'
                : 'text-white/50 hover:text-warning bg-black/30',
            ].join(' ')}
            title="Set as cover photo"
          >
            <Star className={['w-3 h-3', photo.isCover ? 'fill-warning' : ''].join(' ')} />
          </button>
        </div>
      </div>

      {/* Cover badge */}
      {photo.isCover && (
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-warning/20 text-warning rounded text-[9px] font-sans font-semibold">
          Cover
        </div>
      )}

      {/* Excluded dim overlay */}
      {!photo.included && (
        <div className="absolute inset-0 bg-background/60 pointer-events-none" />
      )}
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-sans font-medium text-on-surface">{label}</p>
        {description && (
          <p className="text-xs font-sans text-on-surface-variant/50 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(toggle(enabled))}
        className={[
          'flex-shrink-0 w-11 h-6 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-surface-container-high',
        ].join(' ')}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={[
            'block w-4 h-4 rounded-full bg-white shadow transition-transform mx-1',
            enabled ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-5 space-y-4">
      <h3 className="text-sm font-sans font-semibold text-on-surface">{title}</h3>
      {children}
    </div>
  )
}

// ─── Curate Tab ───────────────────────────────────────────────────────────────

function CurateTab({
  photos,
  setPhotos,
}: {
  photos: GalleryPhoto[]
  setPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>
}) {
  const [threshold, setThreshold] = useState(72)
  const [isRunning, setIsRunning] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        setPhotos((prev) => {
          const oldIdx = prev.findIndex((p) => p.id === active.id)
          const newIdx = prev.findIndex((p) => p.id === over.id)
          return arrayMove(prev, oldIdx, newIdx)
        })
      }
    },
    [setPhotos],
  )

  const runAiCuration = () => {
    setIsRunning(true)
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((p) => ({ ...p, included: p.aiScore >= threshold })),
      )
      setIsRunning(false)
    }, 1800)
  }

  const includedCount = photos.filter((p) => p.included).length

  const toggleInclude = (id: string) =>
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, included: !p.included } : p)))

  const setCover = (id: string) =>
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === id })))

  return (
    <div className="space-y-5">
      {/* AI Curation Panel */}
      <SectionCard title="AI Curation">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-on-surface-variant/60">
                Confidence threshold
              </span>
              <span className="font-mono text-xs text-primary font-semibold">{threshold}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/30">
              <span>50% — permissive</span>
              <span>95% — strict</span>
            </div>
          </div>

          <button
            onClick={runAiCuration}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-sans font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-wait flex-shrink-0"
          >
            <Sparkles className={['w-4 h-4', isRunning ? 'animate-pulse' : ''].join(' ')} />
            {isRunning ? 'Curating…' : 'Let AI pick the best 50 photos'}
          </button>
        </div>
      </SectionCard>

      {/* Photo Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-semibold text-on-surface">Photo Grid</h3>
            <span className="font-mono text-xs text-on-surface-variant/40">
              {includedCount}/{photos.length} included
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPhotos((prev) => prev.map((p) => ({ ...p, included: true })))}
              className="text-xs font-sans text-on-surface-variant/50 hover:text-primary transition-colors"
            >
              Include all
            </button>
            <span className="text-on-surface-variant/20">·</span>
            <button
              onClick={() => setPhotos((prev) => prev.map((p) => ({ ...p, included: false })))}
              className="text-xs font-sans text-on-surface-variant/50 hover:text-error transition-colors"
            >
              Exclude all
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {photos.map((photo) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  onToggleInclude={toggleInclude}
                  onSetCover={setCover}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <p className="text-xs font-sans text-on-surface-variant/40 mt-3">
          Drag photos to reorder · Hover to include/exclude · ★ to set cover
        </p>
      </div>
    </div>
  )
}

// ─── Present Tab ──────────────────────────────────────────────────────────────

const GALLERY_THEMES: Array<{
  id: GalleryTheme
  label: string
  description: string
  hues: [number, number]
}> = [
  { id: 'minimal', label: 'Minimal', description: 'Clean white space, generous padding', hues: [0, 0] },
  { id: 'editorial', label: 'Editorial', description: 'Bold typography, magazine feel', hues: [220, 250] },
  { id: 'classic', label: 'Classic', description: 'Warm tones, traditional layout', hues: [30, 45] },
  { id: 'film', label: 'Film', description: 'Moody grain, desaturated palette', hues: [200, 215] },
]

function PresentTab() {
  const [selectedTheme, setSelectedTheme] = useState<GalleryTheme>('minimal')
  const [slideshowEnabled, setSlideshowEnabled] = useState(false)
  const [transition, setTransition] = useState<TransitionStyle>('fade')
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right')
  const [watermarkOpacity, setWatermarkOpacity] = useState(35)
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text')
  const [watermarkText, setWatermarkText] = useState('© View1 Photography')
  const [printStoreEnabled, setPrintStoreEnabled] = useState(false)
  const [productPrices, setProductPrices] = useState<Record<string, string>>(
    Object.fromEntries(PRINT_PRODUCTS.map((p) => [p.id, p.defaultPrice])),
  )

  const POSITIONS: WatermarkPosition[] = [
    'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center',
  ]

  return (
    <div className="space-y-5">
      {/* Theme Selector */}
      <SectionCard title="Gallery Theme">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GALLERY_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={[
                'relative rounded-xl overflow-hidden border-2 transition-all text-left',
                selectedTheme === theme.id
                  ? 'border-primary shadow-glow-primary'
                  : 'border-outline-variant/15 hover:border-outline-variant/40',
              ].join(' ')}
            >
              {/* Visual preview */}
              <div
                className="w-full h-20"
                style={{
                  background:
                    theme.id === 'minimal'
                      ? 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)'
                      : theme.id === 'editorial'
                        ? `linear-gradient(135deg, hsl(${theme.hues[0]},25%,12%) 0%, hsl(${theme.hues[1]},30%,20%) 100%)`
                        : theme.id === 'classic'
                          ? `linear-gradient(135deg, hsl(${theme.hues[0]},25%,22%) 0%, hsl(${theme.hues[1]},30%,30%) 100%)`
                          : `linear-gradient(135deg, hsl(${theme.hues[0]},10%,14%) 0%, hsl(${theme.hues[1]},12%,20%) 100%)`,
                }}
              >
                {/* Fake layout lines */}
                <div className="absolute inset-3 flex flex-col gap-1 opacity-30">
                  <div className="h-1 w-3/4 bg-current rounded-full" style={{ color: theme.id === 'minimal' ? '#333' : '#fff' }} />
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex-1 h-6 rounded" style={{ background: theme.id === 'minimal' ? '#ccc' : 'rgba(255,255,255,0.2)' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-2 bg-surface-container">
                <p className="text-xs font-sans font-semibold text-on-surface">{theme.label}</p>
                <p className="text-[10px] font-sans text-on-surface-variant/50 mt-0.5 leading-tight">{theme.description}</p>
              </div>
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Slideshow */}
      <SectionCard title="Slideshow">
        <ToggleSwitch
          enabled={slideshowEnabled}
          onChange={setSlideshowEnabled}
          label="Enable slideshow mode"
          description="Clients can view gallery as auto-advancing slides"
        />
        {slideshowEnabled && (
          <div className="pt-2">
            <label className="text-xs font-sans text-on-surface-variant/60 mb-1.5 block">
              Transition style
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['fade', 'slide', 'zoom', 'none'] as TransitionStyle[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTransition(t)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-sans font-medium capitalize transition-colors',
                    transition === t
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Watermark */}
      <SectionCard title="Watermark">
        <ToggleSwitch
          enabled={watermarkEnabled}
          onChange={setWatermarkEnabled}
          label="Apply watermark"
          description="Protects photos until client completes payment"
        />
        {watermarkEnabled && (
          <div className="space-y-4 pt-2">
            {/* Type toggle */}
            <div className="flex gap-2">
              {(['text', 'logo'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setWatermarkType(t)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-sans font-medium capitalize transition-colors',
                    watermarkType === t
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
                  ].join(' ')}
                >
                  {t === 'text' ? 'Text' : 'Logo upload'}
                </button>
              ))}
            </div>

            {watermarkType === 'text' ? (
              <input
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-sans text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="© Your Studio Name"
              />
            ) : (
              <label className="flex items-center gap-3 px-4 py-3 bg-surface-container-high border border-dashed border-outline-variant/30 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
                <Upload className="w-4 h-4 text-on-surface-variant/50" />
                <span className="text-sm font-sans text-on-surface-variant/60">Upload logo (PNG, SVG)</span>
                <input type="file" accept="image/png,image/svg+xml" className="sr-only" />
              </label>
            )}

            {/* Position */}
            <div>
              <label className="text-xs font-sans text-on-surface-variant/60 mb-2 block">Position</label>
              <div className="inline-grid grid-cols-3 gap-1.5 p-2 bg-surface-container-high rounded-xl">
                {(['top-left', 'top-right', null, 'bottom-left', 'bottom-right', 'center'] as (WatermarkPosition | null)[]).map((pos, i) =>
                  pos === null ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={pos}
                      onClick={() => setWatermarkPosition(pos)}
                      title={pos.replace('-', ' ')}
                      className={[
                        'w-8 h-8 rounded-lg transition-colors',
                        watermarkPosition === pos
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant/50 hover:text-on-surface',
                      ].join(' ')}
                    >
                      <span className="text-[8px] font-mono">{pos.split('-').map((s) => s[0].toUpperCase()).join('')}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-sans text-on-surface-variant/60">Opacity</label>
                <span className="font-mono text-xs text-primary">{watermarkOpacity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
              />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Print Store */}
      <SectionCard title="Print Store">
        <ToggleSwitch
          enabled={printStoreEnabled}
          onChange={setPrintStoreEnabled}
          label="Enable print store"
          description="Clients can order prints directly from their gallery"
        />
        {printStoreEnabled && (
          <div className="pt-2 space-y-2">
            {PRINT_PRODUCTS.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-3 py-2 bg-surface-container-high rounded-xl">
                <ImageIcon className="w-4 h-4 text-on-surface-variant/40 flex-shrink-0" />
                <span className="flex-1 text-sm font-sans text-on-surface">{product.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-sans text-on-surface-variant/40">$</span>
                  <input
                    type="number"
                    min={0}
                    value={productPrices[product.id]}
                    onChange={(e) =>
                      setProductPrices((prev) => ({ ...prev, [product.id]: e.target.value }))
                    }
                    className="w-16 px-2 py-1 bg-surface-container border border-outline-variant/20 rounded-lg text-sm font-mono text-on-surface text-right focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Deliver Tab ──────────────────────────────────────────────────────────────

const MOCK_GALLERY_URL = 'https://view1.app/g/johnson-wedding-2026'

function DeliverTab() {
  const [copied, setCopied] = useState(false)
  const [accessMode, setAccessMode] = useState<AccessMode>('password')
  const [password, setPassword] = useState('Spring2026!')
  const [expiryDate, setExpiryDate] = useState('2026-06-30')
  const [fullResDownload, setFullResDownload] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('jpeg')
  const [sizeLimit, setSizeLimit] = useState(50)
  const [emailSent, setEmailSent] = useState(false)
  const [emailAddress, setEmailAddress] = useState('sarah.johnson@email.com')

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = () => {
    setEmailSent(true)
    setTimeout(() => setEmailSent(false), 3000)
  }

  return (
    <div className="space-y-5">
      {/* Gallery Link */}
      <SectionCard title="Gallery Link">
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-surface-container-high rounded-xl border border-outline-variant/15">
            <Link2 className="w-4 h-4 text-on-surface-variant/40 flex-shrink-0" />
            <span className="flex-1 text-sm font-mono text-on-surface/80 truncate">{MOCK_GALLERY_URL}</span>
            <button
              onClick={handleCopy}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors flex-shrink-0',
                copied
                  ? 'bg-success/20 text-success'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface',
              ].join(' ')}
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href="#"
              className="p-1.5 rounded-lg text-on-surface-variant/40 hover:text-on-surface transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* QR Code placeholder */}
          <div className="flex items-center gap-4 p-3 bg-surface-container-high rounded-xl border border-outline-variant/15">
            <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="w-8 h-8 text-on-surface-variant/30" />
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-on-surface">QR Code</p>
              <p className="text-xs font-sans text-on-surface-variant/50 mt-0.5">
                Scan to open gallery on any device
              </p>
              <button className="mt-2 flex items-center gap-1.5 text-xs font-sans text-primary hover:text-primary/80 transition-colors">
                <Download className="w-3 h-3" />
                Download QR PNG
              </button>
            </div>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-sans text-on-surface-variant/60 flex-shrink-0 w-24">
              Link expires
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </SectionCard>

      {/* Access Controls */}
      <SectionCard title="Access Controls">
        <div className="grid grid-cols-3 gap-2">
          {([
            { mode: 'public' as AccessMode, label: 'Public', icon: Globe, desc: 'Anyone with the link' },
            { mode: 'password' as AccessMode, label: 'Password', icon: Lock, desc: 'Requires a password' },
            { mode: 'email' as AccessMode, label: 'Email only', icon: Mail, desc: 'Invited clients only' },
          ] as const).map(({ mode, label, icon: Icon, desc }) => (
            <button
              key={mode}
              onClick={() => setAccessMode(mode)}
              className={[
                'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center',
                accessMode === mode
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-outline-variant/15 bg-surface-container-high text-on-surface-variant hover:border-outline-variant/35',
              ].join(' ')}
            >
              <Icon className="w-5 h-5" />
              <div>
                <p className="text-xs font-sans font-semibold">{label}</p>
                <p className="text-[10px] font-sans opacity-60 mt-0.5 leading-tight">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {accessMode === 'password' && (
          <div className="flex items-center gap-2 mt-2">
            <KeyRound className="w-4 h-4 text-on-surface-variant/40 flex-shrink-0" />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Gallery password"
            />
          </div>
        )}
      </SectionCard>

      {/* Client Notification */}
      <SectionCard title="Client Notification">
        {/* Email template preview */}
        <div className="rounded-xl border border-outline-variant/15 overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-container-high border-b border-outline-variant/10 flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-on-surface">Email Preview</span>
            <button className="text-xs font-sans text-on-surface-variant/50 hover:text-primary transition-colors flex items-center gap-1">
              <Settings2 className="w-3 h-3" />
              Edit template
            </button>
          </div>
          <div className="p-4 bg-surface-container space-y-2">
            <p className="text-xs font-sans text-on-surface-variant/50">
              <span className="font-semibold text-on-surface-variant/70">Subject:</span> Your gallery is ready — Johnson Wedding
            </p>
            <div className="text-xs font-sans text-on-surface-variant/60 leading-relaxed space-y-1.5">
              <p>Hi Sarah,</p>
              <p>
                Your wedding gallery is ready for viewing! Browse your photos at the link below.
              </p>
              <p className="font-mono text-primary/80 text-[11px] truncate">{MOCK_GALLERY_URL}</p>
              <p className="text-on-surface-variant/40">
                Password: <span className="font-mono">Spring2026!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Send form */}
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-on-surface-variant/40 flex-shrink-0" />
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="flex-1 px-3 py-2 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="client@email.com"
          />
          <button
            onClick={handleSendEmail}
            disabled={emailSent}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-colors flex-shrink-0',
              emailSent
                ? 'bg-success/20 text-success cursor-default'
                : 'bg-primary text-on-primary hover:bg-primary/90',
            ].join(' ')}
          >
            <Send className="w-4 h-4" />
            {emailSent ? 'Sent!' : 'Send to client'}
          </button>
        </div>
      </SectionCard>

      {/* Download Settings */}
      <SectionCard title="Download Settings">
        <ToggleSwitch
          enabled={fullResDownload}
          onChange={setFullResDownload}
          label="Allow full-resolution downloads"
          description="Clients can download original resolution files"
        />

        <div className="space-y-3 pt-1">
          {/* File format */}
          <div>
            <label className="text-xs font-sans text-on-surface-variant/60 mb-2 block">File format</label>
            <div className="flex gap-2">
              {([
                { value: 'jpeg', label: 'JPEG' },
                { value: 'raw', label: 'RAW' },
                { value: 'both', label: 'Both' },
              ] as const).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setDownloadFormat(f.value)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors',
                    downloadFormat === f.value
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sans text-on-surface-variant/60">Max download size</label>
              <span className="font-mono text-xs text-primary">
                {sizeLimit === 0 ? 'Unlimited' : `${sizeLimit} MB`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={10}
              value={sizeLimit}
              onChange={(e) => setSizeLimit(Number(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/30 mt-1">
              <span>Unlimited</span>
              <span>200 MB</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'curate', label: 'Curate' },
  { id: 'present', label: 'Present' },
  { id: 'deliver', label: 'Deliver' },
]

export default function GalleryBuilderPage() {
  const [selectedProject, setSelectedProject] = useState<MockProject>(MOCK_PROJECTS[0])
  const [activeTab, setActiveTab] = useState<TabId>('curate')
  const [photos, setPhotos] = useState<GalleryPhoto[]>(MOCK_PHOTOS)

  const includedCount = photos.filter((p) => p.included).length

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ProjectSelector selected={selectedProject} onSelect={setSelectedProject} />
          <div className="h-5 w-px bg-outline-variant/20" />
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-on-surface-variant/40">
              {includedCount} selected
            </span>
            <span className="text-on-surface-variant/20">·</span>
            <span className="font-mono text-xs text-on-surface-variant/40">
              {photos.length} total
            </span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-sans font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Gallery
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-5 py-2 rounded-lg text-sm font-sans font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-elev-1'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'curate' && (
          <CurateTab photos={photos} setPhotos={setPhotos} />
        )}
        {activeTab === 'present' && <PresentTab />}
        {activeTab === 'deliver' && <DeliverTab />}
      </div>
    </div>
  )
}
