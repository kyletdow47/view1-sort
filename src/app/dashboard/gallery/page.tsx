'use client'

import Link from 'next/link'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Download,
  Eye,
  MoreVertical,
  Image as ImageIcon,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
  { label: 'All', count: 428 },
  { label: 'Ceremony', count: 86 },
  { label: 'Portraits', count: 112 },
  { label: 'Reception', count: 52 },
  { label: 'Getting Ready', count: 68 },
  { label: 'Details', count: 45 },
  { label: 'Behind the Scenes', count: 65 },
]

const MOCK_PHOTOS = Array.from({ length: 24 }, (_, i) => ({
  id: `photo-${i}`,
  name: `DSC_${String(1000 + i * 47).padStart(4, '0')}.ARW`,
  category: CATEGORIES[1 + (i % 6)].label,
  starred: i % 5 === 0,
  edited: i % 3 === 0,
  hue: [25, 180, 340, 50, 210, 290, 130, 10, 260, 160][i % 10],
  exif: `ISO ${[100, 200, 400, 800, 1600][i % 5]} • ${[24, 35, 50, 85, 135][i % 5]}mm • f/${[1.4, 1.8, 2.8, 4.0, 5.6][i % 5]}`,
}))

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filtered = activeCategory === 'All'
    ? MOCK_PHOTOS
    : MOCK_PHOTOS.filter((p) => p.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-1">
            Gallery
          </h1>
          <p className="text-sm text-on-surface-variant">
            428 photos sorted across 6 categories &middot; Johnson Wedding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search photos..."
              className="bg-[#100e0d] border-none rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface placeholder-[#534439] focus:ring-1 focus:ring-[#ffb780]/20 w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg text-sm text-on-surface-variant hover:bg-surface-highest transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <div className="flex bg-[#100e0d] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-container text-primary' : 'text-on-surface-variant'}`}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-container text-primary' : 'text-on-surface-variant'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.label
                ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-highest'
            }`}
          >
            {cat.label}
            <span className={`text-xs ${activeCategory === cat.label ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 py-3 border-y border-outline-variant/20">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-on-surface-variant" />
          <span className="text-xs text-on-surface-variant">127 gallery views</span>
        </div>
        <div className="flex items-center gap-2">
          <Download size={14} className="text-on-surface-variant" />
          <span className="text-xs text-on-surface-variant">34 downloads</span>
        </div>
        <div className="flex items-center gap-2">
          <Star size={14} className="text-on-surface-variant" />
          <span className="text-xs text-on-surface-variant">18 starred by client</span>
        </div>
        <div className="ml-auto">
          <Link
            href="/gallery/demo-1"
            className="text-xs font-medium text-primary hover:underline"
          >
            Open Client Gallery View →
          </Link>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((photo) => (
          <Link
            key={photo.id}
            href={`/dashboard/project/demo-1`}
            className="group relative flex flex-col"
          >
            <div
              className="aspect-[3/4] rounded-xl overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, hsl(${photo.hue}, 28%, 20%) 0%, hsl(${photo.hue + 20}, 22%, 14%) 100%)`,
              }}
            >
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                {photo.edited ? (
                  <span className="bg-[#0c5252]/80 backdrop-blur-sm text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Edited
                  </span>
                ) : (
                  <span className="bg-surface-highest/80 backdrop-blur-sm text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Raw
                  </span>
                )}
              </div>
              {/* Star */}
              {photo.starred && (
                <div className="absolute top-3 right-3">
                  <Star size={14} className="text-primary" fill="#ffb780" />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Centered image icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={24} className="text-white/10" />
              </div>
            </div>
            <div className="mt-2 px-0.5">
              <p className="font-label text-xs text-on-surface truncate">{photo.name}</p>
              <p className="font-label text-[10px] text-on-surface-variant">{photo.exif}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
