'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Download,
  FileText,
  CheckCircle2,
  CreditCard,
  Mail,
} from 'lucide-react'

import {
  ClientNav,
  PendingActions,
  GalleryCard,
  ActiveGalleries,
  FavoritesStrip,
  ClientFooter,
  StatsCard,
} from '@/components/features/ClientPortal'
import type { PortalTab } from '@/components/features/ClientPortal'
import type {
  ClientGallery,
  PendingAction,
  PhotographerBrand,
  FavoritePhoto,
} from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Mock data — will be replaced with Supabase queries
// ---------------------------------------------------------------------------

const BRAND: PhotographerBrand = {
  name: 'Kyle Davis Photography',
  tagline: 'Capturing moments that matter',
  avatarUrl: null,
  avatarInitials: 'KD',
  accentColor: '#5749F4',
  contactEmail: 'kyle@kyledavis.com',
  contactPhone: null,
}

const PENDING_ACTIONS: PendingAction[] = [
  {
    id: 'a1',
    label: 'Invoice #INV-047 — Wedding Package • $2,400',
    action: 'Pay Now',
    type: 'invoice',
    href: '#',
  },
  {
    id: 'a2',
    label: 'Sign Contract — Wedding Day Timeline',
    action: 'Sign',
    type: 'contract',
    href: '#',
  },
  {
    id: 'a3',
    label: 'Fill Questionnaire — Wedding Day Preferences',
    action: 'Open',
    type: 'questionnaire',
    href: '#',
  },
]

const GALLERIES: ClientGallery[] = [
  {
    id: 'g1',
    name: 'Wedding — Smith',
    coverUrl: null,
    photoCount: 428,
    status: 'ready_to_view',
    shootDate: 'Nov 8, 2025',
    createdAt: '2025-11-10',
    theme: 'dark',
    pricingModel: 'free',
  },
  {
    id: 'g2',
    name: 'Engagement Session',
    coverUrl: null,
    photoCount: 180,
    status: 'pending_selection',
    shootDate: 'Jan 22, 2026',
    createdAt: '2026-01-25',
    theme: 'dark',
    pricingModel: 'per_photo',
  },
  {
    id: 'g3',
    name: 'Family Portraits',
    coverUrl: null,
    photoCount: 94,
    status: 'downloads_ready',
    shootDate: 'Mar 15, 2026',
    createdAt: '2026-03-18',
    theme: 'dark',
    pricingModel: 'flat_fee',
  },
  {
    id: 'g4',
    name: 'Corporate Event',
    coverUrl: null,
    photoCount: 312,
    status: 'ready_to_view',
    shootDate: 'Feb 5, 2026',
    createdAt: '2026-02-08',
    theme: 'dark',
    pricingModel: 'free',
  },
  {
    id: 'g5',
    name: 'Product Shoot',
    coverUrl: null,
    photoCount: 56,
    status: 'processing',
    shootDate: 'Mar 28, 2026',
    createdAt: '2026-03-30',
    theme: 'dark',
    pricingModel: 'flat_fee',
  },
  {
    id: 'g6',
    name: 'Headshots',
    coverUrl: null,
    photoCount: 24,
    status: 'downloads_ready',
    shootDate: 'Mar 20, 2026',
    createdAt: '2026-03-22',
    theme: 'dark',
    pricingModel: 'free',
  },
]

const DOCUMENTS = [
  {
    id: 'd1',
    name: 'Wedding Contract',
    type: 'Contract',
    status: 'Signed',
    statusColor: 'text-emerald-400 bg-emerald-400/15',
    date: 'Mar 1, 2026',
  },
  {
    id: 'd2',
    name: 'Invoice #INV-045',
    type: 'Invoice',
    status: 'Paid',
    statusColor: 'text-emerald-400 bg-emerald-400/15',
    date: 'Feb 20, 2026',
  },
  {
    id: 'd3',
    name: 'Invoice #INV-041',
    type: 'Invoice',
    status: 'Paid',
    statusColor: 'text-emerald-400 bg-emerald-400/15',
    date: 'Jan 15, 2026',
  },
]

const DOWNLOAD_PACKS = [
  { id: 'dp1', name: 'Wedding — Full Gallery', photoCount: 45, sizeMb: 1240, progress: 100 },
  { id: 'dp2', name: 'Engagement — Selects', photoCount: 30, sizeMb: 680, progress: 60 },
]

