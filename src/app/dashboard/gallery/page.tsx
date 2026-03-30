'use client'

import React, { useState, useRef } from 'react'
import {
  Search,
  Sparkles,
  Eye,
  EyeOff,
  Edit3,
  ChevronRight,
  ChevronDown,
  GripVertical,
  MoreHorizontal,
  Merge,
  Download,
  Share2,
  Check,
  X,
  ImageIcon,
  Star,
  Layers,
} from 'lucide-react'

/* ─── Mock data ──────────────────────────────────────────────────────────── */

interface Photo {
  id: string
  name: string
  category: string
  starred: boolean
  hue: number
  exif: string
}

const SEED_CATEGORIES = [
  { name: 'Getting Ready', count: 68 },
  { name: 'Ceremony', count: 86 },
  { name: 'First Look', count: 24 },
  { name: 'Portraits', count: 112 },
  { name: 'Family Formals', count: 45 },
  { name: 'Reception', count: 93 },
]

const MOCK_PHOTOS: Photo[] = Array.from({ length: 180 }, (_, i) => {
  const cat = SEED_CATEGORIES[i % SEED_CATEGORIES.length]
  return {
    id: `photo-${i}`,
    name: `DSC_${String(1000 + i * 47).padStart(4, '0')}.ARW`,
    category: cat.name,
    starred: i % 7 === 0,
    hue: [25, 180, 340, 50, 210, 290, 130, 10, 260, 160][i % 10],
    exif: `ISO ${[100, 200, 400, 800][i % 4]} • ${[24, 35, 50, 85][i % 4]}mm • f/${[1.8, 2.8, 4.0][i % 3]}`,
  }
})

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Category {
  name: string
  hidden: boolean // hidden from client view
  expanded: boolean
}

/* ─── Fake thumbnail ─────────────────────────────────────────────────────── */

