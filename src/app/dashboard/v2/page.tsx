'use client'

import React, { useState } from 'react'
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  FolderOpen,
  List,
  Settings,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActivityItem {
  id: number
  text: string
  time: string
  dotColor: string
}

interface ProjectCard {
  id: number
  name: string
  avatarColor: string
  photoCount: number
}

interface StatRing {
  label: string
  value: number
  icon: React.ElementType
  sweepDeg: number
  gradientFrom: string
  gradientTo: string
}

interface DeliveryRow {
  id: number
  client: string
  gallery: string
  status: string
  statusColor: string
  dotColor: string
}

interface InboxMessage {
  id: number
  name: string
  preview: string
  time: string
  avatarColor: string
  unread: boolean
}

interface TodoItem {
  id: number
  title: string
  time: string
  color: string
  completed: boolean
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const ACTIVITIES: ActivityItem[] = [
  { id: 1, text: 'Johnson Wedding gallery published', time: '2 hours ago', dotColor: '#34D399' },
  { id: 2, text: 'AI sorted 156 photos \u2014 Oak Street', time: '5 hours ago', dotColor: '#A78BFA' },
  { id: 3, text: 'Client viewed Portugal Travel gallery', time: 'Yesterday', dotColor: '#FBBF24' },
  { id: 4, text: 'Payment received \u2014 $1,200', time: '2 days ago', dotColor: '#F87171' },
  { id: 5, text: 'New project created \u2014 Corporate Headshots', time: '3 days ago', dotColor: '#A78BFA' },
]

const PROJECTS: ProjectCard[] = [
  { id: 1, name: 'Wedding Shoot', avatarColor: '#2DD4BF50', photoCount: 248 },
  { id: 2, name: 'Real Estate Tour', avatarColor: '#F8717150', photoCount: 132 },
  { id: 3, name: 'Travel Portfolio', avatarColor: '#FBBF2450', photoCount: 89 },
]

const STAT_RINGS: StatRing[] = [
  { label: 'Unfinished Tasks', value: 12, icon: CircleCheck, sweepDeg: 216, gradientFrom: '#FF8E53', gradientTo: '#FF6B6B' },
  { label: 'Active Projects', value: 4, icon: FolderOpen, sweepDeg: 288, gradientFrom: '#4ECDC4', gradientTo: '#44CF6C' },
  { label: 'Shoots Pending', value: 3, icon: Camera, sweepDeg: 108, gradientFrom: '#C77DFF', gradientTo: '#7B2FBE' },
  { label: 'Shoots this Month', value: 8, icon: CalendarDays, sweepDeg: 241, gradientFrom: '#FFD93D', gradientTo: '#FF9F43' },
]

const DELIVERIES: DeliveryRow[] = [
  { id: 1, client: 'Johnson', gallery: 'Wedding Gallery', status: 'Delivered', statusColor: '#34D399', dotColor: '#34D399' },
  { id: 2, client: 'Smith Corp', gallery: 'Headshots', status: 'Pending', statusColor: '#FBBF24', dotColor: '#FBBF24' },
  { id: 3, client: 'Travel Blog', gallery: 'Portugal Set', status: 'Processing', statusColor: '#60A5FA', dotColor: '#60A5FA' },
]

const INBOX: InboxMessage[] = [
  { id: 1, name: 'Sarah Mitchell', preview: 'Hey, I got the proofs back! They look amazing...', time: '2m', avatarColor: '#7C3AED', unread: true },
  { id: 2, name: 'James & Lily W.', preview: 'Can we reschedule to the 20th? We have a...', time: '18m', avatarColor: '#E11D48', unread: true },
  { id: 3, name: 'TechCorp Inc.', preview: 'The brand photos are exactly what we needed!', time: '2h', avatarColor: '#D97706', unread: false },
  { id: 4, name: 'Miller Family', preview: "Thank you so much for yesterday's session!", time: '1d', avatarColor: '#0D9488', unread: false },
]

const TODOS: TodoItem[] = [
  { id: 1, title: 'Complete Sorting', time: 'Sep 13, 08:30', color: '#2DD4BF', completed: false },
  { id: 2, title: 'Confirm New Booking', time: 'Sep 13, 10:30', color: '#FBBF24', completed: false },
  { id: 3, title: 'Send Project', time: 'Sep 13, 15:00', color: '#A78BFA', completed: false },
  { id: 4, title: 'Complete Project', time: 'Sep 13, 14:45', color: '#FFFFFF18', completed: true },
  { id: 5, title: 'Review Payment', time: 'Sep 13, 16:30', color: '#FFFFFF18', completed: true },
]

/** Mini-calendar data: days with shoot highlights */
const CAL_SHOOT_DAYS = [4, 8]
const CAL_SCHEDULED_DAYS = [14, 17, 22, 25]
const CAL_TODAY = 15

const NAV_ITEMS = ['Dashboard', 'AI Sort', 'Gallery', 'Projects', 'Clients', 'Bookings', 'Analytics']

/* ------------------------------------------------------------------ */
/*  Glass Card helper                                                  */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl backdrop-blur-[32px] ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%), linear-gradient(180deg, rgba(255,255,255,0.19) 0%, transparent 25%)',
        border: '1px solid',
        borderImage:
          'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.03) 100%) 1',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {children}
    </div>
  )
}

