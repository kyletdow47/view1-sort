'use client'

import { use, useState } from 'react'
import {
  ArrowRightLeft,
  Star,
  Download,
  Trash2,
  X,
  Check,
} from 'lucide-react'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

interface PhotoFile {
  id: number
  filename: string
  iso: string
  focal: string
  aperture: string
  type: 'EDITED' | 'RAW'
  selected: boolean
  starred: boolean
  hue: number
  sat: number
  light: number
}

const MOCK_PHOTOS: PhotoFile[] = [
  { id: 1, filename: 'DSC_0842.ARW', iso: '100', focal: '85mm', aperture: 'f/1.4', type: 'EDITED', selected: false, starred: true, hue: 25, sat: 55, light: 32 },
  { id: 2, filename: 'DSC_0843.ARW', iso: '200', focal: '35mm', aperture: 'f/2.0', type: 'RAW', selected: false, starred: false, hue: 18, sat: 48, light: 28 },
  { id: 3, filename: 'DSC_0844.ARW', iso: '400', focal: '50mm', aperture: 'f/1.8', type: 'EDITED', selected: true, starred: false, hue: 30, sat: 60, light: 30 },
  { id: 4, filename: 'DSC_0845.ARW', iso: '100', focal: '85mm', aperture: 'f/1.4', type: 'RAW', selected: true, starred: true, hue: 22, sat: 50, light: 25 },
  { id: 5, filename: 'DSC_0846.ARW', iso: '800', focal: '24mm', aperture: 'f/2.8', type: 'EDITED', selected: false, starred: false, hue: 35, sat: 45, light: 34 },
  { id: 6, filename: 'DSC_0847.ARW', iso: '100', focal: '70mm', aperture: 'f/2.0', type: 'RAW', selected: true, starred: false, hue: 15, sat: 52, light: 27 },
  { id: 7, filename: 'DSC_0848.ARW', iso: '200', focal: '85mm', aperture: 'f/1.4', type: 'EDITED', selected: true, starred: true, hue: 28, sat: 58, light: 31 },
  { id: 8, filename: 'DSC_0849.ARW', iso: '400', focal: '50mm', aperture: 'f/1.8', type: 'RAW', selected: false, starred: false, hue: 20, sat: 42, light: 26 },
  { id: 9, filename: 'DSC_0850.ARW', iso: '100', focal: '35mm', aperture: 'f/1.4', type: 'EDITED', selected: true, starred: false, hue: 32, sat: 50, light: 29 },
  { id: 10, filename: 'DSC_0851.ARW', iso: '200', focal: '85mm', aperture: 'f/2.0', type: 'RAW', selected: true, starred: true, hue: 24, sat: 55, light: 33 },
  { id: 11, filename: 'DSC_0852.ARW', iso: '100', focal: '50mm', aperture: 'f/1.4', type: 'EDITED', selected: true, starred: false, hue: 19, sat: 48, light: 28 },
  { id: 12, filename: 'DSC_0853.ARW', iso: '800', focal: '24mm', aperture: 'f/2.8', type: 'RAW', selected: false, starred: false, hue: 27, sat: 44, light: 30 },
  { id: 13, filename: 'DSC_0854.ARW', iso: '200', focal: '70mm', aperture: 'f/1.8', type: 'EDITED', selected: true, starred: false, hue: 33, sat: 56, light: 32 },
  { id: 14, filename: 'DSC_0855.ARW', iso: '400', focal: '85mm', aperture: 'f/1.4', type: 'RAW', selected: true, starred: true, hue: 21, sat: 52, light: 27 },
  { id: 15, filename: 'DSC_0856.ARW', iso: '100', focal: '35mm', aperture: 'f/2.0', type: 'EDITED', selected: true, starred: false, hue: 26, sat: 50, light: 31 },
]

