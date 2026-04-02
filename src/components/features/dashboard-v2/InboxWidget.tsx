'use client'

import { ArrowUpRight } from 'lucide-react'
import { GlassPanel } from './GlassPanel'

const messages = [
  {
    avatar: 'bg-violet-600',
    name: 'Sarah Mitchell',
    preview: 'Hey, I got the proofs back! They look amazing...',
    time: '2m',
    unread: true,
  },
  {
    avatar: 'bg-rose-600',
    name: 'James & Lily W.',
    preview: 'Can we reschedule to the 20th? We have a...',
    time: '18m',
    unread: true,
  },
  {
    avatar: 'bg-amber-500',
    name: 'TechCorp Inc.',
    preview: 'The brand photos are exactly what we needed!',
    time: '2h',
    unread: false,
  },
  {
    avatar: 'bg-teal-600',
    name: 'Miller Family',
    preview: "Thank you so much for yesterday's session!",
    time: '1d',
    unread: false,
  },
]

export function InboxWidget() {
  return (
    <GlassPanel variant="subtle" className="flex h-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white/[0.93]">Inbox</span>
          <div className="flex items-center justify-center rounded-[10px] bg-amber-400 px-[7px] py-0.5">
            <span className="text-[10px] font-bold text-[#1A1A0A]">3</span>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-white/[0.67]" />
      </div>

      {/* Message List */}
      <div className="flex flex-1 flex-col gap-0.5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-2.5 py-2"
          >
            <div className={`h-8 w-8 shrink-0 rounded-full ${msg.avatar}`} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={`text-[11px] ${msg.unread ? 'font-bold text-white' : 'font-semibold text-white/80'}`}>
                {msg.name}
              </span>
              <span className={`truncate text-[10px] ${msg.unread ? 'text-white/[0.44]' : 'text-white/[0.33]'}`}>
                {msg.preview}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-white/[0.31]">{msg.time}</span>
              {msg.unread && (
                <div className="h-[7px] w-[7px] rounded-full bg-amber-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
