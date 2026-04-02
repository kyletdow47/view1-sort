'use client'

import {
  Camera,
  ChevronRight,
  Download,
  Eye,
  Heart,
  Mail,
} from 'lucide-react'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const activeGalleries = [
  { name: 'Wedding — Smith', photos: 345, cover: 'from-rose-400/60 to-pink-600/60', badge: 'New' },
  { name: 'Engagement Session', photos: 230, cover: 'from-amber-400/60 to-orange-600/60', badge: null },
  { name: 'Family Portraits', photos: 180, cover: 'from-emerald-400/60 to-teal-600/60', badge: null },
  { name: 'Corporate Event', photos: 95, cover: 'from-violet-400/60 to-purple-600/60', badge: null },
]

const allGalleries = [
  { name: 'Wedding — Smith', photos: 345, status: 'Ready to View', statusColor: 'bg-white/10 text-white/70', cover: 'from-rose-400/40 to-pink-600/40' },
  { name: 'Engagement Session', photos: 230, status: 'Pending Selection', statusColor: 'bg-orange-500/20 text-orange-400', cover: 'from-amber-400/40 to-orange-600/40' },
  { name: 'Family Portraits', photos: 180, status: 'Download Ready', statusColor: 'bg-emerald-500/20 text-emerald-400', cover: 'from-emerald-400/40 to-teal-600/40' },
  { name: 'Corporate Event', photos: 95, status: 'Ready to View', statusColor: 'bg-white/10 text-white/70', cover: 'from-violet-400/40 to-purple-600/40' },
  { name: 'Product Shoot', photos: 78, status: 'Ready to View', statusColor: 'bg-white/10 text-white/70', cover: 'from-sky-400/40 to-blue-600/40' },
  { name: 'Headshots', photos: 54, status: 'Download Ready', statusColor: 'bg-emerald-500/20 text-emerald-400', cover: 'from-cyan-400/40 to-teal-600/40' },
]

const favoriteColors = [
  'bg-rose-600', 'bg-emerald-600', 'bg-blue-600', 'bg-amber-600',
  'bg-violet-600', 'bg-cyan-600', 'bg-pink-600', 'bg-lime-600',
]

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ClientPortalHomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1A2D6B 30%, #1E3A8A 60%, #2D4A9E 100%)' }}>
      {/* Header */}
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white ring-2 ring-white/20">
            KD
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold text-white">Kyle Davis Photography</h1>
            <p className="text-xs text-white/50">Capturing moments that matter</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">
          <Mail className="h-4 w-4" /> Contact
        </button>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-10 px-6 pb-12">
        {/* Active Galleries */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Your Active Galleries</h2>
            <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {activeGalleries.map((g) => (
              <div key={g.name} className="group w-[200px] shrink-0 cursor-pointer rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className={`relative h-32 bg-gradient-to-br ${g.cover}`}>
                  {g.badge && (
                    <span className="absolute top-2 left-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">{g.badge}</span>
                  )}
                </div>
                <div className="bg-white/5 p-3">
                  <p className="text-xs font-medium text-white truncate">{g.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Galleries */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">All Galleries</h2>
            <span className="text-[10px] text-white/30">{allGalleries.length} galleries</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {allGalleries.map((g) => (
              <div
                key={g.name}
                className="group cursor-pointer rounded-2xl overflow-hidden transition-all hover:ring-2 hover:ring-white/20"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className={`h-36 bg-gradient-to-br ${g.cover} relative`}>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white/80" />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-4">
                  <div>
                    <p className="text-[10px] text-white/30">{g.photos} photos</p>
                    <p className="text-sm font-medium text-white">{g.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${g.statusColor}`}>
                    {g.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Favorites */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Your Favorites</h2>
            <span className="text-[10px] text-white/30">12 photos</span>
          </div>
          <div className="flex gap-2">
            {favoriteColors.map((c, i) => (
              <div key={i} className={`h-16 w-16 rounded-xl ${c} hover:ring-2 hover:ring-white/30 cursor-pointer transition-all`} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
