'use client'

import { useState } from 'react'
import { Plus, SlidersHorizontal, Columns } from 'lucide-react'

export interface ClientKanbanItem {
  email: string
  displayName: string
  shootType: string
  price: string
  stage: 'inquiry' | 'contacted' | 'booked' | 'shooting' | 'delivered' | 'paid'
}

const COLUMNS: {
  key: ClientKanbanItem['stage']
  label: string
  color: string
  dotColor: string
}[] = [
  { key: 'inquiry',   label: 'Inquiry',   color: 'rgba(255,255,255,0.08)',  dotColor: '#94A3B8' },
  { key: 'contacted', label: 'Contacted', color: 'rgba(96,165,250,0.15)',   dotColor: '#60A5FA' },
  { key: 'booked',    label: 'Booked',    color: 'rgba(167,139,250,0.15)',  dotColor: '#A78BFA' },
  { key: 'shooting',  label: 'Shooting',  color: 'rgba(251,191,36,0.15)',   dotColor: '#FBBF24' },
  { key: 'delivered', label: 'Delivered', color: 'rgba(52,211,153,0.15)',   dotColor: '#34D399' },
  { key: 'paid',      label: 'Paid',      color: 'rgba(52,211,153,0.25)',   dotColor: '#10B981' },
]

const GRADIENTS = [
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-indigo-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-green-600',
]

function getGradient(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]!
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function ClientCard({ client }: { client: ClientKanbanItem }) {
  const grad = getGradient(client.email)
  const initials = getInitials(client.displayName)

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl p-3 transition-colors hover:bg-white/10 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-[11px] font-bold text-white`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white/90">{client.displayName}</p>
        <p className="truncate text-[11px] text-white/40">{client.shootType}</p>
      </div>
      {client.price && (
        <span className="shrink-0 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
          {client.price}
        </span>
      )}
    </div>
  )
}

const MOCK_CLIENTS: ClientKanbanItem[] = [
  { email: 'sarah.mitchell@gmail.com',  displayName: 'Sarah Mitchell',      shootType: 'Wedding · June 13th',     price: '$2.5k',  stage: 'booked'    },
  { email: 'james.priya@outlook.com',   displayName: 'James & Priya',        shootType: 'Engagement Session',       price: '$900',   stage: 'booked'    },
  { email: 'marcus.cole@gmail.com',     displayName: 'Marcus Cole',          shootType: 'Commercial Shoot',         price: '$1.5k',  stage: 'inquiry'   },
  { email: 'elena.torres@icloud.com',   displayName: 'Elena Torres',         shootType: 'Portrait Session',         price: '$350',   stage: 'contacted' },
  { email: 'ryan.nguyen@gmail.com',     displayName: 'Ryan & Ashley Nguyen', shootType: 'Wedding · Sept 20th',      price: '$3.2k',  stage: 'shooting'  },
  { email: 'lisa.patel@yahoo.com',      displayName: 'Lisa Patel',           shootType: 'Newborn Session',          price: '$400',   stage: 'delivered' },
  { email: 'alex.kim@gmail.com',        displayName: 'Alex Kim',             shootType: 'Branding Shoot',           price: '$800',   stage: 'paid'      },
  { email: 'carter.brown@outlook.com',  displayName: 'Carter & Olivia',      shootType: 'Elopement',                price: '$1.8k',  stage: 'inquiry'   },
  { email: 'priya.sharma@gmail.com',    displayName: 'Priya Sharma',         shootType: 'Mini Session',             price: '$150',   stage: 'contacted' },
  { email: 'tom.wilson@icloud.com',     displayName: 'Tom Wilson',           shootType: 'Corporate Headshots',      price: '$600',   stage: 'paid'     },
]

interface ClientsKanbanViewProps {
  clients: ClientKanbanItem[]
}

export function ClientsKanbanView({ clients }: ClientsKanbanViewProps) {
  const [filterStage, setFilterStage] = useState<string>('All')
  const displayClients = clients.length > 0 ? clients : MOCK_CLIENTS

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-[18px] font-bold text-white">Clients</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
            <Columns className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Client
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex flex-1 gap-3 overflow-x-auto px-6 py-4">
        {COLUMNS.map((col) => {
          const colClients = displayClients.filter((c) => c.stage === col.key)
          return (
            <div
              key={col.key}
              className="flex w-[200px] shrink-0 flex-col gap-2 rounded-2xl p-3"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1 py-0.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: col.dotColor }} />
                  <span className="text-[12px] font-semibold text-white/80">{col.label}</span>
                </div>
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white/60"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                >
                  {colClients.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {colClients.length > 0 ? (
                  colClients.map((client) => (
                    <ClientCard key={client.email} client={client} />
                  ))
                ) : (
                  <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10">
                    <span className="text-[11px] text-white/20">No clients</span>
                  </div>
                )}
              </div>

              {/* Add button */}
              <button className="flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] text-white/30 transition-colors hover:bg-white/05 hover:text-white/60">
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