function PhotoThumb({
  photo,
  size = 'sm',
  selected,
  onToggle,
}: {
  photo: Photo
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  onToggle?: () => void
}) {
  const dim = size === 'sm' ? 'w-24 h-24' : size === 'md' ? 'w-32 h-32' : 'w-40 h-40'

  return (
    <div
      onClick={onToggle}
      className={[
        `${dim} rounded-xl overflow-hidden flex-shrink-0 relative group cursor-pointer transition-all`,
        selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : '',
      ].join(' ')}
    >
      {/* Coloured placeholder as thumbnail */}
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, hsl(${photo.hue},40%,18%) 0%, hsl(${photo.hue},55%,28%) 100%)`,
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
        <p className="text-[8px] font-mono text-white/70 truncate">{photo.name}</p>
      </div>

      {/* Selected check */}
      {selected && (
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-on-primary" />
        </div>
      )}

      {/* Star */}
      {photo.starred && (
        <div className="absolute top-1.5 right-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </div>
      )}
    </div>
  )
}

/* ─── Category row (Netflix filmstrip) ──────────────────────────────────── */

function CategoryRow({
  category,
  photos,
  onToggleExpand,
  onToggleHide,
  onRename,
  onMerge,
  dragHandleProps,
}: {
  category: Category
  photos: Photo[]
  onToggleExpand: () => void
  onToggleHide: () => void
  onRename: (name: string) => void
  onMerge: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}) {
  const [renaming, setRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(category.name)
  const [showMenu, setShowMenu] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const commitRename = () => {
    if (renameVal.trim()) onRename(renameVal.trim())
    setRenaming(false)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className={['rounded-2xl overflow-hidden border border-outline-variant/10 transition-all', category.hidden ? 'opacity-50' : ''].join(' ')}>
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-container hover:bg-surface-container-high transition-colors group/header">
        {/* Drag handle */}
        <div {...dragHandleProps} className="cursor-grab text-on-surface-variant/20 hover:text-on-surface-variant/60 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Name / rename */}
        {renaming ? (
          <input
            ref={inputRef}
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
            autoFocus
            className="bg-transparent text-lg font-headline font-bold text-on-surface focus:outline-none border-b-2 border-primary/50 w-48"
          />
        ) : (
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <h3 className="text-lg font-headline font-bold text-on-surface hover:text-primary transition-colors">
              {category.name}
            </h3>
            <span className="text-xs font-mono text-on-surface-variant/40">{photos.length}</span>
            {category.expanded
              ? <ChevronDown className="w-4 h-4 text-on-surface-variant/40" />
              : <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
          {selected.size > 0 && (
            <span className="text-xs font-mono text-primary mr-2">{selected.size} selected</span>
          )}
          <button
            onClick={() => { setRenaming(true); setShowMenu(false) }}
            className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors text-on-surface-variant/50 hover:text-on-surface"
            title="Rename"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleHide}
            className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors text-on-surface-variant/50 hover:text-on-surface"
            title={category.hidden ? 'Show to client' : 'Hide from client'}
          >
            {category.hidden
              ? <EyeOff className="w-3.5 h-3.5" />
              : <Eye className="w-3.5 h-3.5" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors text-on-surface-variant/50 hover:text-on-surface"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-surface-container border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden w-44">
                {[
                  { label: 'Merge into…', icon: Merge, action: () => { onMerge(); setShowMenu(false) } },
                  { label: 'Download all', icon: Download, action: () => setShowMenu(false) },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-mono text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-on-surface-variant/60" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filmstrip (collapsed) */}
      {!category.expanded && (
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-thin">
          {photos.slice(0, 20).map((p) => (
            <PhotoThumb
              key={p.id}
              photo={p}
              size="sm"
              selected={selected.has(p.id)}
              onToggle={() => toggleSelect(p.id)}
            />
          ))}
          {photos.length > 20 && (
            <button
              onClick={onToggleExpand}
              className="w-24 h-24 rounded-xl flex-shrink-0 bg-surface-container-high flex flex-col items-center justify-center gap-1 text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="text-lg font-mono font-bold">+{photos.length - 20}</span>
              <span className="text-[9px] font-mono uppercase tracking-widest">more</span>
            </button>
          )}
        </div>
      )}

      {/* Expanded full grid (Finder style) */}
      {category.expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {photos.map((p) => (
              <PhotoThumb
                key={p.id}
                photo={p}
                size="sm"
                selected={selected.has(p.id)}
                onToggle={() => toggleSelect(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function GalleryPage() {
  const [categories, setCategories] = useState<Category[]>(
    SEED_CATEGORIES.map((c) => ({ name: c.name, hidden: false, expanded: false }))
  )
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | 'hidden'>('all')
  const [deliveryStage, setDeliveryStage] = useState<1 | 2 | 3>(1)

  const photosByCategory = (catName: string) => {
    let photos = MOCK_PHOTOS.filter((p) => p.category === catName)
    if (search) photos = photos.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    if (activeFilter === 'starred') photos = photos.filter((p) => p.starred)
    return photos
  }

  const totalPhotos = MOCK_PHOTOS.length
  const visibleCats = categories.filter((c) => {
    if (activeFilter === 'hidden') return c.hidden
    return true
  })

  const toggleExpand = (name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === name ? { ...c, expanded: !c.expanded } : c))
    )
  }

  const toggleHide = (name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === name ? { ...c, hidden: !c.hidden } : c))
    )
  }

  const renameCategory = (name: string, newName: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === name ? { ...c, name: newName } : c))
    )
  }

  const expandAll = () => setCategories((prev) => prev.map((c) => ({ ...c, expanded: true })))
  const collapseAll = () => setCategories((prev) => prev.map((c) => ({ ...c, expanded: false })))

  const STAGE_LABELS: Record<number, { label: string; color: string; description: string }> = {
    1: { label: 'Preselection', color: 'text-amber-400 bg-amber-400/10', description: 'Client can preview — downloads locked' },
    2: { label: 'Client Selection', color: 'text-sky-400 bg-sky-400/10', description: 'Client is favoriting photos' },
    3: { label: 'Finals Ready', color: 'text-emerald-400 bg-emerald-400/10', description: 'Edited files delivered — downloads open' },
  }
  const stage = STAGE_LABELS[deliveryStage]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic">
            Johnson Wedding
          </h1>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            {totalPhotos} photos · {categories.length} categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors">
            <Share2 className="w-4 h-4" />
            Share gallery
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-on-primary text-sm font-headline font-bold hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Export ZIP
          </button>
        </div>
      </div>

      {/* Delivery stage banner */}
      <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/10">
        <div className="flex items-center gap-3 flex-1">
          <Layers className="w-5 h-5 text-on-surface-variant/50" />
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Delivery stage</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest ${stage.color}`}>
                {stage.label}
              </span>
              <span className="text-xs text-on-surface-variant/50">{stage.description}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              onClick={() => setDeliveryStage(s)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all',
                deliveryStage === s
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
              ].join(' ')}
            >
              Stage {s}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search photos…"
            className="w-full pl-9 pr-4 py-2 bg-surface-container border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5">
          {([
            { id: 'all', label: 'All' },
            { id: 'starred', label: '★ Starred' },
            { id: 'hidden', label: 'Hidden' },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all',
                activeFilter === f.id
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Expand / Collapse all */}
        <button
          onClick={expandAll}
          className="text-xs font-mono text-on-surface-variant/50 hover:text-on-surface transition-colors"
        >
          Expand all
        </button>
        <span className="text-on-surface-variant/20">·</span>
        <button
          onClick={collapseAll}
          className="text-xs font-mono text-on-surface-variant/50 hover:text-on-surface transition-colors"
        >
          Collapse all
        </button>
      </div>

      {/* Category rows */}
      <div className="space-y-3">
        {visibleCats.map((cat) => (
          <CategoryRow
            key={cat.name}
            category={cat}
            photos={photosByCategory(cat.name)}
            onToggleExpand={() => toggleExpand(cat.name)}
            onToggleHide={() => toggleHide(cat.name)}
            onRename={(newName) => renameCategory(cat.name, newName)}
            onMerge={() => {}} // TODO: merge dialog
          />
        ))}
      </div>

      {visibleCats.length === 0 && (
        <div className="py-20 text-center">
          <ImageIcon className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
          <p className="text-on-surface-variant/50 font-mono text-sm">No categories match your filter.</p>
        </div>
      )}
    </div>
  )
}