function GlassCardSmall({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[20px] backdrop-blur-[16px] ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SVG Progress Ring                                                  */
/* ------------------------------------------------------------------ */

function ProgressRing({ ring }: { ring: StatRing }) {
  const size = 80
  const strokeWidth = size * 0.15
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ring.sweepDeg / 360
  const dashOffset = circumference * (1 - progress)
  const Icon = ring.icon
  const gradientId = `ring-grad-${ring.label.replace(/\s/g, '')}`

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ring.gradientFrom} />
              <stop offset="100%" stopColor={ring.gradientTo} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={20} className="text-white" />
          <span className="text-sm font-bold text-white">{ring.value}</span>
        </div>
      </div>
      <span className="text-center text-[11px] text-white/65">{ring.label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Top Navigation                                                     */
/* ------------------------------------------------------------------ */

function TopNav({ activeNav }: { activeNav: string }) {
  return (
    <nav
      className="flex h-14 w-full items-center justify-between px-10"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(180deg, #6366F1, #4F46E5)' }}
        >
          <Aperture size={18} className="text-white" />
        </div>
        <span className="text-[15px] font-bold text-white">View1 Sort</span>
      </div>

      {/* Center: Nav links */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[.07] p-1 backdrop-blur-[16px]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className={`flex items-center gap-1 rounded-lg px-4 py-2 text-[13px] transition-colors ${
              item === activeNav
                ? 'bg-white/[.13] font-semibold text-white'
                : 'font-normal text-white/65 hover:text-white/85'
            }`}
          >
            <span>{item}</span>
            {item !== activeNav && item !== 'Dashboard' && (
              <ChevronRight size={12} className="text-white/40" />
            )}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Bell size={18} className="text-white/65" />
        <Settings size={18} className="text-white/65" />
        <div
          className="h-8 w-8 rounded-full"
          style={{
            backgroundColor: '#4F46E5',
            border: '2px solid rgba(255,255,255,0.25)',
          }}
        />
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Welcome Section + Chat                                             */
/* ------------------------------------------------------------------ */

function WelcomeSection() {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <h1 className="text-center text-[37px] font-bold text-white">Welcome Kyle,</h1>
      <div
        className="flex h-[81px] w-[480px] items-center gap-3 rounded-3xl px-5 pr-1.5 backdrop-blur-[20px]"
        style={{
          background: 'rgba(255,255,255,0.09)',
          border: '1px solid rgba(255,255,255,0.19)',
          boxShadow: '0 4px 16px rgba(255,255,255,0.06)',
        }}
      >
        <span className="flex-1 text-sm text-white/50">
          Ask View1...&quot;Which clients haven&apos;t completed payment&quot; &nbsp;&#8984;K
        </span>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(180deg, #F59E0B, #D97706)' }}
        >
          <ArrowRight size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Recent Activity Widget                                             */
/* ------------------------------------------------------------------ */

function RecentActivityWidget() {
  return (
    <GlassCard className="flex h-full w-[284px] shrink-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Recent Activity</span>
        <ArrowUpRight size={16} className="text-white/65" />
      </div>
      <div className="flex flex-col gap-1.5">
        {ACTIVITIES.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2.5 rounded-xl bg-white/[.03] px-3 py-2.5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: a.dotColor }} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-xs font-medium text-white/85">{a.text}</span>
              <span className="text-[10px] text-white/40">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Recent Projects Widget                                             */
/* ------------------------------------------------------------------ */

function RecentProjectsWidget() {
  return (
    <GlassCard className="flex h-full flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Recent Projects</span>
        <span className="text-xs text-white/70">See All</span>
      </div>
      <div className="flex flex-col gap-2">
        {PROJECTS.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-white/[.12] px-3 py-2.5">
            {/* Avatar + label */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: p.avatarColor }} />
              <span className="text-[9px] text-white/50">Client</span>
            </div>
            {/* Name */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span className="truncate text-[13px] font-bold text-white">{p.name}</span>
            </div>
            {/* Photo count badge */}
            <div className="rounded bg-white/[.06] px-2.5 py-1">
              <span className="text-[13px] font-bold text-white/85">{p.photoCount}</span>
            </div>
            {/* Action button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <ArrowRight size={14} className="text-white" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Quick Stats Widget                                                 */
/* ------------------------------------------------------------------ */

function QuickStatsWidget() {
  return (
    <GlassCard className="flex h-full w-[239px] shrink-0 flex-col gap-3 p-4">
      <span className="text-sm font-semibold tracking-wide text-white/65">Quick Stats</span>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {STAT_RINGS.map((ring) => (
          <div key={ring.label} className="flex items-center justify-center">
            <ProgressRing ring={ring} />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/*  Mini Calendar Widget                                               */
/* ------------------------------------------------------------------ */

function CalendarWidget() {
  const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const days = Array.from({ length: 28 }, (_, i) => i + 1)
  const weeks = [days.slice(0, 7), days.slice(7, 14), days.slice(14, 21), days.slice(21, 28)]

  function dayStyle(d: number): string {
    if (CAL_SHOOT_DAYS.includes(d)) return 'bg-[#FBBF24] text-[#1A1A0A] font-bold'
    if (d === CAL_TODAY) return 'border-2 border-white/65 text-white font-bold'
    if (CAL_SCHEDULED_DAYS.includes(d)) return 'bg-white/[.13] text-white/80 font-semibold border border-white/[.19]'
    return 'text-white/35'
  }

  return (
    <GlassCardSmall className="flex h-full w-[283px] shrink-0 flex-col gap-1.5 px-4 pb-3 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white/[.93]">Upcoming shoots</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white/50">February</span>
          <ChevronDown size={12} className="text-white/40" />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg bg-white/[.06] p-[3px]">
          <div className="flex items-center gap-1 rounded-md bg-white/[.13] px-2 py-1">
            <CalendarDays size={12} className="text-white" />
            <span className="text-[10px] font-semibold text-white">Cal</span>
          </div>
          <div className="flex items-center gap-1 rounded-md px-2 py-1">
            <List size={12} className="text-white/50" />
            <span className="text-[10px] text-white/50">List</span>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex justify-between">
        {DAY_HEADERS.map((h, i) => (
          <span key={i} className="w-[22px] text-center text-[9px] font-semibold text-white/30">{h}</span>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="flex justify-between">
          {week.map((d) => (
            <div
              key={d}
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9px] ${dayStyle(d)}`}
            >
              {d}
            </div>
          ))}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full border-[1.5px] border-white/65" />
          <span className="text-[9px] text-white/40">Current day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-[#FBBF24]" />
          <span className="text-[9px] text-white/40">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full border border-white/[.19] bg-white/[.13]" />
          <span className="text-[9px] text-white/40">Scheduled</span>
        </div>
      </div>
    </GlassCardSmall>
  )
}

/* ------------------------------------------------------------------ */
/*  Project Deliveries Widget                                          */
/* ------------------------------------------------------------------ */

function ProjectDeliveriesWidget() {
  return (
    <GlassCardSmall className="flex h-full flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Project Deliveries</span>
        <span className="rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white">3 unpaid</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {DELIVERIES.map((d) => (
          <div
            key={d.id}
            className="flex flex-1 items-center gap-2.5 rounded-xl bg-white/[.08] p-3"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.dotColor }} />
            <span className="text-[13px] font-medium text-white">{d.client}</span>
            <span className="text-xs text-white/50">&rarr;</span>
            <span className="text-xs text-white/70">{d.gallery}</span>
            <div className="flex-1" />
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{
                color: d.statusColor,
                backgroundColor: `${d.statusColor}20`,
              }}
            >
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </GlassCardSmall>
  )
}

/* ------------------------------------------------------------------ */
/*  Inbox Widget                                                       */
/* ------------------------------------------------------------------ */

function InboxWidget() {
  return (
    <GlassCardSmall className="flex h-full w-[238px] shrink-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white/[.93]">Inbox</span>
          <span className="flex items-center justify-center rounded-full bg-[#FBBF24] px-[7px] py-0.5 text-[10px] font-bold text-[#1A1A0A]">
            3
          </span>
        </div>
        <span className="text-[11px] text-white/40">View all</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {INBOX.map((msg) => (
          <div key={msg.id} className="flex items-center gap-2.5 rounded-xl bg-white/[.04] px-2.5 py-2">
            <div className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: msg.avatarColor }} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={`text-[11px] ${msg.unread ? 'font-bold text-white' : 'font-semibold text-white/80'}`}>{msg.name}</span>
              <span className={`truncate text-[10px] ${msg.unread ? 'text-white/45' : 'text-white/35'}`}>{msg.preview}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-white/30">{msg.time}</span>
              {msg.unread && <div className="h-[7px] w-[7px] rounded-full bg-[#FBBF24]" />}
            </div>
          </div>
        ))}
      </div>
    </GlassCardSmall>
  )
}

/* ------------------------------------------------------------------ */
/*  To-do Panel (floating)                                             */
/* ------------------------------------------------------------------ */

function TodoPanel() {
  const [todos, setTodos] = useState(TODOS)
  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  return (
    <div
      className="absolute right-0 top-[230px] flex w-[322px] flex-col gap-5 rounded-3xl p-6 backdrop-blur-[40px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%), linear-gradient(180deg, rgba(255,255,255,0.19) 0%, transparent 30%)',
        border: '1px solid',
        borderImage:
          'linear-gradient(180deg, rgba(255,255,255,0.27) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.03) 100%) 1',
        boxShadow:
          '0 16px 48px -4px rgba(0,0,0,0.25), 0 2px 8px rgba(255,255,255,0.03), 0 1px 0 rgba(255,255,255,0.13)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white/[.93]">To-do List:</span>
        <span className="text-[28px] font-bold text-white/40">{completedCount}/{totalCount}</span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/[.08]" />

      {/* Task list */}
      <div className="flex flex-col gap-1">
        {todos.map((todo) => (
          <button
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
              todo.completed ? 'bg-white/[.04]' : 'bg-white/[.04] hover:bg-white/[.08]'
            }`}
          >
            {/* Icon circle */}
            <div
              className="h-9 w-9 shrink-0 rounded-full"
              style={{ backgroundColor: todo.color }}
            />
            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={`text-sm font-semibold ${todo.completed ? 'text-white/55' : 'text-white/[.93]'}`}>
                {todo.title}
              </span>
              <span className={`text-[11px] ${todo.completed ? 'text-white/25' : 'text-white/40'}`}>
                {todo.time}
              </span>
            </div>
            {/* Status circle */}
            <div
              className="h-7 w-7 shrink-0 rounded-full"
              style={{ backgroundColor: todo.completed ? 'rgba(255,255,255,0.06)' : `${todo.color}20` }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardV2Page() {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
      }}
    >
      {/* Radial highlight overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 20% 10%, rgba(255,255,255,0.07) 0%, transparent 100%)',
        }}
      />

      {/* Content stack */}
      <div className="relative flex min-h-screen flex-col">
        <TopNav activeNav="Dashboard" />

        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-8 md:px-10 lg:px-[85px]">
          <div className="relative mx-auto flex max-w-[1280px] flex-col gap-6">
            {/* Welcome / chat */}
            <WelcomeSection />

            {/* Row 1: Activity + Projects + Quick Stats */}
            <div className="flex h-[290px] gap-4">
              <RecentActivityWidget />
              <RecentProjectsWidget />
              <QuickStatsWidget />
            </div>

            {/* Row 2: Calendar + Deliveries + Inbox */}
            <div className="flex flex-1 gap-4">
              <CalendarWidget />
              <ProjectDeliveriesWidget />
              <InboxWidget />
            </div>

            {/* Floating To-do Panel */}
            <TodoPanel />
          </div>
        </main>
      </div>
    </div>
  )
}
