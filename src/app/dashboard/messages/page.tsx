'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Circle,
  CheckCheck,
  Clock,
  Image as ImageIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const THREADS = [
  {
    id: '1',
    name: 'Sarah & Tom Smith',
    project: 'Smith Wedding',
    avatar: 'from-rose-400 to-pink-600',
    initials: 'SS',
    lastMessage: 'Can we review the final gallery together?',
    time: '2m ago',
    unread: 3,
    online: true,
  },
  {
    id: '2',
    name: 'James Wilson',
    project: 'Meridian Hotel Brand',
    avatar: 'from-violet-400 to-purple-600',
    initials: 'JW',
    lastMessage: 'Payment sent — thank you so much!',
    time: '1h ago',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Emily Chen',
    project: 'Engagement Session',
    avatar: 'from-amber-400 to-orange-500',
    initials: 'EC',
    lastMessage: 'The photos are absolutely stunning 😍',
    time: '3h ago',
    unread: 1,
    online: true,
  },
  {
    id: '4',
    name: 'Alex Torres',
    project: 'Corporate Event',
    avatar: 'from-emerald-400 to-teal-600',
    initials: 'AT',
    lastMessage: 'Can you send the edited headshots?',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: '5',
    name: 'Maria & Luis Perez',
    project: 'Family Portraits',
    avatar: 'from-sky-400 to-blue-600',
    initials: 'MP',
    lastMessage: 'We loved working with you!',
    time: '2d ago',
    unread: 0,
    online: false,
  },
]

const MESSAGES: Record<string, { id: string; from: 'me' | 'client'; text: string; time: string }[]> = {
  '1': [
    { id: 'm1', from: 'client', text: 'Hi! We just got the notification that the gallery is ready.', time: '10:12 AM' },
    { id: 'm2', from: 'me', text: "Yes! I just published it. You should have received an email with the link. Let me know what you think!", time: '10:15 AM' },
    { id: 'm3', from: 'client', text: 'We just looked through — these are absolutely gorgeous. You captured everything perfectly.', time: '10:31 AM' },
    { id: 'm4', from: 'me', text: "That means so much, thank you! I'll have the full resolution downloads ready in 24 hours.", time: '10:33 AM' },
    { id: 'm5', from: 'client', text: 'Can we review the final gallery together?', time: '10:47 AM' },
  ],
  '2': [
    { id: 'm1', from: 'me', text: 'Hi James, the brand shoot deliverables are ready. I\'ve uploaded everything to your gallery.', time: 'Yesterday 2:10 PM' },
    { id: 'm2', from: 'client', text: 'Payment sent — thank you so much!', time: 'Yesterday 4:22 PM' },
  ],
  '3': [
    { id: 'm1', from: 'client', text: 'Hi! We just finished looking through all the photos.', time: '9:00 AM' },
    { id: 'm2', from: 'client', text: 'The photos are absolutely stunning 😍', time: '9:01 AM' },
  ],
  '4': [
    { id: 'm1', from: 'client', text: 'Can you send the edited headshots?', time: 'Yesterday 11:30 AM' },
  ],
  '5': [
    { id: 'm1', from: 'client', text: 'We loved working with you!', time: '2 days ago' },
  ],
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function MessagesPage() {
  const [activeThread, setActiveThread] = useState('1')
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [messages, setMessages] = useState(MESSAGES)

  const thread = THREADS.find((t) => t.id === activeThread)!
  const threadMessages = messages[activeThread] ?? []

  const filtered = THREADS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()),
  )

  function sendMessage() {
    if (!input.trim()) return
    setMessages((prev) => ({
      ...prev,
      [activeThread]: [
        ...(prev[activeThread] ?? []),
        { id: `m${Date.now()}`, from: 'me', text: input.trim(), time: 'Just now' },
      ],
    }))
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-96px)] gap-4 overflow-hidden">
      {/* ── Sidebar: thread list ── */}
      <GlassCard noPad className="flex w-72 shrink-0 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/[0.08] p-4">
          <h1 className="mb-3 font-headline text-base font-semibold text-white">Messages</h1>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.07] px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>
        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={`flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition-colors hover:bg-white/[0.05] ${
                activeThread === t.id ? 'bg-white/[0.08]' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.avatar} text-[10px] font-bold text-white`}>
                  {t.initials}
                </div>
                {t.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white/10 bg-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-semibold text-white">{t.name}</span>
                  <span className="shrink-0 text-[10px] text-white/30">{t.time}</span>
                </div>
                <p className="truncate text-[11px] text-white/50">{t.project}</p>
                <p className="truncate text-[11px] text-white/40">{t.lastMessage}</p>
              </div>
              {t.unread > 0 && (
                <span className="mt-1 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
                  {t.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ── Main: message thread ── */}
      <GlassCard noPad className="flex flex-1 flex-col overflow-hidden">
        {/* Thread header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${thread.avatar} text-[10px] font-bold text-white`}>
              {thread.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{thread.name}</p>
              <p className="text-[11px] text-white/40">{thread.project}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-white/40 hover:bg-white/[0.07] hover:text-white">
              <ImageIcon className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 text-white/40 hover:bg-white/[0.07] hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {threadMessages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
              {msg.from === 'client' && (
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${thread.avatar} text-[9px] font-bold text-white`}>
                  {thread.initials}
                </div>
              )}
              <div className={`max-w-[65%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.from === 'me'
                  ? 'rounded-br-sm bg-indigo-600 text-white'
                  : 'rounded-bl-sm bg-white/[0.1] text-white/90'
              }`}>
                {msg.text}
                <div className={`mt-1 flex items-center gap-1 text-[10px] ${msg.from === 'me' ? 'justify-end text-white/50' : 'text-white/30'}`}>
                  {msg.time}
                  {msg.from === 'me' && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.07] px-4 py-2.5">
            <button className="text-white/40 hover:text-white">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
