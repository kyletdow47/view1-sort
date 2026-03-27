'use client'

import { use, useState } from 'react'
import {
  Grid3X3,
  Film,
  SlidersHorizontal,
  ChevronRight,
  CheckSquare,
  ArrowRightLeft,
  Star,
  Download,
  Trash2,
  ChevronDown,
  Cloud,
} from 'lucide-react'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

interface CategoryData {
  name: string
  count: number
  photos: Array<{ id: number; hue: number; saturation: number; lightness: number; width: number; height: number }>
}

const MOCK_CATEGORIES: CategoryData[] = [
  {
    name: 'Ceremony',
    count: 84,
    photos: [
      { id: 1, hue: 25, saturation: 45, lightness: 28, width: 2, height: 2 },
      { id: 2, hue: 35, saturation: 38, lightness: 22, width: 1, height: 1 },
      { id: 3, hue: 18, saturation: 50, lightness: 25, width: 1, height: 1 },
      { id: 4, hue: 30, saturation: 42, lightness: 20, width: 1, height: 1 },
      { id: 5, hue: 22, saturation: 35, lightness: 30, width: 1, height: 1 },
    ],
  },
  {
    name: 'Portraits',
    count: 112,
    photos: [
      { id: 6, hue: 15, saturation: 48, lightness: 26, width: 1, height: 1 },
      { id: 7, hue: 40, saturation: 40, lightness: 24, width: 1, height: 1 },
      { id: 8, hue: 28, saturation: 52, lightness: 22, width: 1, height: 1 },
    ],
  },
  {
    name: 'Reception',
    count: 52,
    photos: [
      { id: 9, hue: 10, saturation: 55, lightness: 20, width: 1, height: 1 },
      { id: 10, hue: 45, saturation: 35, lightness: 28, width: 1, height: 1 },
      { id: 11, hue: 20, saturation: 44, lightness: 25, width: 1, height: 1 },
    ],
  },
]

function PhotoCard({
  hue,
  saturation,
  lightness,
  className = '',
}: {
  hue: number
  saturation: number
  lightness: number
  className?: string
}) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden group cursor-pointer ${className}`}
      style={{ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` }}
    >
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
      {/* Subtle gradient for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, ${saturation + 5}%, ${lightness + 8}%) 0%, hsl(${hue + 10}, ${saturation}%, ${lightness - 4}%) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
    </div>
  )
}

function CeremonyGrid({ photos }: { photos: CategoryData['photos'] }) {
  return (
    <div className="space-y-3">
      {/* Main masonry: 1 large left (2/3), 2 stacked right (1/3) */}
      <div className="grid grid-cols-3 gap-3" style={{ height: '380px' }}>
        <div className="col-span-2">
          <PhotoCard
            hue={photos[0].hue}
            saturation={photos[0].saturation}
            lightness={photos[0].lightness}
            className="w-full h-full"
          />
        </div>
        <div className="col-span-1 flex flex-col gap-3">
          <PhotoCard
            hue={photos[1].hue}
            saturation={photos[1].saturation}
            lightness={photos[1].lightness}
            className="w-full flex-1"
          />
          <PhotoCard
            hue={photos[2].hue}
            saturation={photos[2].saturation}
            lightness={photos[2].lightness}
            className="w-full flex-1"
          />
        </div>
      </div>
    </div>
  )
}

function EqualGrid({ photos }: { photos: CategoryData['photos'] }) {
  return (
    <div className="grid grid-cols-3 gap-3" style={{ height: '240px' }}>
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          hue={photo.hue}
          saturation={photo.saturation}
          lightness={photo.lightness}
          className="w-full h-full"
        />
      ))}
    </div>
  )
}

