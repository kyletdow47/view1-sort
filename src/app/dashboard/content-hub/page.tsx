'use client'

import { useState } from 'react'
import {
  Plus,
  Globe,
  TrendingUp,
  Users,
  Heart,
  Send,
  Image,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PlatformTab = 'All' | 'Instagram' | 'Facebook' | 'TikTok'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const KPI_DATA = [
  { label: 'Total Posts', value: '156', icon: Globe, color: '#60A5FA' },
  { label: 'Avg Engagement', value: '4.2%', icon: Heart, color: '#F472B6' },
  { label: 'Reach', value: '2.4K', icon: Users, color: '#34D399' },
  { label: 'Scheduled This Week', value: '8', icon: Clock, color: '#FBBF24' },
  { label: 'Profiles', value: '7', icon: TrendingUp, color: '#A78BFA' },
]

const PLATFORMS: PlatformTab[] = ['All', 'Instagram', 'Facebook', 'TikTok']

const TOP_POSTS = [
  {
    id: 1,
    platform: 'Instagram',
    caption: 'Golden hour portraits with Sarah & Tom ✨ #weddingphotography #goldenhour',
    likes: 847,
    comments: 42,
    bg: 'from-amber-400/30 to-orange-500/20',
    dotColor: '#F59E0B',
  },
  {
    id: 2,
    platform: 'Instagram',
    caption: 'Behind the scenes at Meridian Hotel brand shoot 📸 #commercialphotography',
    likes: 612,
    comments: 28,
    bg: 'from-blue-400/30 to-indigo-500/20',
    dotColor: '#60A5FA',
  },
  {
    id: 3,
    platform: 'Facebook',
    caption: 'New gallery just delivered to the Torres family! Scroll to see the full session ➡️',
    likes: 394,
    comments: 67,
    bg: 'from-pink-400/30 to-rose-500/20',
    dotColor: '#F472B6',
  },
]

// April 2026 content calendar posts (day → posts)
const CALENDAR_POSTS: Record<number, { platform: string; color: string }[]> = {
  2:  [{ platform: 'IG', color: '#E1306C' }],
  4:  [{ platform: 'FB', color: '#1877F2' }],
  7:  [{ platform: 'IG', color: '#E1306C' }, { platform: 'TT', color: '#000000' }],
  9:  [{ platform: 'IG', color: '#E1306C' }],
  11: [{ platform: 'FB', color: '#1877F2' }],
  14: [{ platform: 'IG', color: '#E1306C' }, { platform: 'FB', color: '#1877F2' }],
  16: [{ platform: 'TT', color: '#000000' }],
  18: [{ platform: 'IG', color: '#E1306C' }],
  21: [{ platform: 'IG', color: '#E1306C' }, { platform: 'FB', color: '#1877F2' }, { platform: 'TT', color: '#000000' }],
  23: [{ platform: 'IG', color: '#E1306C' }],
  25: [{ platform: 'FB', color: '#1877F2' }],
  28: [{ platform: 'IG', color: '#E1306C' }],
  30: [{ platform: 'TT', color: '#000000' }],
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ------------------------------------------------------------------ */
/*  Shared glass card                                                  */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Content Calendar                                                   */
/* ------------------------------------------------------------------ */

function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <GlassCard className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-white">{monthName}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-white/35">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const posts = day ? (CALENDAR_POSTS[day] ?? []) : []
          return (
            <div
              key={i}
              className={`flex min-h-[52px] flex-col rounded-lg p-1 transition-colors ${
                day ? 'cursor-pointer hover:bg-white/08' : ''
              }`}
              style={day ? { background: 'rgba(255,255,255,0.04)' } : {}}
            >
              {day && (
                <>
                  <span className="text-[11px] text-white/50">{day}</span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {posts.slice(0, 2).map((p, pi) => (
                      <span
                        key={pi}
                        className="truncate rounded px-1 text-[9px] font-medium text-white"
                        style={{ background: p.color + '80' }}
                      >
                        {p.platform}
                      </span>
                    ))}
                    {posts.length > 2 && (
                      <span className="text-[9px] text-white/30">+{posts.length - 2}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { platform: 'Instagram', color: '#E1306C' },
          { platform: 'Facebook', color: '#1877F2' },
          { platform: 'TikTok', color: '#FFFFFF' },
        ].map((p) => (
          <div key={p.platform} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[10px] text-white/40">{p.platform}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Create Post Panel                                                  */
/* ------------------------------------------------------------------ */

function CreatePostPanel() {
  const [caption, setCaption] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['Instagram']))
  const [scheduledDate, setScheduledDate] = useState('')

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  return (
    <GlassCard className="flex flex-col gap-4 p-4">
      <span className="text-[13px] font-semibold text-white">Create Post</span>

      {/* Photo upload area */}
      <div
        className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl transition-colors hover:bg-white/08 cursor-pointer"
        style={{ border: '1.5px dashed rgba(255,255,255,0.20)' }}
      >
        <Image className="h-6 w-6 text-white/30" />
        <span className="text-[12px] text-white/40">Upload photo or drag here</span>
      </div>

      {/* Caption */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write your caption…"
        rows={3}
        className="w-full resize-none rounded-xl px-3 py-2.5 text-[13px] text-white/80 outline-none placeholder:text-white/25"
        style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.10)' }}
      />

      {/* Platform checkboxes */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium text-white/50">Publish to</span>
        {[
          { label: 'Instagram', color: '#E1306C' },
          { label: 'Facebook', color: '#1877F2' },
          { label: 'TikTok', color: '#FFFFFF' },
        ].map((p) => {
          const active = selectedPlatforms.has(p.label)
          return (
            <button
              key={p.label}
              onClick={() => togglePlatform(p.label)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors"
              style={{
                background: active ? p.color + '18' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? p.color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded"
                style={{
                  background: active ? p.color : 'transparent',
                  border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.25)'}`,
                }}
              >
                {active && <span className="text-[8px] text-white font-bold">✓</span>}
              </span>
              <span className="text-[12px] text-white/75">{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* Date/time */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-white/50">Schedule for</span>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-[12px] text-white/70 outline-none"
          style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.10)' }}
        />
      </div>

      {/* CTA buttons */}
      <div className="flex gap-2">
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
        >
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button
          className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/10"
        >
          <Send className="h-3.5 w-3.5" />
          Post
        </button>
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContentHubPage() {
  const [activeTab, setActiveTab] = useState<PlatformTab>('All')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-[18px] font-bold text-white">Content Hub</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
            <Globe className="h-3.5 w-3.5" />
            Connect Platforms
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="flex shrink-0 gap-3 px-6 py-3">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: kpi.color + '20' }}
              >
                <Icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-white leading-none">{kpi.value}</p>
                <p className="text-[10px] text-white/40">{kpi.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Platform tabs */}
      <div
        className="flex shrink-0 items-center gap-1 px-6 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {PLATFORMS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-1.5 text-[12px] font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main content: Top Posts + Calendar + Create Post */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden px-6 py-4">
        {/* Left: Top Posts */}
        <div className="flex w-full lg:w-[340px] shrink-0 flex-col gap-3">
          <span className="text-[13px] font-semibold text-white/80">Top Posts</span>
          {TOP_POSTS.map((post) => (
            <GlassCard key={post.id} className="overflow-hidden">
              {/* Post image placeholder */}
              <div
                className={`flex h-32 items-end p-3 bg-gradient-to-br ${post.bg}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                    style={{ background: post.dotColor + '80' }}
                  >
                    {post.platform}
                  </span>
                </div>
              </div>
              {/* Engagement */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <p className="line-clamp-1 flex-1 text-[11px] text-white/60">{post.caption}</p>
                <div className="ml-3 flex items-center gap-2 shrink-0 text-[11px] text-white/50">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {post.comments}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Center: Content Calendar */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ContentCalendar />
        </div>

        {/* Right: Create Post */}
        <div className="w-full lg:w-[260px] shrink-0">
          <CreatePostPanel />
        </div>
      </div>
    </div>
  )
}
