'use client'

// =============================================================================
// ClientDashboard — Client Component for the client portal home
//
// Receives server-fetched data as props. Handles tab switching and
// all interactive UI. Designed to be rendered by src/app/client/page.tsx
// (a Server Component) which handles auth + data fetching.
// =============================================================================

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Download,
  FileText,
  CheckCircle2,
  CreditCard,
  Mail,
  AlertCircle,
  ClipboardList,
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
// Types
// ---------------------------------------------------------------------------

export interface ClientDocument {
  id: string
  name: string
  type: 'Contract' | 'Invoice' | 'Questionnaire'
  status: string
  statusColor: string
  date: string
  href?: string
}

export interface ClientDownloadPack {
  id: string
  name: string
  photoCount: number
  sizeMb: number
  progress: number // 0-100
}

export interface ClientDashboardProps {
  clientName: string
  clientInitial: string
  brand: PhotographerBrand
  galleries: ClientGallery[]
  pendingActions: PendingAction[]
  documents: ClientDocument[]
  downloadPacks: ClientDownloadPack[]
  favorites: FavoritePhoto[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientDashboard({
  clientName,
  clientInitial,
  brand,
  galleries,
  pendingActions,
  documents,
  downloadPacks,
  favorites,
}: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('My Galleries')

  const activeGalleries = useMemo(
    () =>
      galleries.filter(
        (g) => g.status === 'ready_to_view' || g.status === 'pending_selection',
      ),
    [galleries],
  )

  const totalPhotos = useMemo(
    () => galleries.reduce((sum, g) => sum + g.photoCount, 0),
    [galleries],
  )

  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white">
      {/* Background mesh gradient */}
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
        brand={brand}
        clientName={clientName}
        clientInitial={clientInitial}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 md:px-10 py-8">

        {/* ── My Galleries tab ── */}
        {activeTab === 'My Galleries' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Welcome header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-sans text-[26px] font-bold text-white">
                    Welcome back, {clientName.split(' ')[0]}
                  </h1>
                  <p className="mt-1 text-[14px] text-white/50">
                    {pendingActions.length > 0
                      ? `You have ${pendingActions.length} item${pendingActions.length > 1 ? 's' : ''} that need your attention.`
                      : 'All caught up! Your photographer will update you soon.'}
                  </p>
                </div>
                {brand.contactEmail && (
                  <a
                    href={`mailto:${brand.contactEmail}`}
                    className="hidden md:flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.12] hover:border-white/30"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Photographer
                  </a>
                )}
              </div>

              {/* Pending actions (urgent items) */}
              {pendingActions.length > 0 && (
                <PendingActions actions={pendingActions} />
              )}

              {/* Active galleries strip */}
              {activeGalleries.length > 0 && (
                <ActiveGalleries galleries={activeGalleries} />
              )}

              {/* All galleries */}
              <section>
                <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/40">
                  All Galleries ({galleries.length})
                </h2>
                {galleries.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {galleries.map((gallery) => (
                      <GalleryCard key={gallery.id} gallery={gallery} variant="row" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
                    <p className="text-[14px] text-white/35">
                      No galleries shared with you yet. Your photographer will
                      send you a link when your photos are ready.
                    </p>
                  </div>
                )}
              </section>

              {/* Favorites strip */}
              {favorites.length > 0 && (
                <FavoritesStrip favorites={favorites} totalCount={favorites.length} />
              )}

              {/* CTA row */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                <button className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.08] px-6 py-3 text-[13px] font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.12]">
                  Request New Shoot
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #5749F4 0%, #8B5CF6 100%)',
                  }}
                >
                  Make Selections
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.08] px-6 py-3 text-[13px] font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.12]">
                  Request Revisions
                </button>
              </div>

              {/* Footer */}
              <ClientFooter brand={brand} />
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 w-80 shrink-0">
              <StatsCard totalPhotos={totalPhotos} galleriesCount={galleries.length} />

              {/* Recent activity */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg">
                <h3 className="text-[12px] font-medium uppercase tracking-wider text-white/40 mb-3">
                  Recent Activity
                </h3>
                {documents.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-white/70">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-white/30">{doc.type} · {doc.date}</p>
                        </div>
                        <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${doc.statusColor}`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-white/30">No recent activity.</p>
                )}
              </div>

              {/* Pending action items summary card */}
              {pendingActions.length > 0 && (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5 backdrop-blur-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <h3 className="text-[12px] font-medium text-amber-400">
                      {pendingActions.length} Action{pendingActions.length > 1 ? 's' : ''} Required
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {pendingActions.map((action) => (
                      <Link
                        key={action.id}
                        href={action.href}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                        <span className="truncate">{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ── Documents tab ── */}
        {activeTab === 'Documents' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/40">
              Documents ({documents.length})
            </h2>
            {documents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                      {doc.type === 'Contract' ? (
                        <FileText className="h-5 w-5 text-white/50" />
                      ) : doc.type === 'Invoice' ? (
                        <CreditCard className="h-5 w-5 text-white/50" />
                      ) : (
                        <ClipboardList className="h-5 w-5 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/90">{doc.name}</p>
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
                      {doc.href && (
                        <Link
                          href={doc.href}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
                <p className="text-[14px] text-white/35">No documents yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Downloads tab ── */}
        {activeTab === 'Downloads' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/40">
              Downloads ({downloadPacks.length})
            </h2>
            {downloadPacks.length > 0 ? (
              <div className="flex flex-col gap-4">
                {downloadPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-[14px] font-semibold text-white/90">{pack.name}</p>
                        <p className="mt-0.5 text-[12px] text-white/45">
                          {pack.photoCount} photos · {(pack.sizeMb / 1024).toFixed(1)} GB
                        </p>
                      </div>
                      <button
                        className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                        style={{
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        }}
                      >
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
                    {pack.progress < 100 && (
                      <p className="mt-2 text-[11px] text-white/30">
                        Your photographer is still processing your images. Check back soon.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
                <p className="text-[14px] text-white/35">
                  No downloads ready yet. Your photographer will notify you when
                  your gallery is ready.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
