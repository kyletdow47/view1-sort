'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  FileText,
  Plus,
  Eye,
  Send,
  Copy,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Filter,
} from 'lucide-react'
import { InvoiceCreator } from '@/components/features/finances/InvoiceCreator'
import type { InvoiceFormData } from '@/types/invoice'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ExtendedInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface ClientInvoice {
  id: string
  number: string
  date: string      // ISO YYYY-MM-DD
  dueDate: string   // ISO YYYY-MM-DD
  project: string
  amount: number    // in dollars (display value)
  status: ExtendedInvoiceStatus
}

export interface ClientDetailInvoicesTabProps {
  /** Pre-populates the InvoiceCreator with client info */
  clientName?: string
  clientEmail?: string
  /** Mock invoices — replace with Supabase query when tables exist */
  invoices?: ClientInvoice[]
}

/* ─── Mock data (TODO: replace with Supabase query) ────────────────────── */

const MOCK_INVOICES: ClientInvoice[] = [
  { id: 'inv-001', number: 'V1-2025-042', date: '2025-04-14', dueDate: '2025-04-28', project: 'Engagement Shoot — Central Park',         amount: 650,  status: 'paid' },
  { id: 'inv-002', number: 'V1-2025-067', date: '2025-06-30', dueDate: '2025-07-14', project: 'Wedding Day — The Plaza Hotel',           amount: 2400, status: 'paid' },
  { id: 'inv-003', number: 'V1-2025-089', date: '2025-07-12', dueDate: '2025-07-26', project: 'Maternity Shoot — Botanical Garden',      amount: 600,  status: 'paid' },
  { id: 'inv-004', number: 'V1-2025-101', date: '2025-08-21', dueDate: '2025-09-04', project: 'Newborn Session — Home Studio',           amount: 800,  status: 'paid' },
  { id: 'inv-005', number: 'V1-2025-115', date: '2025-09-07', dueDate: '2025-09-21', project: 'Family Portraits — Riverside',            amount: 450,  status: 'paid' },
  { id: 'inv-006', number: 'V1-2025-134', date: '2025-11-04', dueDate: '2025-11-18', project: 'Corporate Headshots — Mitchell & Co',     amount: 350,  status: 'paid' },
  { id: 'inv-007', number: 'V1-2025-156', date: '2025-12-16', dueDate: '2025-12-30', project: 'Holiday Mini Session',                   amount: 250,  status: 'paid' },
  { id: 'inv-008', number: 'V1-2026-012', date: '2026-02-10', dueDate: '2026-02-24', project: 'Anniversary Portraits — Brooklyn Bridge', amount: 550,  status: 'paid' },
  { id: 'inv-009', number: 'V1-2026-031', date: '2026-03-24', dueDate: '2026-04-07', project: 'Spring Family Session',                  amount: 500,  status: 'sent' },
  { id: 'inv-010', number: 'V1-2026-035', date: '2026-03-01', dueDate: '2026-03-15', project: 'Retouching Add-on — Wedding',            amount: 200,  status: 'overdue' },
  { id: 'inv-011', number: 'V1-2026-038', date: '2026-04-01', dueDate: '2026-04-15', project: 'Summer Preview Edit',                   amount: 150,  status: 'draft' },
]

/* ─── Status config ─────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ExtendedInvoiceStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  draft:   { label: 'Draft',   badge: 'bg-zinc-500/20 text-zinc-400',    icon: FileText },
  sent:    { label: 'Sent',    badge: 'bg-blue-500/15 text-blue-400',     icon: Send },
  paid:    { label: 'Paid',    badge: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle2 },
  overdue: { label: 'Overdue', badge: 'bg-red-500/15 text-red-400',       icon: AlertCircle },
}

type StatusFilter = ExtendedInvoiceStatus | 'all'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'draft',   label: 'Draft' },
  { value: 'sent',    label: 'Sent' },
  { value: 'paid',    label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

/* ─── Helper ─────────────────────────────────────────────────────────────── */

