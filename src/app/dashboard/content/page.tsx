'use client'

import { useState } from 'react'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  // Instagram icon not exported from lucide-react; using Camera as fallback
  MessageCircle,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const platformTabs = ['All', 'Instagram', 'Facebook', 'TikTok'] as const

const stats = [
  { label: 'Total Posts', value: '156', icon: Camera, color: 'var(--chart-soft-indigo)' },
  { label: 'Avg Engagement', value: '4.2%', icon: TrendingUp, color: 'var(--chart-emerald)' },
  { label: 'Total Engagement', value: '2.4K', icon: Heart, color: 'var(--chart-pink)' },
  { label: 'Scheduled', value: '8', icon: Camera, color: 'var(--chart-blue)' },
  { label: 'Drafts', value: '7', icon: Camera, color: 'var(--chart-amber)' },
]

const topPosts = [
  { title: 'Golden Hour Portraits', likes: 342, comments: 28, platform: 'Instagram', color: 'from-amber-400/50 to-orange-600/50' },
  { title: 'Behind the Scenes', likes: 256, comments: 19, platform: 'Instagram', color: 'from-violet-400/50 to-purple-600/50' },
  { title: 'Wedding Details', likes: 198, comments: 15, platform: 'Facebook', color: 'from-rose-400/50 to-pink-600/50' },
  { title: 'Studio Setup Tour', likes: 167, comments: 42, platform: 'TikTok', color: 'from-cyan-400/50 to-blue-600/50' },
]

const calendarDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const scheduledPosts: Record<number, string[]> = {
  3: ['instagram'], 7: ['facebook'], 10: ['instagram', 'tiktok'],
  14: ['instagram'], 18: ['facebook'], 21: ['instagram'],
  24: ['tiktok'], 28: ['instagram', 'facebook'],
}
const platformColors: Record<string, string> = {
  instagram: 'bg-pink-500', facebook: 'bg-blue-500', tiktok: 'bg-white', pinterest: 'bg-red-500',
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ContentHubPage() {
  const [activePlatform, setActivePlatform] = useState('All')

  return (
    <V2Shell>
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold text-white">Content Hub</h1>
            <p className="mt-1 text-sm text-white/60">Showcase and promote your best work.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              <Plus className="h-4 w-4" /> New Post
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              <ExternalLink className="h-4 w-4" /> Connect Platforms
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <GlassCard key={s.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.color}20` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-white/40">{s.label}</p>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-2">
          {platformTabs.map((tab) => (
            <button key={tab} onClick={() => setActivePlatform(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activePlatform === tab ? 'bg-cta text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
            >{tab}</button>
          ))}
        </div>

        {/* Top Posts */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Posts</h2>
            <button className="text-xs text-white/40 hover:text-white">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {topPosts.map((post) => (
              <div key={post.title} className="w-[200px] shrink-0 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className={`h-32 bg-gradient-to-br ${post.color}`} />
                <div className="bg-white/5 p-3">
                  <p className="text-xs font-medium text-white truncate">{post.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-white/40">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span>
                    <span className="ml-auto">{post.platform}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar + Create Post */}
        <div className="grid grid-cols-3 gap-4">
          {/* Social Calendar */}
          <GlassCard className="col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-white">April 2026</h3>
                <div className="flex gap-1">
                  <button className="rounded p-1 text-white/40 hover:text-white"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1 text-white/40 hover:text-white"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] text-white">Month</button>
                <button className="rounded-lg px-2.5 py-1 text-[10px] text-white/40">Week</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d) => (
                <div key={d} className="text-center text-[9px] font-medium uppercase text-white/30 py-1">{d}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2 // April 2026 starts on Wednesday (offset 3)
                const validDay = day > 0 && day <= 30 ? day : null
                const posts = validDay ? scheduledPosts[validDay] : undefined
                return (
                  <div key={i} className={`relative flex h-10 items-center justify-center rounded-lg text-xs ${validDay ? 'text-white/60 hover:bg-white/5 cursor-pointer' : ''}`}>
                    {validDay}
                    {posts && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {posts.map((p, pi) => (
                          <div key={pi} className={`h-1 w-1 rounded-full ${platformColors[p]}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex gap-4">
              {Object.entries(platformColors).filter(([k]) => k !== 'tiktok').map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-[9px] capitalize text-white/30">{name}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Create Post */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Create Post</h3>
              <button className="text-white/30 hover:text-white"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="aspect-video rounded-xl bg-white/5 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white/20" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-white/40">Caption</label>
              <textarea placeholder="Write your caption..." rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 resize-none focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/50 py-2 text-xs font-medium text-white hover:opacity-90/70">
                <Sparkles className="h-3 w-3" /> Generate
              </button>
              <button className="flex-1 rounded-lg border border-white/15 py-2 text-xs text-white/60 hover:text-white">
                Export
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </V2Shell>
  )
}
