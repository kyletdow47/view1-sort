'use client'

import { useState } from 'react'
import {
  Eye,
  DollarSign,
  Sparkles,
  FileText,
  CheckCircle2,
  Bell,
  Check,
} from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Types & Data ───────────────────────────────────────────────────────── */

type NotifType = 'gallery_viewed' | 'payment' | 'ai_sort' | 'edit_request' | 'contract_signed'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; accent: string; dot: string }> = {
  gallery_viewed:  { icon: Eye,           accent: 'bg-sky-500/15 text-sky-400 border-sky-500/20',            dot: 'bg-sky-400' },
  payment:         { icon: DollarSign,    accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  ai_sort:         { icon: Sparkles,      accent: 'bg-violet-500/15 text-violet-400 border-violet-500/20',    dot: 'bg-violet-400' },
  edit_request:    { icon: FileText,      accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400' },
  contract_signed: { icon: CheckCircle2,  accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
}

const INITIAL: Notification[] = [
  { id: 'n1', type: 'gallery_viewed',  title: 'Sarah Mitchell viewed your gallery',      body: 'Smith Wedding — gallery opened, 47 photos favorited.',           time: '2 minutes ago', read: false },
  { id: 'n2', type: 'payment',         title: 'Payment received — $1,200',               body: 'James Wilson paid Invoice #INV-048 in full.',                    time: '1 hour ago',    read: false },
  { id: 'n3', type: 'ai_sort',         title: 'AI Sort complete — Johnson Wedding',       body: '1,247 photos sorted → 420 selects across 8 categories.',        time: '3 hours ago',   read: false },
  { id: 'n4', type: 'edit_request',    title: 'New edit request from Emily Chen',         body: 'Chen Engagement — 3 photos flagged for color correction.',       time: 'Yesterday',     read: true  },
  { id: 'n5', type: 'contract_signed', title: 'Contract signed — Torres Portrait',        body: 'Alex Torres signed the Photography Services Agreement.',         time: 'Yesterday',     read: true  },
  { id: 'n6', type: 'gallery_viewed',  title: 'Corporate Event gallery shared',           body: 'You shared the Meridian Hotel gallery. 2 clients notified.',    time: '2 days ago',    read: true  },
  { id: 'n7', type: 'payment',         title: 'Payout processed — $3,200',               body: 'Stripe payout to your bank account completed.',                  time: '3 days ago',    read: true  },
  { id: 'n8', type: 'ai_sort',         title: 'AI Sort complete — Oak Street Product',    body: '156 photos sorted → 82 selects.',                               time: '4 days ago',    read: true  },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const visible = notifications.filter((n) => (filter === 'unread' ? !n.read : true))

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white/[0.07] p-1">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-white/[0.13] text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-white/60 hover:text-white transition-colors"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => {
            const cfg = TYPE_CONFIG[n.type]
            const Icon = cfg.icon
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`group flex w-full items-start gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                  n.read
                    ? 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'
                    : 'border-white/[0.12] bg-white/[0.07] hover:bg-white/[0.09]'
                }`}
              >
                <div className={`mt-1 h-8 w-0.5 shrink-0 rounded-full ${n.read ? 'bg-white/10' : cfg.dot}`} />
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${cfg.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.read ? 'text-white/70' : 'font-semibold text-white'}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">{n.body}</p>
                  <p className="mt-1 text-[11px] text-white/30">{n.time}</p>
                </div>
                {!n.read && (
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