const FAVORITES: FavoritePhoto[] = Array.from({ length: 10 }, (_, i) => ({
  id: `fav-${i}`,
  thumbnailUrl: '',
  alt: `Favorite photo ${i + 1}`,
  orientation: null,
}))

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>('My Galleries')

  const activeGalleries = useMemo(
    () => GALLERIES.filter(
      (g) => g.status === 'ready_to_view' || g.status === 'pending_selection',
    ),
    [],
  )

  const totalPhotos = useMemo(
    () => GALLERIES.reduce((sum, g) => sum + g.photoCount, 0),
    [],
  )

  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white">
      {/* Background: mesh gradient overlay matching Pencil frames */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 65% 15%, rgba(96,165,250,0.12) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 45% at 25% 75%, rgba(245,158,11,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 40% at 80% 60%, rgba(236,72,153,0.08) 0%, transparent 70%)',
            'linear-gradient(160deg, #030305 0%, #080810 30%, #060609 60%, #030305 100%)',
          ].join(', '),
        }}
      />

      {/* Navigation */}
      <ClientNav
        brand={BRAND}
        clientName="Sarah Mitchell"
        clientInitial="S"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 md:px-10 py-8">
        {activeTab === 'My Galleries' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Welcome header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-headline text-[26px] font-bold text-white">
                    Welcome back, Sarah
                  </h1>
                  <p className="mt-1 text-[14px] text-white/50">
                    {PENDING_ACTIONS.length > 0
                      ? `You have ${PENDING_ACTIONS.length} items that need your attention.`
                      : 'All caught up! Your photographer will update you soon.'}
                  </p>
                </div>
                <a
                  href={`mailto:${BRAND.contactEmail}`}
                  className="hidden md:flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.12] hover:border-white/30"
                >
                  <Mail className="h-4 w-4" />
                  Contact Photographer
                </a>
              </div>

              {/* Pending actions */}
              <PendingActions actions={PENDING_ACTIONS} />

              {/* Active galleries strip */}
              <ActiveGalleries galleries={activeGalleries} />

              {/* All galleries list */}
              <section>
                <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/40">
                  All Galleries
                </h2>
                <div className="flex flex-col gap-3">
                  {GALLERIES.map((gallery) => (
                    <GalleryCard key={gallery.id} gallery={gallery} variant="row" />
                  ))}
                </div>
              </section>

              {/* Favorites strip */}
              <FavoritesStrip favorites={FAVORITES} totalCount={FAVORITES.length} />

              {/* CTA Row (from frame 4lzWb) */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                <button className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.08] px-6 py-3 text-[13px] font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.12]">
                  Request New Shoot
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[13px] font-semibold text-white transition-all hover:opacity-90">
                  Make Selections
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.08] px-6 py-3 text-[13px] font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.12]">
                  Request Revisions
                </button>
              </div>

              {/* Footer */}
              <ClientFooter brand={BRAND} />
            </div>

            {/* Right column (from frame XOUvs) */}
            <aside className="hidden lg:flex flex-col gap-4 w-80 shrink-0">
              <StatsCard
                totalPhotos={totalPhotos}
                galleriesCount={GALLERIES.length}
              />

              {/* Recent contacts/activity */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg">
                <h3 className="text-[12px] font-medium uppercase tracking-wider text-white/40 mb-3">
                  Recent Activity
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Wedding Contract', action: 'Signed', time: '2d ago' },
                    { label: 'Invoice #INV-045', action: 'Paid', time: '5d ago' },
                    { label: 'Gallery link sent', action: 'Viewed', time: '1w ago' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-white/70">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-white/30">{item.action}</p>
                      </div>
                      <span className="text-[11px] text-white/25">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/40">
              Documents
            </h2>
            <div className="flex flex-col gap-3">
              {DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    {doc.type === 'Contract' ? (
                      <FileText className="h-5 w-5 text-white/50" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-white/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white/90">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {doc.type} · {doc.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${doc.statusColor}`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {doc.status}
                    </span>
                    <button className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Downloads' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/40">
              Downloads
            </h2>
            <div className="flex flex-col gap-4">
              {DOWNLOAD_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[14px] font-semibold text-white/90">
                        {pack.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-white/45">
                        {pack.photoCount} photos · {(pack.sizeMb / 1024).toFixed(1)} GB
                      </p>
                    </div>
                    <button className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pack.progress}%`,
                          background:
                            pack.progress === 100
                              ? '#34D399'
                              : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                        }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-white/45">
                      {pack.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