function CloudBackupCard() {
  return (
    <div className="rounded-lg p-4 mt-3" style={{ backgroundColor: '#161619' }}>
      <div className="flex items-center gap-2 mb-2">
        <Cloud size={16} style={{ color: '#6b7280' }} />
        <span className="text-sm font-medium text-white">Cloud Backup</span>
      </div>
      <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: '#2a2a35' }}>
        <div
          className="h-2 rounded-full"
          style={{ width: '82%', backgroundColor: '#D4915C' }}
        />
      </div>
      <p className="text-xs" style={{ color: '#6b7280' }}>
        Syncing high-res RAW files... 82%
      </p>
    </div>
  )
}

function CategorySection({ category, index }: { category: CategoryData; index: number }) {
  return (
    <div className="mb-10">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <h3 className="text-xl font-semibold text-white">{category.name}</h3>
          <span className="text-sm" style={{ color: '#6b7280' }}>
            {category.count} Photos
          </span>
        </div>
        <button
          className="text-sm font-medium hover:underline"
          style={{ color: '#D4915C' }}
        >
          Expand Collection
        </button>
      </div>

      {/* Photo Grid */}
      {index === 0 ? (
        <>
          <CeremonyGrid photos={category.photos} />
          <CloudBackupCard />
        </>
      ) : (
        <EqualGrid photos={category.photos} />
      )}
    </div>
  )
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params)
  const [viewMode, setViewMode] = useState<'grid' | 'filmstrip'>('grid')
  const [selectedCount] = useState(32)

  const projectName =
    id === 'demo-1'
      ? 'Johnson Wedding'
      : id === 'demo-2'
        ? '123 Oak Street Listing'
        : id === 'demo-3'
          ? 'Portugal Travel Series'
          : id === 'demo-4'
            ? 'Corporate Headshots'
            : 'Project'

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]" style={{ backgroundColor: '#0C0C0E' }}>
      {/* ─── Project Header ─── */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #2a2a35' }}>
        <div className="flex items-start justify-between">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: '#D4915C' }}
              >
                Projects
              </span>
              <ChevronRight size={12} style={{ color: '#D4915C' }} />
              <span
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: '#D4915C' }}
              >
                {projectName}
              </span>
            </div>

            {/* Project Title */}
            <h1 className="font-serif italic text-4xl text-white mb-2">
              {projectName}
            </h1>

            {/* Status line */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Sorted
              </span>
              <span className="text-sm" style={{ color: '#6b7280' }}>
                248 Selected Items &bull; September 14, 2023
              </span>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 mt-2">
            {/* Grid / Filmstrip toggle */}
            <div
              className="flex items-center rounded-lg p-0.5"
              style={{ backgroundColor: '#161619' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('filmstrip')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'filmstrip'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Film size={16} />
              </button>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: '#6b7280' }}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Selection Toolbar ─── */}
      <div
        className="flex items-center justify-between px-6 py-2.5"
        style={{ borderBottom: '1px solid #2a2a35', backgroundColor: '#0C0C0E' }}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox + count */}
          <div className="flex items-center gap-2">
            <CheckSquare size={16} style={{ color: '#D4915C' }} />
            <span className="text-sm font-medium text-white">
              {selectedCount} Selected
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ backgroundColor: '#2a2a35' }} />

          {/* Action buttons */}
          <button className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
            <ArrowRightLeft size={14} />
            Move to...
          </button>
          <button className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
            <Star size={14} />
            Star
          </button>
          <button className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
            <Download size={14} />
            Export
          </button>
          <button className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md hover:bg-white/5 text-red-400/70 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Filters link */}
          <button
            className="text-xs font-semibold tracking-wider uppercase hover:underline"
            style={{ color: '#D4915C' }}
          >
            Filters
          </button>

          {/* Orientation dropdown */}
          <button
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors hover:border-gray-500"
            style={{ color: '#6b7280', borderColor: '#2a2a35' }}
          >
            All Orientations
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* ─── Content: Category Sections ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {MOCK_CATEGORIES.map((category, index) => (
          <CategorySection key={category.name} category={category} index={index} />
        ))}
      </div>
    </div>
  )
}
