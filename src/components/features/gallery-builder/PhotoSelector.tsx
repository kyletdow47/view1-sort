'use client'

import { useState, useMemo } from 'react'
import { Check, Search, Image as ImageIcon } from 'lucide-react'
import type { Media } from '@/types/supabase'

interface PhotoSelectorProps {
  media: Media[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export function PhotoSelector({
  media,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: PhotoSelectorProps) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    for (const item of media) {
      cats.add(item.ai_category ?? 'Uncategorized')
    }
    return Array.from(cats).sort()
  }, [media])

  const filtered = useMemo(() => {
    return media.filter((item) => {
      if (search && !item.filename.toLowerCase().includes(search.toLowerCase())) return false
      if (filterCategory && (item.ai_category ?? 'Uncategorized') !== filterCategory) return false
      return true
    })
  }, [media, search, filterCategory])

  const allSelected = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id))

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Select Photos
        </h3>
        <span className="text-xs text-white/60">
          {selectedIds.size} / {media.length} selected
        </span>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search photos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.06] border border-white/10
              rounded-lg text-white placeholder:text-white/40 outline-none
              focus:border-[#5749F4]/50 transition-colors"
          />
        </div>
        <select
          value={filterCategory ?? ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-2 py-1.5 text-xs bg-white/[0.06] border border-white/10
            rounded-lg text-white/80 outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Select All / Deselect All */}
      <div className="flex gap-2">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-[#5749F4] hover:text-[#5749F4]/80 transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-1.5 max-h-[400px] overflow-y-auto pr-1
        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filtered.map((item) => {
          const isSelected = selectedIds.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`
                relative aspect-square rounded-lg overflow-hidden group
                border-2 transition-all
                ${isSelected
                  ? 'border-[#5749F4] ring-1 ring-[#5749F4]/30'
                  : 'border-transparent hover:border-white/20'}
              `}
            >
              {item.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail_url}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
                  <ImageIcon size={16} className="text-white/20" />
                </div>
              )}

              {/* Selection indicator */}
              <div className={`
                absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center
                transition-all
                ${isSelected
                  ? 'bg-[#5749F4] text-white'
                  : 'bg-black/40 text-transparent group-hover:text-white/40'}
              `}>
                <Check size={12} />
              </div>

              {/* Category label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent
                px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white/80 truncate block">
                  {item.ai_category ?? 'Uncategorized'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-8 text-white/30 text-xs">
          No photos match your filter
        </div>
      )}
    </div>
  )
}
