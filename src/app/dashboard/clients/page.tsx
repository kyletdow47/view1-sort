'use client'

import {
  ChevronDown,
  GripVertical,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const columns = [
  {
    title: 'Inquiry', dot: 'bg-blue-400',
    clients: [
      { name: 'Sarah Mitchell', project: 'Wedding', date: 'Jul 14, 2026', color: 'bg-rose-500' },
      { name: 'James Turner', project: 'Real Estate', color: 'bg-emerald-500' },
      { name: 'Priya Patel', project: 'Commercial Event', color: 'bg-red-500' },
    ],
  },
  {
    title: 'Quoted', dot: 'bg-amber-400',
    clients: [
      { name: 'Emma Chen', project: 'Engagement Session', color: 'bg-pink-500' },
      { name: 'David Park', project: 'Family Portraits', color: 'bg-orange-500' },
    ],
  },
  {
    title: 'Booked', dot: 'bg-emerald-400',
    clients: [
      { name: 'Olivia Reed', project: 'Wedding', color: 'bg-teal-500' },
      { name: 'Noah Williams', project: 'Family Reunion', color: 'bg-violet-500' },
    ],
  },
  {
    title: 'Shooting', dot: 'bg-violet-400',
    clients: [
      { name: 'Ava Johnson', project: 'Commercial Shoot', color: 'bg-cyan-500' },
    ],
  },
  {
    title: 'Delivered', dot: 'bg-sky-400',
    clients: [
      { name: 'Liam Brown', project: 'Photography', color: 'bg-lime-500' },
    ],
  },
  {
    title: 'Paid', dot: 'bg-green-500',
    clients: [
      { name: 'Isabella Davis', project: 'Senior Portraits', color: 'bg-indigo-500' },
      { name: 'Mason Wilson', project: 'Corporate Headshots', color: 'bg-blue-600' },
    ],
  },
]

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ClientsPage() {
  return (
    <V2Shell activeNav="Clients">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold text-white">Clients</h1>
            <p className="mt-1 text-sm text-white/60">Manage your client pipeline and relationships</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              <Users className="h-4 w-4" /> Kanban
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              <Plus className="h-4 w-4" /> New Client
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input type="text" placeholder="Search clients..." className="w-full rounded-xl border border-white/15 bg-white/8 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm text-white/60 hover:text-white">All Stages <ChevronDown className="h-3.5 w-3.5" /></button>
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm text-white/60 hover:text-white">Last Activity <ChevronDown className="h-3.5 w-3.5" /></button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.title} className="min-w-[220px] flex-1">
              <GlassCard noPad className="h-full">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-white">{col.title}</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">{col.clients.length}</span>
                </div>
                <div className="space-y-2 p-2">
                  {col.clients.map((client) => (
                    <div key={client.name} className="group flex items-start gap-2.5 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className={`h-8 w-8 shrink-0 rounded-full ${client.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{client.name}</p>
                        <p className="text-[11px] text-white/50 truncate">{client.project}</p>
                        {client.date && <p className="mt-1 text-[10px] text-white/30">{client.date}</p>}
                      </div>
                      <GripVertical className="h-3.5 w-3.5 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </V2Shell>
  )
}
