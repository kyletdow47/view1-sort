'use client'

import { useState } from 'react'
import {
  Images,
  Heart,
  ShoppingBag,
  AlertCircle,
  Eye,
  ChevronRight,
} from 'lucide-react'

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

type GalleryStatus = 'Awaiting Approval' | 'Delivered' | 'Ready to View'

interface Gallery {
  id: string
  name: string
  status: GalleryStatus
  photos: number
  cover: string
}

const GALLERIES: Gallery[] = [
  { id: 'g1', name: 'Autumn Wedding',    status: 'Awaiting Approval', photos: 123, cover: 'from-rose-400/50 to-pink-600/50' },
  { id: 'g2', name: 'Spring Portraits',  status: 'Delivered',         photos: 90,  cover: 'from-emerald-400/50 to-teal-600/50' },
  { id: 'g3', name: 'Engagement Session',status: 'Ready to View',     photos: 201, cover: 'from-amber-400/50 to-orange-500/50' },
]

const STATUS_STYLE: Record<GalleryStatus, string> = {
  'Awaiting Approval': 'bg-amber-500/15 text-amber-400 border border-amber-400/20',
  'Delivered':         'bg-emerald-500/15 text-emerald-400 border border-emerald-400/20',
  'Ready to View':     'bg-white/10 text-white/60 border border-white/15',
}

const NAV_ITEMS = [
  { label: 'My Galleries', icon: Images },
  { label: 'Favorites',    icon: Heart },
  { label: 'Orders',       icon: ShoppingBag },
]

const FAVORITES = [
  'bg-rose-500', 'bg-emerald-500', 'bg-sky-500',
  'bg-amber-500', 'bg-violet-500', 'bg-cyan-500',
  'bg-pink-500',  'bg-lime-500',
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ClientPortalPage() {
  const [activeNav, setActiveNav] = useState('My Galleries')

  const pendingApproval = GALLERIES.filter((g) => g.status === 'Awaiting Approval')

  return (
    <div
      className="flex min-h-screen text-white"
      style={{
        background: '#050508',
      }}
    >
      {/* ── Sidebar ── */}
      <aside className="flex w-[180px] shrink-0 flex-col border-r border-white/[0.08] bg-white/[0.03] px-4 py-6">
        {/* Brand */}
        <div className="mb-8">
          <p className="font-headline text-xs font-bold text-white">view1</p>
          <p className="text-[10px] text-white/40">Sarah Davis</p>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                activeNav === label
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto px-8 py-8">
        {/* Pending action banner */}
        {pendingApproval.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm text-amber-200">
              <span className="font-semibold">Action Required:</span>{' '}
              {pendingApproval[0].name} gallery is awaiting your approval.
            </p>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-amber-400" />
          </div>
        )}

        {/* Section heading */}
        <h1 className="mb-6 font-headline text-2xl font-bold text-white">
          {activeNav}
        </h1>

        {activeNav === 'My Galleries' && (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {GALLERIES.map((gallery) => (
              <div
                key={gallery.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.05] transition-all hover:border-white/[0.2] hover:bg-white/[0.08]"
              >
                {/* Cover */}
                <div className={`relative h-36 bg-gradient-to-br ${gallery.cover}`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/20 transition-opacity group-hover:opacity-100">
                    <Eye className="h-6 w-6 text-white/80" />
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="mb-1 font-headline text-sm font-semibold text-white">{gallery.name}</p>
                  <p className="mb-3 text-xs text-white/40">{gallery.photos} photos</p>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[gallery.status]}`}>
                      {gallery.status}
                    </span>
                    <button className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      gallery.status === 'Awaiting Approval'
                        ? 'bg-cta text-white hover:opacity-90'
                        : 'border border-white/[0.15] text-white/60 hover:text-white'
                    }`}>
                      {gallery.status === 'Awaiting Approval' ? 'Review Now' : 'View Gallery'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeNav === 'Favorites' && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">{FAVORITES.length} favorited photos</p>
            <div className="flex flex-wrap gap-2">
              {FAVORITES.map((c, i) => (
                <div
                  key={i}
                  className={`h-16 w-16 cursor-pointer rounded-xl ${c} transition-all hover:ring-2 hover:ring-white/30`}
                />
              ))}
            </div>
          </div>
        )}

        {activeNav === 'Orders' && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-12 text-center">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm text-white/40">No orders yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
