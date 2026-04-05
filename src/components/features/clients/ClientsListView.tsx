'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ClientRecord, ClientSortKey, SortDirection } from '@/types/clients'

/* ------------------------------------------------------------------ */
/*  Stage badge helper                                                 */
/* ------------------------------------------------------------------ */

const STAGE_COLORS: Record<string, string> = {
  inquiry:   'bg-slate-400/15 text-slate-400',
  quoted:    'bg-blue-400/15 text-blue-400',
  booked:    'bg-violet-400/15 text-violet-400',
  shooting:  'bg-amber-400/15 text-amber-400',
  delivered: 'bg-teal-400/15 text-teal-400',
  paid:      'bg-emerald-400/15 text-emerald-400',
}

const STAGE_LABELS: Record<string, string> = {
  inquiry:   'Inquiry',
  quoted:    'Quoted',
  booked:    'Booked',
  shooting:  'Shooting',
  delivered: 'Delivered',
  paid:      'Paid',
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Column header with sort                                            */
/* ------------------------------------------------------------------ */

interface SortHeaderProps {
  label: string
  sortKey: ClientSortKey
  activeSortKey: ClientSortKey
  direction: SortDirection
  onSort: (key: ClientSortKey) => void
  align?: 'left' | 'right'
}

function SortHeader({
  label,
  sortKey,
  activeSortKey,
  direction,
  onSort,
  align = 'left',
}: SortHeaderProps) {
  const isActive = activeSortKey === sortKey
  const Icon = isActive ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <th
      className={`pb-3 pr-4 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium transition-colors ${
          isActive ? 'text-white/70' : 'text-white/30 hover:text-white/50'
        }`}
      >
        {label}
        <Icon className="h-3 w-3 shrink-0" />
      </button>
    </th>
  )
}

/* ------------------------------------------------------------------ */
/*  ClientsListView                                                    */
/* ------------------------------------------------------------------ */

interface ClientsListViewProps {
  clients: ClientRecord[]
  searchQuery: string
}

export function ClientsListView({ clients, searchQuery }: ClientsListViewProps) {
  const [sortKey, setSortKey] = useState<ClientSortKey>('displayName')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const handleSort = (key: ClientSortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let rows = [...clients]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      rows = rows.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.shootType.toLowerCase().includes(q),
      )
    }

    // Sort
    rows.sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      switch (sortKey) {
        case 'displayName':
          valA = a.displayName.toLowerCase()
          valB = b.displayName.toLowerCase()
          break
        case 'stage':
          valA = a.stage
          valB = b.stage
          break
        case 'shootDate':
          valA = a.shootDate ?? ''
          valB = b.shootDate ?? ''
          break
        case 'price':
          // Parse "$2.5k" → 2500, "$900" → 900
          valA = parsePriceCents(a.price)
          valB = parsePriceCents(b.price)
          break
        case 'projectCount':
          valA = a.projectCount ?? 0
          valB = b.projectCount ?? 0
          break
        case 'lastActive':
          valA = a.lastActive ?? ''
          valB = b.lastActive ?? ''
          break
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [clients, searchQuery, sortKey, sortDir])

  return (
    <div className="flex-1 overflow-auto px-6 py-4">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="pl-5 pr-4 pb-3 pt-4 text-left">
                  <span className="text-[10px] uppercase tracking-widest font-medium text-white/30">
                    Client
                  </span>
                </th>
                <SortHeader
                  label="Stage"
                  sortKey="stage"
                  activeSortKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Shoot Type"
                  sortKey="shootDate"
                  activeSortKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Projects"
                  sortKey="projectCount"
                  activeSortKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="Value"
                  sortKey="price"
                  activeSortKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="Last Active"
                  sortKey="lastActive"
                  activeSortKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
                <th className="pb-3 pr-5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const grad = getGradient(client.email)
                const initials = getInitials(client.displayName)
                const stageColor = STAGE_COLORS[client.stage] ?? 'bg-white/10 text-white/50'
                const stageLabel = STAGE_LABELS[client.stage] ?? client.stage

                return (
                  <tr
                    key={client.id}
                    className="group transition-colors hover:bg-white/[0.04]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* Client name + email */}
                    <td className="pl-5 pr-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-[10px] font-bold text-white`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-white/90">
                            {client.displayName}
                          </p>
                          <p className="truncate text-[11px] text-white/35">{client.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="pr-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${stageColor}`}
                      >
                        {stageLabel}
                      </span>
                    </td>

                    {/* Shoot type */}
                    <td className="pr-4 py-3.5">
                      <p className="text-[12px] text-white/55 truncate max-w-[180px]">
                        {client.shootType}
                      </p>
                    </td>

                    {/* Projects */}
                    <td className="pr-4 py-3.5 text-right">
                      <span className="text-[13px] font-medium text-white/70 font-mono">
                        {client.projectCount ?? '—'}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="pr-4 py-3.5 text-right">
                      <span className="text-[13px] font-semibold text-emerald-300">
                        {client.price || '—'}
                      </span>
                    </td>

                    {/* Last active */}
                    <td className="pr-4 py-3.5">
                      <span className="text-[12px] text-white/35 font-mono">
                        {client.lastActive
                          ? new Date(client.lastActive).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pr-5 py-3.5">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10 hover:text-white/70"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-white/30">
                {searchQuery ? `No clients matching "${searchQuery}"` : 'No clients yet'}
              </p>
            </div>
          )}
        </div>

        {/* Footer row count */}
        {filtered.length > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[11px] text-white/25">
              {filtered.length} {filtered.length === 1 ? 'client' : 'clients'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parsePriceCents(price: string): number {
  if (!price) return 0
  const cleaned = price.replace(/[$,\s]/g, '').toLowerCase()
  if (cleaned.endsWith('k')) return parseFloat(cleaned) * 1000
  return parseFloat(cleaned) || 0
}
