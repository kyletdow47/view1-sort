'use client'

import { use } from 'react'
import { Download, Heart, Share2, Image, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryPageProps {
  params: Promise<{ id: string }>
}

const MOCK_CATEGORIES = ['Ceremony', 'Portraits', 'Reception', 'Details', 'Getting Ready']

function MockGalleryPhoto({ index }: { index: number }) {
  const hues = [330, 200, 280, 40, 160, 300, 180, 100, 350, 220]
  const hue = hues[index % hues.length]
  return (
    <div
      className="relative aspect-[3/2] rounded-lg overflow-hidden group cursor-pointer"
      style={{ backgroundColor: `hsl(${hue}, 25%, 25%)` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Image className="text-white/10" size={40} />
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 bg-black/50 rounded-full text-white/70 hover:text-red-400">
          <Heart size={14} />
        </button>
        <button className="p-1.5 bg-black/50 rounded-full text-white/70 hover:text-white">
          <Download size={14} />
        </button>
      </div>
    </div>
  )
}

export default function GalleryPage({ params }: GalleryPageProps) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Gallery Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Johnson Wedding</h1>
            <p className="text-sm text-white/50 mt-0.5">June 15, 2026 &middot; 847 photos</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <Share2 size={14} />
              Share
            </button>
            <button className="flex items-center gap-2 bg-white text-black font-semibold text-sm rounded-lg px-4 py-2 hover:bg-white/90 transition-colors">
              <Download size={14} />
              Download All
            </button>
          </div>
        </div>
      </header>

      {/* Category Nav */}
      <nav className="border-b border-white/10 px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
          <button className="flex items-center gap-1 px-1 text-white/40">
            <ChevronLeft size={16} />
          </button>
          {MOCK_CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                i === 0
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="flex items-center gap-1 px-1 text-white/40">
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {/* Photo Grid */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {MOCK_CATEGORIES.map((category) => (
          <section key={category} className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-white/90">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <MockGalleryPhoto key={i} index={i + MOCK_CATEGORIES.indexOf(category) * 8} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center">
        <p className="text-white/30 text-sm">
          Powered by <span className="text-white/50">View1 Sort</span>
        </p>
      </footer>
    </div>
  )
}
