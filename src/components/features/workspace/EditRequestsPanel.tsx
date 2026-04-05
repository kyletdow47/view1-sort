'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  MessageSquare,
  MoreHorizontal,
  Package,
  Plus,
  Send,
} from 'lucide-react'

/* ─── Types ───────────────────────────────────────────────────────────────── */

type RequestStatus = 'requested' | 'priced' | 'in_progress' | 'delivered'

interface EditRequest {
  id: string
  clientName: string
  photoTitle: string
  description: string
  status: RequestStatus
  requestedAt: string
  price: number | null
  approvedAt: string | null
  deliveredAt: string | null
}

/* ─── Mock data ───────────────────────────────────────────────────────────── */

const MOCK_REQUESTS: EditRequest[] = [
  {
    id: 'er-001',
    clientName: 'Sarah & James Smith',
    photoTitle: 'Reception First Dance #42',
    description: 'Can you brighten the background and make the colors warmer? The venue lights made it look a bit cold.',
    status: 'requested',
    requestedAt: 'Apr 3, 2026',
    price: null,
    approvedAt: null,
    deliveredAt: null,
  },
  {
    id: 'er-002',
    clientName: 'Meridian Hotel',
    photoTitle: 'Lobby Hero Shot',
    description: 'Please remove the reflection on the marble floor near the entrance.',
    status: 'priced',
    requestedAt: 'Apr 1, 2026',
    price: 45,
    approvedAt: null,
    deliveredAt: null,
  },
  {
    id: 'er-003',
    clientName: 'Elena Torres',
    photoTitle: 'Outdoor Portrait Series #7',
    description: 'Add a little more sky detail and tone down the highlights on my face.',
    status: 'in_progress',
    requestedAt: 'Mar 28, 2026',
    price: 25,
    approvedAt: 'Mar 29, 2026',
    deliveredAt: null,
  },
  {
    id: 'er-004',
    clientName: 'Chen Family',
    photoTitle: 'Family Group Shot',
    description: 'Please crop tighter and make it landscape orientation for printing.',
    status: 'delivered',
    requestedAt: 'Mar 20, 2026',
    price: 15,
    approvedAt: 'Mar 21, 2026',
    deliveredAt: 'Mar 23, 2026',
  },
  {
    id: 'er-005',
    clientName: 'Marcus Cole',
    photoTitle: 'Product Flat Lay #3',
    description: 'Remove the small scratch visible on the left side of the product.',
    status: 'delivered',
    requestedAt: 'Mar 15, 2026',
    price: 35,
    approvedAt: 'Mar 16, 2026',
    deliveredAt: 'Mar 17, 2026',
  },
]

/* ─── Status config ───────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  requested: { label: 'Requested', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', icon: MessageSquare },
  priced: { label: 'Awaiting Approval', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', icon: DollarSign },
  in_progress: { label: 'In Progress', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: Edit3 },
  delivered: { label: 'Delivered', color: '#34D399', bg: 'rgba(52,211,153,0.12)', icon: CheckCircle2 },
}

const STATUS_ORDER: RequestStatus[] = ['requested', 'priced', 'in_progress', 'delivered']

/* ─── Subcomponents ───────────────────────────────────────────────────────── */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.11)',
      }}
    >
      {children}
    </div>
  )
}

interface PriceModalProps {
  request: EditRequest
  onClose: () => void
  onSave: (id: string, price: number) => void
}

function PriceModal({ request, onClose, onSave }: PriceModalProps) {
  const [price, setPrice] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <GlassCard className="w-full max-w-sm p-6">
        <h3 className="mb-1 text-[15px] font-semibold text-white">Set Edit Price</h3>
        <p className="mb-4 text-[12px] text-white/50">{request.photoTitle}</p>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[14px] font-semibold text-white/60">$</span>
          <input
            type="number"
            min="0"
            step="5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-[14px] font-mono text-white placeholder-white/30 outline-none focus:border-white/30"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[12px] text-white/50 transition-colors hover:text-white/80"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const n = parseFloat(price)
              if (!isNaN(n) && n >= 0) onSave(request.id, n)
            }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
          >
            <Send className="h-3 w-3" />
            Send for Approval
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────────────── */