function PhotoCard({
  photo,
  onToggleSelect,
  onToggleStar,
}: {
  photo: PhotoFile
  onToggleSelect: () => void
  onToggleStar: () => void
}) {
  return (
    <div className="group">
      {/* Image area - 3:4 aspect ratio */}
      <div
        className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(135deg, hsl(${photo.hue}, ${photo.sat}%, ${photo.light}%) 0%, hsl(${photo.hue + 12}, ${photo.sat - 8}%, ${photo.light - 6}%) 100%)`,
        }}
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        {/* EDITED / RAW badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`font-label text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold ${
              photo.type === 'EDITED'
                ? 'bg-[#0c5252]/80 text-[#95d1d1]'
                : 'bg-[#373433]/80 text-[#a18d80]'
            }`}
          >
            {photo.type}
          </span>
        </div>

        {/* Selection circle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect()
          }}
          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            photo.selected
              ? 'bg-[#d48441] border-[#d48441]'
              : 'border-[#a18d80]/60 bg-black/30 opacity-0 group-hover:opacity-100'
          }`}
        >
          {photo.selected && <Check size={12} className="text-[#4e2600]" />}
        </button>

        {/* Star icon */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleStar()
          }}
          className={`absolute bottom-2.5 right-2.5 transition-opacity ${
            photo.starred
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Star
            size={16}
            className={
              photo.starred
                ? 'text-[#ffb780] fill-[#ffb780]'
                : 'text-white/70'
            }
          />
        </button>
      </div>

      {/* File info below card */}
      <div className="mt-2 px-0.5">
        <p className="text-xs text-[#e7e1df] truncate">{photo.filename}</p>
        <p className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
          ISO {photo.iso} &bull; {photo.focal} &bull; {photo.aperture}
        </p>
      </div>
    </div>
  )
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params)
  const [photos, setPhotos] = useState<PhotoFile[]>(MOCK_PHOTOS)

  const selectedCount = photos.filter((p) => p.selected).length

  const toggleSelect = (photoId: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, selected: !p.selected } : p))
    )
  }

  const toggleStar = (photoId: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, starred: !p.starred } : p))
    )
  }

  const clearSelection = () => {
    setPhotos((prev) => prev.map((p) => ({ ...p, selected: false })))
  }

  const projectName =
    id === 'demo-1'
      ? 'Portraits & First Look'
      : id === 'demo-2'
        ? 'Property Showcase'
        : id === 'demo-3'
          ? 'Lisboa Street Photography'
          : 'Portraits & First Look'

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-[#151312] relative">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 border-b border-outline-variant">
        <p className="font-label text-[10px] uppercase tracking-widest text-[#d48441] mb-2">
          March 22, 2026
        </p>
        <h1 className="font-headline text-4xl font-bold italic text-[#e7e1df] mb-3">
          {projectName}
        </h1>
        <div className="flex items-center gap-6">
          <div>
            <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
              Selected
            </span>
            <span className="ml-2 font-headline text-sm font-bold text-[#e7e1df]">
              42
              <span className="text-[#a18d80] font-normal">/453</span>
            </span>
          </div>
          <div className="w-px h-4 bg-outline-variant" />
          <div>
            <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
              Storage
            </span>
            <span className="ml-2 font-headline text-sm font-bold text-[#e7e1df]">
              1.2 TB
            </span>
          </div>
        </div>
      </div>

      {/* ── Media Grid ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onToggleSelect={() => toggleSelect(photo.id)}
              onToggleStar={() => toggleStar(photo.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom Floating Move Bar ── */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-panel rounded-2xl border border-outline-variant px-6 py-3 flex items-center gap-5 shadow-2xl shadow-black/50">
            {/* File count */}
            <div className="flex items-center gap-2">
              <span className="bg-[#d48441] text-[#4e2600] font-headline text-xs font-bold px-2 py-0.5 rounded-md">
                {selectedCount}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[#e7e1df]">
                Files Selected
              </span>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-outline-variant" />

            {/* Action icons */}
            <button className="flex items-center gap-1.5 text-[#d9c2b4] hover:text-[#ffb780] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <ArrowRightLeft size={16} />
              <span className="font-label text-[10px] uppercase tracking-widest">Move</span>
            </button>
            <button className="flex items-center gap-1.5 text-[#d9c2b4] hover:text-[#ffb780] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <Star size={16} />
              <span className="font-label text-[10px] uppercase tracking-widest">Star</span>
            </button>
            <button className="flex items-center gap-1.5 text-[#d9c2b4] hover:text-[#ffb780] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <Download size={16} />
              <span className="font-label text-[10px] uppercase tracking-widest">Export</span>
            </button>
            <button className="flex items-center gap-1.5 text-[#e7765f] hover:text-[#ffb4a5] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <Trash2 size={16} />
              <span className="font-label text-[10px] uppercase tracking-widest">Delete</span>
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-outline-variant" />

            {/* Cancel */}
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-[#a18d80] hover:text-[#e7e1df] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={14} />
              <span className="font-label text-[10px] uppercase tracking-widest">
                Cancel Selection
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
