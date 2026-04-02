'use client'

import Link from 'next/link'
import {
  Bell,
  Camera,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const galleries = [
  { name: 'Autumn Wedding', date: 'Sep 16', photos: 512, progress: 85, color: 'bg-emerald-400' },
  { name: 'Engagement Session', date: 'Mar 12', photos: 228, progress: 60, color: 'bg-amber-400' },
  { name: 'Bridal Portraits', date: 'Aug 12', photos: 14, progress: 20, color: 'bg-violet-400' },
]

const actions = [
  { title: 'Invoice #INV-047', desc: 'Wedding Montage · $1,450 due', btn: 'Pay Now', btnColor: 'bg-red-500' },
  { title: 'Sign Contract', desc: 'F26 Wedding Agreement', btn: 'Sign Now', btnColor: 'bg-indigo-600' },
  { title: 'Fill Questionnaire', desc: 'Wedding Day Timeline', btn: 'Open', btnColor: 'bg-indigo-600' },
]

const documents = [
  { name: 'Wedding Contract', status: 'Signed', statusColor: 'text-emerald-400' },
  { name: 'Invoice #INV-046', status: 'Paid', statusColor: 'text-emerald-400' },
  { name: 'Invoice #INV-047', status: 'Pending', statusColor: 'text-amber-400' },
]

const favoriteColors = ['bg-rose-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-500']

/* ─── GlassCard (inline since this page doesn't use V2Shell) ──────────────── */

function GlassCard({ children, className = '', noPad = false }: { children: React.ReactNode; className?: string; noPad?: boolean }) {
  return (
    <div className={`rounded-3xl backdrop-blur-[32px] ${noPad ? '' : 'p-4'} ${className}`}
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
      {children}
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ClientPortalPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)' }}>
      {/* Client Nav */}
      <nav className="flex h-14 items-center justify-between border-b border-white/10 px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-400 to-indigo-600">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <span className="font-headline text-sm font-bold text-white">Kyle Dow Photography</span>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white/8 p-1">
          {['My Galleries', 'Documents', 'Downloads'].map((tab, i) => (
            <button key={tab} className={`rounded-lg px-4 py-1.5 text-xs font-medium ${i === 0 ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'}`}>{tab}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80">Sarah Mitchell</span>
          <div className="h-8 w-8 rounded-full bg-rose-500" />
          <button className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white">Contact Photographer</button>
        </div>
      </nav>

      <div className="px-10 py-8 space-y-6 max-w-[1280px] mx-auto">
        {/* Welcome */}
        <div>
          <h1 className="font-headline text-4xl font-bold text-white">Welcome back, Sarah</h1>
          <p className="mt-1 text-sm text-white/60">Your galleries are ready to view — 2 pending actions</p>
        </div>

        {/* Action items */}
        <div className="flex gap-3 overflow-x-auto">
          {actions.map((a) => (
            <GlassCard key={a.title} className="flex min-w-[220px] items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{a.title}</p>
                <p className="text-[10px] text-white/40 truncate">{a.desc}</p>
              </div>
              <button className={`shrink-0 rounded-lg ${a.btnColor} px-3 py-1.5 text-[10px] font-semibold text-white`}>{a.btn}</button>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Galleries */}
          <GlassCard className="col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Your Galleries</h3>
              <span className="text-[10px] text-white/30">3 galleries</span>
            </div>
            {galleries.map((g) => (
              <div key={g.name} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/8 cursor-pointer transition-colors">
                <div className={`h-3 w-3 rounded-full ${g.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{g.name}</p>
                  <p className="text-[10px] text-white/40">{g.date} — {g.photos} photos</p>
                </div>
                <div className="w-24 h-1.5 rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${g.color}`} style={{ width: `${g.progress}%` }} />
                </div>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </div>
            ))}
          </GlassCard>

          {/* Right column */}
          <div className="space-y-4">
            <GlassCard>
              <h3 className="text-sm font-semibold text-white">Downloads</h3>
              <div className="mt-3 flex items-center gap-3">
                <p className="font-mono text-3xl font-bold text-white">45</p>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-emerald-400" />
                  </div>
                  <p className="mt-1 text-[10px] text-white/40">64,321 photos</p>
                </div>
              </div>
              <button className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700">
                <Download className="mr-1.5 inline h-3 w-3" /> Download
              </button>
            </GlassCard>

            <GlassCard className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Documents</h3>
              {documents.map((d) => (
                <div key={d.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-xs text-white/80">{d.name}</span>
                  </div>
                  <span className={`text-[10px] font-medium ${d.statusColor}`}>{d.status}</span>
                </div>
              ))}
            </GlassCard>
          </div>
        </div>

        {/* Favorite Photos */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Favorite Photos</h3>
          <div className="flex gap-2">
            {favoriteColors.map((c, i) => (
              <div key={i} className={`h-16 w-16 rounded-xl ${c}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
