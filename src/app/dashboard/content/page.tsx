'use client'

import { useState } from 'react'
import {
  Camera,
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
import { PostCreator } from '@/components/features/content/PostCreator'
import { ContentCalendar } from '@/components/features/content/ContentCalendar'
import type { ContentPost } from '@/types/content'

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

// TODO(analytics-api): fetch real scheduled posts from database
const MOCK_POSTS: ContentPost[] = [
  { id: 'cp-1', photoIds: [], caption: 'Golden hour portraits from last weekend', hashtags: ['#portraits', '#goldenhour'], platforms: ['instagram'], status: 'scheduled', scheduledAt: '2026-04-03T09:00:00.000Z', createdAt: '2026-04-01T10:00:00.000Z' },
  { id: 'cp-2', photoIds: [], caption: 'Behind the scenes at the studio', hashtags: ['#bts', '#studio'], platforms: ['facebook'], status: 'scheduled', scheduledAt: '2026-04-07T14:00:00.000Z', createdAt: '2026-04-02T10:00:00.000Z' },
  { id: 'cp-3', photoIds: [], caption: 'New project reveal — wedding season is here', hashtags: ['#weddings', '#bridal'], platforms: ['instagram'], status: 'scheduled', scheduledAt: '2026-04-10T10:00:00.000Z', createdAt: '2026-04-03T10:00:00.000Z' },
  { id: 'cp-4', photoIds: [], caption: 'Studio setup tour', hashtags: ['#studio', '#bts'], platforms: ['tiktok'], status: 'scheduled', scheduledAt: '2026-04-10T16:00:00.000Z', createdAt: '2026-04-03T11:00:00.000Z' },
  { id: 'cp-5', photoIds: [], caption: 'Family portraits — spring edition', hashtags: ['#family', '#spring'], platforms: ['instagram'], status: 'scheduled', scheduledAt: '2026-04-14T09:30:00.000Z', createdAt: '2026-04-05T10:00:00.000Z' },
  { id: 'cp-6', photoIds: [], caption: 'Meridian Hotel brand shoot wrap-up', hashtags: ['#commercial', '#branding'], platforms: ['facebook'], status: 'scheduled', scheduledAt: '2026-04-18T11:00:00.000Z', createdAt: '2026-04-06T10:00:00.000Z' },
  { id: 'cp-7', photoIds: [], caption: 'Engagement session highlights', hashtags: ['#engagement', '#love'], platforms: ['instagram'], status: 'scheduled', scheduledAt: '2026-04-21T08:00:00.000Z', createdAt: '2026-04-08T10:00:00.000Z' },
  { id: 'cp-8', photoIds: [], caption: 'Editing workflow deep dive', hashtags: ['#photography', '#editing'], platforms: ['tiktok'], status: 'scheduled', scheduledAt: '2026-04-24T15:00:00.000Z', createdAt: '2026-04-10T10:00:00.000Z' },
  { id: 'cp-9', photoIds: [], caption: 'Spring mini sessions — spots still available!', hashtags: ['#minisessions', '#portraits'], platforms: ['instagram'], status: 'scheduled', scheduledAt: '2026-04-28T09:00:00.000Z', createdAt: '2026-04-12T10:00:00.000Z' },
  { id: 'cp-10', photoIds: [], caption: 'Client feature: Chen family newborns', hashtags: ['#newborn', '#family'], platforms: ['facebook'], status: 'scheduled', scheduledAt: '2026-04-28T14:00:00.000Z', createdAt: '2026-04-12T11:00:00.000Z' },
]

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ContentHubPage() {
  const [activePlatform, setActivePlatform] = useState('All')
  const [showPostCreator, setShowPostCreator] = useState(false)

  return (
    <V2Shell>
      {showPostCreator && <PostCreator onClose={() => setShowPostCreator(false)} />}
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold text-white">Content Hub</h1>
            <p className="mt-1 text-sm text-white/60">Showcase and promote your best work.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPostCreator(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
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
          {/* Content Calendar — full interactive month/week with dnd-kit drag */}
          <div className="col-span-2 h-[500px]">
            <ContentCalendar
              posts={MOCK_POSTS}
              onDayClick={() => setShowPostCreator(true)}
              onPostClick={() => setShowPostCreator(true)}
              onReschedule={(postId, newIso) => {
                // TODO(analytics-api): persist reschedule to database
                void postId
                void newIso
              }}
            />
          </div>

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