interface EditRequestsPanelProps {
  projectId?: string
}

export function EditRequestsPanel({ projectId: _projectId }: EditRequestsPanelProps) {
  const [requests, setRequests] = useState<EditRequest[]>(MOCK_REQUESTS)
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all')
  const [pricingRequest, setPricingRequest] = useState<EditRequest | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus)

  const countByStatus = (status: RequestStatus) => requests.filter((r) => r.status === status).length

  function handleSetPrice(id: string, price: number) {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'priced' as RequestStatus, price } : r)
    )
    setPricingRequest(null)
  }

  function handleMarkInProgress(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'in_progress' as RequestStatus } : r))
    setOpenMenu(null)
  }

  function handleMarkDelivered(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'delivered' as RequestStatus, deliveredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : r
      )
    )
    setOpenMenu(null)
  }

  const totalPending = requests.filter((r) => r.status !== 'delivered').length
  const totalRevenue = requests.filter((r) => r.price !== null && r.status === 'delivered').reduce((s, r) => s + (r.price ?? 0), 0)

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-white">Edit Requests</h2>
          <p className="mt-0.5 text-[12px] text-white/40">
            {totalPending} pending · ${totalRevenue} earned from completed edits
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Request
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {STATUS_ORDER.map((status) => {
          const cfg = STATUS_CONFIG[status]
          const Icon = cfg.icon
          return (
            <GlassCard key={status} className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
                <Icon className="h-4 w-4" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="font-mono text-[20px] font-bold leading-none text-white">{countByStatus(status)}</p>
                <p className="mt-0.5 text-[10px] text-white/45">{cfg.label}</p>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-1 self-start rounded-2xl p-1"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        {(['all', ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-xl px-3 py-1.5 text-[12px] font-medium transition-colors ${
              filterStatus === s ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Client', 'Photo / Description', 'Status', 'Price', 'Requested', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/35"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[13px] text-white/30">
                  No edit requests
                </td>
              </tr>
            ) : (
              filtered.map((req) => {
                const cfg = STATUS_CONFIG[req.status]
                const Icon = cfg.icon
                return (
                  <tr
                    key={req.id}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* Client */}
                    <td className="px-5 py-3.5">
                      <p className="text-[12px] font-medium text-white/80">{req.clientName}</p>
                    </td>

                    {/* Photo + description */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-[12px] font-medium text-white/80">{req.photoTitle}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-white/40">{req.description}</p>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5">
                      {req.price !== null ? (
                        <span className="font-mono text-[13px] font-semibold text-white/80">${req.price}</span>
                      ) : (
                        <span className="text-[11px] text-white/30">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 font-mono text-[11px] text-white/40">{req.requestedAt}</td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === req.id ? null : req.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openMenu === req.id && (
                          <div
                            className="absolute right-0 z-10 mt-1 w-44 rounded-xl py-1"
                            style={{ background: 'rgba(20,18,40,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}
                          >
                            {req.status === 'requested' && (
                              <button
                                onClick={() => { setPricingRequest(req); setOpenMenu(null) }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
                              >
                                <Package className="h-3.5 w-3.5" />
                                Set Price & Send
                              </button>
                            )}
                            {req.status === 'priced' && (
                              <button
                                onClick={() => handleMarkInProgress(req.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Mark In Progress
                              </button>
                            )}
                            {req.status === 'in_progress' && (
                              <button
                                onClick={() => handleMarkDelivered(req.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Delivered
                              </button>
                            )}
                            <button
                              onClick={() => setOpenMenu(null)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white/70"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              View History
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </GlassCard>

      {/* Price modal */}
      {pricingRequest && (
        <PriceModal
          request={pricingRequest}
          onClose={() => setPricingRequest(null)}
          onSave={handleSetPrice}
        />
      )}
    </div>
  )
}
