'use client'

import Link from 'next/link'
import { use } from 'react'
import {
  Upload,
  Grid3X3,
  List,
  Search,
  Star,
  MoreHorizontal,
  Share2,
  Settings,
  Image,
  ChevronDown,
} from 'lucide-react'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

const MOCK_CATEGORIES = [
  { name: 'Exterior', count: 24 },
  { name: 'Interior', count: 31 },
  { name: 'Kitchen', count: 12 },
  { name: 'Bathroom', count: 8 },
  { name: 'Drone/Aerial', count: 6 },
  { name: 'Other', count: 3 },
]

function MockPhoto({ index }: { index: number }) {
  const hues = [200, 150, 280, 340, 40, 180, 100, 220, 300, 60]
  const hue = hues[index % hues.length]
  return (
    <div
      className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
      style={{ backgroundColor: `hsl(${hue}, 30%, 20%)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Image className="text-white/10" size={32} />
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 bg-black/50 rounded text-white/70 hover:text-yellow-400">
          <Star size={14} />
        </button>
      </div>
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
          IMG_{String(1000 + index).padStart(4, '0')}.jpg
        </span>
      </div>
    </div>
  )
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params)

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Project Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-view1-border bg-surface/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            {id === 'demo-1' ? 'Johnson Wedding' :
             id === 'demo-2' ? '123 Oak Street Listing' :
             id === 'demo-3' ? 'Portugal Travel Series' :
             id === 'demo-4' ? 'Corporate Headshots' : 'Project'}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">draft</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/project/${id}/settings`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Settings size={14} />
            Settings
          </Link>
          <Link
            href={`/dashboard/project/${id}/publish`}
            className="flex items-center gap-1.5 bg-accent text-black font-semibold text-sm rounded-lg px-4 py-1.5 hover:bg-green-300 transition-colors"
          >
            <Share2 size={14} />
            Publish
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-view1-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
            <button className="p-1.5 rounded bg-white/10 text-white">
              <Grid3X3 size={14} />
            </button>
            <button className="p-1.5 rounded text-muted hover:text-white">
              <List size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search photos..."
              className="bg-surface border border-view1-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-muted w-48 focus:outline-none focus:border-accent/50"
            />
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover:text-white px-2 py-1.5">
            Filter <ChevronDown size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-muted hover:text-white px-3 py-1.5 rounded-lg border border-view1-border hover:border-accent/40 transition-colors">
            <Upload size={14} />
            Upload
          </button>
          <button className="text-muted hover:text-white p-1.5">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content — Category Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {MOCK_CATEGORIES.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{category.name}</h3>
                <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">{category.count}</span>
              </div>
              <button className="text-xs text-muted hover:text-white">Select all</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {Array.from({ length: Math.min(category.count, 8) }, (_, i) => (
                <MockPhoto key={i} index={i + MOCK_CATEGORIES.indexOf(category) * 10} />
              ))}
              {category.count > 8 && (
                <div className="aspect-[4/3] rounded-lg bg-surface border border-view1-border flex items-center justify-center">
                  <span className="text-xs text-muted">+{category.count - 8} more</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