function fmt(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ─── Action Menu (per-row dropdown) ────────────────────────────────────── */

interface ActionMenuProps {
  invoiceId: string
  status: ExtendedInvoiceStatus
  open: boolean
  onOpen: (id: string) => void
  onClose: () => void
  onAction: (action: 'view' | 'send_reminder' | 'duplicate', id: string) => void
}

function ActionMenu({ invoiceId, status, open, onOpen, onClose, onAction }: ActionMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); open ? onClose() : onOpen(invoiceId) }}
        className="rounded-lg p-1.5 text-on-surface/25 hover:text-on-surface/60 hover:bg-on-surface/5 transition-colors"
        aria-label="Invoice actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-outline-variant/40 bg-surface-container shadow-xl shadow-black/30 overflow-hidden">
          <button
            onClick={() => { onAction('view', invoiceId); onClose() }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface transition-colors"
          >
            <Eye size={14} className="shrink-0" />
            View Invoice
          </button>
          {status !== 'paid' && (
            <button
              onClick={() => { onAction('send_reminder', invoiceId); onClose() }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface transition-colors"
            >
              <Send size={14} className="shrink-0" />
              Send Reminder
            </button>
          )}
          <button
            onClick={() => { onAction('duplicate', invoiceId); onClose() }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface transition-colors"
          >
            <Copy size={14} className="shrink-0" />
            Duplicate
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function ClientDetailInvoicesTab({
  clientName,
  clientEmail,
  invoices = MOCK_INVOICES,
}: ClientDetailInvoicesTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [invoiceCreatorOpen, setInvoiceCreatorOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  /* ── Filtering ─────────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      if (dateFrom && inv.date < dateFrom) return false
      if (dateTo && inv.date > dateTo) return false
      return true
    })
  }, [invoices, statusFilter, dateFrom, dateTo])

  /* ── Totals ────────────────────────────────────────────────────────── */
  const totals = useMemo(() => {
    const billed = invoices.reduce((s, i) => s + i.amount, 0)
    const paid   = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const outstanding = invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((s, i) => s + i.amount, 0)
    return { billed, paid, outstanding }
  }, [invoices])

  /* ── Actions ───────────────────────────────────────────────────────── */
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }, [])

  const handleAction = useCallback(
    (action: 'view' | 'send_reminder' | 'duplicate', id: string) => {
      const inv = invoices.find((i) => i.id === id)
      if (!inv) return
      if (action === 'view') {
        showToast(`Opening ${inv.number}… (TODO: open invoice PDF viewer)`)
      } else if (action === 'send_reminder') {
        showToast(`Reminder sent for ${inv.number} (TODO: Resend integration)`)
      } else if (action === 'duplicate') {
        showToast(`Duplicated ${inv.number} as draft (TODO: Supabase insert)`)
      }
    },
    [invoices, showToast]
  )

  const handleSaveDraft = useCallback(
    async (_invoice: InvoiceFormData) => {
      showToast('Invoice saved as draft (TODO: Supabase insert)')
      setInvoiceCreatorOpen(false)
    },
    [showToast]
  )

  const handleSend = useCallback(
    async (_invoice: InvoiceFormData) => {
      showToast('Invoice sent! (TODO: Resend + Supabase insert)')
      setInvoiceCreatorOpen(false)
    },
    [showToast]
  )

  const clearDateFilter = useCallback(() => {
    setDateFrom('')
    setDateTo('')
    setShowDateFilter(false)
  }, [])

  const hasDateFilter = dateFrom !== '' || dateTo !== ''

  /* ── InvoiceCreator initial data pre-populated with this client ────── */
  const invoiceInitialData = useMemo<Partial<InvoiceFormData>>(
    () => ({
      clientName:  clientName  ?? '',
      clientEmail: clientEmail ?? '',
    }),
    [clientName, clientEmail]
  )

  /* ─────────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl bg-surface-container border border-outline-variant/40 px-5 py-3 shadow-xl shadow-black/30 text-sm text-on-surface/80 max-w-sm text-center">
          {toastMessage}
        </div>
      )}

      {/* ── Invoice Creator Modal ──────────────────────────────────────── */}
      {invoiceCreatorOpen && (
        <InvoiceCreator
          onClose={() => setInvoiceCreatorOpen(false)}
          onSaveDraft={handleSaveDraft}
          onSend={handleSend}
          initialData={invoiceInitialData}
        />
      )}

      <div className="space-y-5">
        {/* ── Totals row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={15} className="text-on-surface/40" />
              <span className="text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">Total Billed</span>
            </div>
            <p className="text-2xl font-extrabold text-on-surface">{fmt(totals.billed)}</p>
            <p className="text-[10px] text-on-surface/30 mt-1">{invoices.length} invoices</p>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">Total Paid</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{fmt(totals.paid)}</p>
            <p className="text-[10px] text-on-surface/30 mt-1">
              {invoices.filter((i) => i.status === 'paid').length} invoices
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={15} className={totals.outstanding > 0 ? 'text-amber-400' : 'text-on-surface/40'} />
              <span className="text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">Outstanding</span>
            </div>
            <p className={`text-2xl font-extrabold ${totals.outstanding > 0 ? 'text-amber-400' : 'text-on-surface'}`}>
              {fmt(totals.outstanding)}
            </p>
            <p className="text-[10px] text-on-surface/30 mt-1">
              {invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length} unpaid
            </p>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-outline-variant/20">
            {/* Status filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    statusFilter === f.value
                      ? 'bg-primary/15 text-primary'
                      : 'text-on-surface/50 hover:text-on-surface/80 hover:bg-on-surface/5'
                  }`}
                >
                  {f.label}
                  {f.value !== 'all' && (
                    <span className="ml-1.5 text-[10px] opacity-60">
                      {invoices.filter((i) => i.status === f.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right: date filter + new invoice */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Date filter toggle */}
              <button
                onClick={() => setShowDateFilter((p) => !p)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  hasDateFilter
                    ? 'bg-primary/15 text-primary'
                    : 'text-on-surface/50 hover:text-on-surface/80 hover:bg-on-surface/5'
                }`}
              >
                <Filter size={13} />
                Date
                {hasDateFilter && (
                  <span
                    className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-white font-bold"
                    onClick={(e) => { e.stopPropagation(); clearDateFilter() }}
                  >
                    <X size={9} />
                  </span>
                )}
              </button>

              {/* Create invoice button */}
              <button
                onClick={() => setInvoiceCreatorOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <Plus size={13} />
                New Invoice
              </button>
            </div>
          </div>

          {/* Date range filter panel */}
          {showDateFilter && (
            <div className="flex items-center gap-4 px-4 py-3 bg-on-surface/[0.02] border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-on-surface/40 shrink-0" />
                <span className="text-xs text-on-surface/50">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-outline-variant/40 bg-background px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface/50">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-outline-variant/40 bg-background px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {hasDateFilter && (
                <button
                  onClick={clearDateFilter}
                  className="text-xs text-on-surface/40 hover:text-on-surface/70 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* ── Invoice table ──────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface/30">
              <FileText size={32} />
              <p className="text-sm">No invoices match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="px-4 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
                      Invoice #
                    </th>
                    <th className="px-4 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
                      Date
                    </th>
                    <th className="px-4 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
                      Due
                    </th>
                    <th className="px-4 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
                      Project
                    </th>
                    <th className="px-4 pb-3 pt-3 text-right text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
                      Amount
                    </th>
                    <th className="px-4 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-on-surface/40 font-medium">
                      Status
                    </th>
                    <th className="px-4 pb-3 pt-3 w-10" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const cfg = STATUS_CONFIG[inv.status]
                    const StatusIcon = cfg.icon
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-outline-variant/10 last:border-0 hover:bg-on-surface/[0.02] transition-colors group"
                      >
                        {/* Number */}
                        <td className="px-4 py-3.5 text-sm font-mono text-on-surface/70 whitespace-nowrap">
                          {inv.number}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-sm text-on-surface/50 whitespace-nowrap">
                          {fmtDate(inv.date)}
                        </td>

                        {/* Due date */}
                        <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                          <span
                            className={
                              inv.status === 'overdue'
                                ? 'text-red-400 font-medium'
                                : 'text-on-surface/40'
                            }
                          >
                            {fmtDate(inv.dueDate)}
                          </span>
                        </td>

                        {/* Project */}
                        <td className="px-4 py-3.5 text-sm text-on-surface max-w-[200px] truncate">
                          {inv.project}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 text-sm font-bold text-on-surface text-right whitespace-nowrap">
                          {fmt(inv.amount)}
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${cfg.badge}`}
                          >
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <ActionMenu
                            invoiceId={inv.id}
                            status={inv.status}
                            open={openMenuId === inv.id}
                            onOpen={setOpenMenuId}
                            onClose={() => setOpenMenuId(null)}
                            onAction={handleAction}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Filtered result count ──────────────────────────────────── */}
        {statusFilter !== 'all' || hasDateFilter ? (
          <p className="text-xs text-on-surface/30 text-right">
            Showing {filtered.length} of {invoices.length} invoices
          </p>
        ) : null}
      </div>
    </>
  )
}

export default ClientDetailInvoicesTab
