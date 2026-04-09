'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Star,
  Flag,
  FolderInput,
  Trash2,
  X,
  ChevronUp,
} from 'lucide-react'

interface WorkspaceSelectionToolbarProps {
  selectedCount: number
  categories: Array<{ name: string }>
  onStar: () => void
  onFlagRed: () => void
  onFlagGreen: () => void
  onMoveTo: (category: string) => void
  onDelete: () => void
  onDeselect: () => void
}

export function WorkspaceSelectionToolbar({
  selectedCount,
  categories,
  onStar,
  onFlagRed,
  onFlagGreen,
  onMoveTo,
  onDelete,
  onDeselect,
}: WorkspaceSelectionToolbarProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const moveRef = useRef<HTMLDivElement>(null)

  // Close move menu on outside click
  useEffect(() => {
    if (!showMoveMenu) return
    function handler(e: MouseEvent) {
      if (moveRef.current && !moveRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMoveMenu])

  if (selectedCount === 0) return null

  return (
    <div className="flex justify-center px-10 py-2 pb-4 w-full">
      <div
        className="flex items-center gap-4 px-6 py-2.5 rounded-3xl
          bg-white/[0.10] border border-white/[0.19]
          backdrop-blur-[20px]"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Selection Count */}
        <div className="flex items-center gap-1.5">
          <span className="text-white font-sans text-sm font-semibold">
            {selectedCount}
          </span>
          <span className="text-white/60 font-sans text-sm">selected</span>
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Star */}
        <button
          onClick={onStar}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
            text-white/60 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
          aria-label="Star selected"
        >
          <Star className="w-4 h-4" />
          <span className="text-xs">Star</span>
        </button>

        {/* Flag Red */}
        <button
          onClick={onFlagRed}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
            text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
          aria-label="Flag red"
        >
          <Flag className="w-4 h-4" />
          <span className="text-xs text-red-400/80">Reject</span>
        </button>

        {/* Flag Green */}
        <button
          onClick={onFlagGreen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
            text-white/60 hover:text-green-400 hover:bg-green-400/10 transition-all"
          aria-label="Flag green"
        >
          <Flag className="w-4 h-4" />
          <span className="text-xs text-green-400/80">Keep</span>
        </button>

        {/* Move — category popover */}
        <div className="relative" ref={moveRef}>
          <button
            onClick={() => setShowMoveMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
              text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
            aria-label="Move selected"
            aria-expanded={showMoveMenu}
          >
            <FolderInput className="w-4 h-4" />
            <span className="text-xs">Move</span>
            <ChevronUp
              className={`w-3 h-3 transition-transform ${showMoveMenu ? 'rotate-0' : 'rotate-180'}`}
            />
          </button>

          {showMoveMenu && (
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50
                min-w-[160px] rounded-xl border border-white/[0.12] bg-[#1a1a2e]/95
                backdrop-blur-xl shadow-2xl overflow-hidden py-1"
            >
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Move to category
              </p>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    onMoveTo(cat.name)
                    setShowMoveMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-white/70
                    hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
            text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all"
          aria-label="Delete selected"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-xs">Delete</span>
        </button>

        {/* Deselect */}
        <button
          onClick={onDeselect}
          className="ml-1 text-white/40 hover:text-white/70 transition-colors"
          aria-label="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
