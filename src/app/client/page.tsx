'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  Camera,
  Images,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Aperture,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PortalTab = 'My Galleries' | 'Documents' | 'Downloads'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const PENDING_ACTIONS = [
  {
    id: 'a1',
    label: 'Invoice #INV-047',
    action: 'Pay Now',
    type: 'invoice',
    icon: CreditCard,
    color: '#FBBF24',
  },
  {
    id: 'a2',
    label: 'Sign Contract',
    action: 'Sign',
    type: 'contract',
    icon: FileText,
    color: '#60A5FA',
  },
  {
    id: 'a3',
    label: 'Fill Questionnaire',
    action: 'Open',
    type: 'questionnaire',
    icon: AlertCircle,
    color: '#A78BFA',
  },
]

const GALLERIES = [
  {
    id: 'g1',
    name: 'Autumn Wedding',
    date: 'Nov 8, 2025',
    photoCount: 428,
    status: 'Ready to View',
    statusColor: '#34D399',
    coverHue: 25,
  },
  {
    id: 'g2',
    name: 'Engagement Session',
    date: 'Jan 22, 2026',
    photoCount: 180,
    status: 'Pending Selection',
    statusColor: '#FBBF24',
    coverHue: 200,
  },
  {
    id: 'g3',
    name: 'Bridal Portraits',
    date: 'Mar 15, 2026',
    photoCount: 94,
    status: 'Downloads Ready',
    statusColor: '#60A5FA',
    coverHue: 320,
  },
]

const DOCUMENTS = [
  {
    id: 'd1',
    name: 'Wedding Contract',
    type: 'Contract',
    status: 'Signed',
    statusColor: '#34D399',
    date: 'Mar 1, 2026',
    icon: FileText,
  },
  {
    id: 'd2',
    name: 'Invoice #INV-045',
    type: 'Invoice',
    status: 'Paid',
    statusColor: '#34D399',
    date: 'Feb 20, 2026',
    icon: CreditCard,
  },
  {
    id: 'd3',
    name: 'Invoice #INV-041',
    type: 'Invoice',
    status: 'Paid',
    statusColor: '#34D399',
    date: 'Jan 15, 2026',
    icon: CreditCard,
  },
]

const DOWNLOAD_PACKS = [
  {
    id: 'dp1',
    name: 'Autumn Wedding — Full Gallery',
    photoCount: 45,
    sizeMb: 1240,
    progress: 100,
  },
  {
    id: 'dp2',
    name: 'Engagement Session — Selects',
    photoCount: 30,
    sizeMb: 680,
    progress: 60,
  },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>('My Galleries')

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: 'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
      }}
    >
      {/* Photographer-branded header */}
      <header
        className="sticky top-0 z-10 flex h-14 items-center justify-between px-8 backdrop-blur-sm"
        style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.10)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-400 to-indigo-600">
            <Aperture className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[15px] text-white">Kyle Dow Photography</span>
        </div>

        {/* Tab nav */}
        <nav
          className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {(['My Galleries', 'Documents', 'Downloads'] as PortalTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === tab ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/60 hover:text-white/85'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-white/60 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/60 text-[12px] font-bold text-white ring-2 ring-white/20">
            S
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-[26px] font-bold text-white">Hi Sarah 👋</h1>
          <p className="mt-1 text-[14px] text-white/55">
            {PENDING_ACTIONS.length > 0
              ? `You have ${PENDING_ACTIONS.length} items that need your attention.`
              : 'All caught up! Your photographer will update you soon.'}
          </p>
        </div>

        {/* Pending action banners */}
        {PENDING_ACTIONS.length > 0 && (
          <div className="flex flex-col gap-2">
            {PENDING_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: action.color + '18',
                    border: `1px solid ${action.color}30`,
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: action.color }} />
                  <span className="flex-1 text-[13px] font-medium text-white/85">{action.label}</span>
                  <button
                    className="shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-80"
                    style={{ background: action.color + '30', border: `1px solid ${action.color}50` }}
                  >
                    {action.action}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'My Galleries' && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[12px] font-medium uppercase tracking-wider text-white/40">Your Galleries</h2>
            {GALLERIES.map((g) => (
              <Link
                key={g.id}
                href={`/gallery/${g.id}`}
                className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-white/08"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                {/* Cover thumbnail */}
                <div
                  className="h-14 w-20 shrink-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, hsl(${g.coverHue},40%,25%) 0%, hsl(${g.coverHue},60%,35%) 100%)`,
                  }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white/90">{g.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-white/45">
                    <Camera className="h-3 w-3" />
                    <span>{g.photoCount} photos</span>
                    <span>·</span>
                    <span>{g.date}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: g.statusColor + '20', color: g.statusColor }}
                  >
                    {g.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[12px] font-medium uppercase tracking-wider text-white/40">Documents</h2>
            {DOCUMENTS.map((doc) => {
              const Icon = doc.icon
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/08"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <Icon className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white/90">{doc.name}</p>
                    <p className="text-[11px] text-white/40">{doc.type} · {doc.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: doc.statusColor + '20', color: doc.statusColor }}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {doc.status}
                    </span>
                    <button className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'Downloads' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[12px] font-medium uppercase tracking-wider text-white/40">Downloads</h2>
            {DOWNLOAD_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
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
                    style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pack.progress}%`,
                        background: pack.progress === 100 ? '#34D399' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                      }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] text-white/45">{pack.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Your Favorites strip (Page 14 content) */}
        {activeTab === 'My Galleries' && (
          <div>
            <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-white/40">Your Favorites</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-16 w-16 shrink-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(i * 40) + 20},45%,25%) 0%, hsl(${(i * 40) + 20},60%,38%) 100%)`,
                    border: '2px solid rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
