'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  X,
  Plus,
  GripVertical,
  ChevronDown,
  Send,
  FileText,
  Download,
  Building2,
  User,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import type {
  InvoiceCreatorProps,
  InvoiceFormData,
  InvoiceLineItemData,
  InvoiceClientRecord,
  InvoiceProjectRecord,
  CurrencyCode,
  DiscountType,
  PaymentMethod,
} from '@/types/invoice'

/* ─── Mock Data (TODO: replace with Supabase query) ──────────────────────── */

const MOCK_CLIENTS: InvoiceClientRecord[] = [
  { id: 'c1', name: 'Sarah Chen', email: 'sarah.chen@example.com', company: 'Chen Enterprises' },
  { id: 'c2', name: 'James Wilson', email: 'james@wilsonevent.co', company: 'Wilson Events' },
  { id: 'c3', name: 'Maria Garcia', email: 'maria.garcia@gmail.com' },
  { id: 'c4', name: 'Alex Thompson', email: 'alex@thompsonco.com', company: 'Thompson Co.' },
  { id: 'c5', name: 'Emma Davis', email: 'emma.davis@familydavis.com' },
  { id: 'c6', name: 'David Kim', email: 'david.kim@kimevent.com', company: 'Kim Event Group' },
]

const MOCK_PROJECTS: InvoiceProjectRecord[] = [
  { id: 'p1', name: 'Chen Wedding — May 2026', clientId: 'c1', date: '2026-05-15' },
  { id: 'p2', name: 'Wilson Corporate Headshots', clientId: 'c2', date: '2026-04-10' },
  { id: 'p3', name: 'Garcia Engagement Shoot', clientId: 'c3', date: '2026-04-28' },
  { id: 'p4', name: 'Thompson Product Photography', clientId: 'c4', date: '2026-03-20' },
  { id: 'p5', name: 'Davis Family Portrait', clientId: 'c5', date: '2026-04-05' },
  { id: 'p6', name: 'Kim Event Coverage', clientId: 'c6', date: '2026-05-01' },
]

const CURRENCIES: CurrencyCode[] = ['USD', 'CAD', 'EUR', 'GBP', 'AUD']

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  CAD: 'CA$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
}

/* ─── Helper Functions ────────────────────────────────────────────────────── */

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 900) + 100
  // TODO: replace with DB query: SELECT COUNT(*)+1 FROM invoices WHERE photographer_id = ? AND YEAR(created_at) = ?
  return `V1-${year}-${seq}`
}

function todayISODate(): string {
  return new Date().toISOString().split('T')[0] as string
}

function dueDateISODate(daysOut = 14): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOut)
  return d.toISOString().split('T')[0] as string
}

function formatCents(cents: number, symbol = '$'): string {
  return `${symbol}${(cents / 100).toFixed(2)}`
}

/* ─── Sortable Line Item Row ──────────────────────────────────────────────── */

interface SortableLineItemProps {
  item: InvoiceLineItemData
  currencySymbol: string
  onUpdate: (id: string, field: keyof InvoiceLineItemData, value: string | number) => void
  onDelete: (id: string) => void
}

function SortableLineItemRow({ item, currencySymbol, onUpdate, onDelete }: SortableLineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  const rowSubtotal = item.quantity * item.unitPrice

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 flex cursor-grab items-center text-white/30 hover:text-white/60 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder="Item description…"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-[#5749F4] focus:outline-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-white/40">Qty</label>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => onUpdate(item.id, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:border-[#5749F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-white/40">Unit Price</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/40">
                {currencySymbol}
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={(item.unitPrice / 100).toFixed(2)}
                onChange={(e) =>
                  onUpdate(item.id, 'unitPrice', Math.round(parseFloat(e.target.value || '0') * 100))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-6 pr-2 text-sm text-white focus:border-[#5749F4] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-white/40">Total</label>
            <p className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5 font-mono text-sm text-white/70">
              {formatCents(rowSubtotal, currencySymbol)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="mt-1 text-white/30 transition-colors hover:text-red-400"
        aria-label="Remove line item"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ─── Invoice Creator Preview (right panel) ───────────────────────────────── */

interface CreatorPreviewProps {
  form: InvoiceFormData
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  currencySymbol: string
}

function InvoiceCreatorPreview({ form, subtotal, taxAmount, discountAmount, total, currencySymbol }: CreatorPreviewProps) {
  const today = todayISODate()

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl">
      {/* Branding header */}
      <div className="bg-gradient-to-r from-[#5749F4] to-[#7C3AED] px-8 py-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/60">Invoice</p>
            <p className="mt-1 font-mono text-2xl font-bold">#{form.invoiceNumber || '—'}</p>
          </div>
          <div className="text-right text-xs text-white/70">
            <p>
              <span className="text-white/50">Issued:</span>{' '}
              <span className="font-mono">{form.issueDate || today}</span>
            </p>
            <p className="mt-0.5">
              <span className="text-white/50">Due:</span>{' '}
              <span className="font-mono">{form.dueDate || '—'}</span>
            </p>
          </div>
        </div>
        {/* Business name placeholder */}
        <div className="mt-4 border-t border-white/20 pt-4">
          <p className="text-sm font-semibold">Your Studio Name</p>
          <p className="text-xs text-white/60">studio@yourmail.com · view1.app</p>
          {/* TODO: pull from photographer profile (studio_name, contact_email) */}
        </div>
      </div>

      <div className="p-8">
        {/* Bill To */}
        <div className="mb-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Bill To
          </p>
          <p className="font-semibold text-slate-800">{form.clientName || 'Client Name'}</p>
          {form.clientEmail && (
            <p className="text-sm text-slate-500">{form.clientEmail}</p>
          )}
          {form.projectName && (
            <p className="mt-0.5 text-xs text-slate-400">Re: {form.projectName}</p>
          )}
        </div>

        {/* Line items */}
        {form.lineItems.length > 0 ? (
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Description</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500">Qty</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500">Price</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {form.lineItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 text-slate-800">{item.description || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-500">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                      {formatCents(item.unitPrice, currencySymbol)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                      {formatCents(item.quantity * item.unitPrice, currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-300">Add line items to the form</p>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-mono font-medium text-slate-700">
                {formatCents(subtotal, currencySymbol)}
              </span>
            </div>
            {form.taxEnabled && form.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({form.taxRate}%)</span>
                <span className="font-mono font-medium text-slate-700">
                  {formatCents(taxAmount, currencySymbol)}
                </span>
              </div>
            )}
            {form.discountEnabled && discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Discount{form.discountType === 'percentage' ? ` (${form.discountValue}%)` : ''}
                </span>
                <span className="font-mono font-medium text-red-500">
                  −{formatCents(discountAmount, currencySymbol)}
                </span>
              </div>
            )}
            <div className="border-t-2 border-slate-900 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {formatCents(total, currencySymbol)} {form.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {form.notes && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Notes
            </p>
            <p className="whitespace-pre-line text-sm text-slate-600">{form.notes}</p>
          </div>
        )}

        {/* Payment instructions */}
        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
          {form.paymentMethod === 'stripe' ? (
            <p className="text-xs text-slate-400">
              <span className="font-medium text-[#5749F4]">Pay online</span> — a secure payment link will be
              sent with this invoice.
              {form.lateFeeEnabled && form.lateFeePercent > 0 && (
                <span className="mt-0.5 block text-slate-300">
                  Late fee of {form.lateFeePercent}% per month applies after due date.
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Payment by check, cash, or e-transfer. Please reference invoice #{form.invoiceNumber}.
            </p>
          )}
          <p className="mt-3 text-[10px] text-slate-300">Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Section Helper Components ───────────────────────────────────────────── */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">{title}</h3>
      {children}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#5749F4] focus:outline-none transition-colors'

const selectClass =
  'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm text-white focus:border-[#5749F4] focus:outline-none transition-colors'

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
    >
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? 'bg-[#5749F4]' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label}
    </button>
  )
}

/* ─── Default Form State ──────────────────────────────────────────────────── */

function makeDefaultForm(initial?: Partial<InvoiceFormData>): InvoiceFormData {
  return {
    clientId: '',
    clientName: '',
    clientEmail: '',
    projectId: null,
    projectName: null,
    invoiceNumber: generateInvoiceNumber(),
    issueDate: todayISODate(),
    dueDate: dueDateISODate(14),
    currency: 'USD',
    lineItems: [
      { id: '1', description: 'Photography Session', quantity: 1, unitPrice: 50000 },
    ],
    taxEnabled: false,
    taxRate: 10,
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    notes: '',
    internalNotes: '',
    paymentMethod: 'stripe',
    partialPaymentEnabled: false,
    lateFeeEnabled: false,
    lateFeePercent: 1.5,
    status: 'draft',
    ...initial,
  }
}

/* ─── Main InvoiceCreator Component ──────────────────────────────────────── */

export function InvoiceCreator({ onClose, onSaveDraft, onSend, initialData }: InvoiceCreatorProps) {
  const [form, setForm] = useState<InvoiceFormData>(() => makeDefaultForm(initialData))
  const [clientSearch, setClientSearch] = useState('')
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)

  /* ─── DnD sensors ─────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /* ─── Computed totals ─────────────────────────────────── */
  const subtotal = useMemo(
    () => form.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [form.lineItems],
  )

  const taxAmount = useMemo(
    () => (form.taxEnabled ? Math.round((subtotal * form.taxRate) / 100) : 0),
    [subtotal, form.taxEnabled, form.taxRate],
  )

  const discountAmount = useMemo(() => {
    if (!form.discountEnabled || form.discountValue <= 0) return 0
    if (form.discountType === 'percentage') {
      return Math.round(((subtotal + taxAmount) * form.discountValue) / 100)
    }
    // fixed: value stored as cents
    return Math.round(form.discountValue * 100)
  }, [form.discountEnabled, form.discountType, form.discountValue, subtotal, taxAmount])

  const total = useMemo(
    () => Math.max(0, subtotal + taxAmount - discountAmount),
    [subtotal, taxAmount, discountAmount],
  )

  const currencySymbol = CURRENCY_SYMBOLS[form.currency]

  /* ─── Filtered projects (for selected client) ─────────── */
  const clientProjects = useMemo(
    () => MOCK_PROJECTS.filter((p) => p.clientId === form.clientId),
    [form.clientId],
  )

  const filteredClients = useMemo(
    () =>
      MOCK_CLIENTS.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(clientSearch.toLowerCase()),
      ),
    [clientSearch],
  )

  /* ─── Form update helpers ─────────────────────────────── */
  const setField = useCallback(
    <K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const selectClient = useCallback((client: InvoiceClientRecord) => {
    setForm((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      projectId: null,
      projectName: null,
    }))
    setClientSearch('')
    setClientDropdownOpen(false)
  }, [])

  /* ─── Line item helpers ───────────────────────────────── */
  const addLineItem = useCallback(() => {
    const newItem: InvoiceLineItemData = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    }
    setForm((prev) => ({ ...prev, lineItems: [...prev.lineItems, newItem] }))
  }, [])

  const updateLineItem = useCallback(
    (id: string, field: keyof InvoiceLineItemData, value: string | number) => {
      setForm((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }))
    },
    [],
  )

  const deleteLineItem = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }))
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setForm((prev) => {
        const oldIdx = prev.lineItems.findIndex((i) => i.id === active.id)
        const newIdx = prev.lineItems.findIndex((i) => i.id === over.id)
        return { ...prev, lineItems: arrayMove(prev.lineItems, oldIdx, newIdx) }
      })
    }
  }, [])

  /* ─── Action handlers ─────────────────────────────────── */
  const handleSaveDraft = async () => {
    const draft = { ...form, status: 'draft' as const }
    if (onSaveDraft) {
      setIsSaving(true)
      try {
        await onSaveDraft(draft)
        // TODO: persist to invoices table with status='draft'
      } finally {
        setIsSaving(false)
      }
    } else {
      // TODO: call POST /api/invoices with status='draft'
      console.info('Save draft:', draft)
    }
    onClose()
  }

  const handleSend = async () => {
    if (!form.clientEmail) {
      alert('Please select a client before sending.')
      return
    }
    const sent = { ...form, status: 'sent' as const }
    if (onSend) {
      setIsSending(true)
      try {
        await onSend(sent)
        // TODO: POST /api/invoices (status='sent') then POST /api/invoices/[id]/send
        // Send via Resend with react-email template + Pay Now Stripe link
      } finally {
        setIsSending(false)
      }
    } else {
      // TODO: POST /api/invoices + email via Resend
      console.info('Send invoice:', sent)
    }
    onClose()
  }

  const handleDownloadPDF = () => {
    // TODO: implement PDF generation via jsPDF or server-side /api/invoices/[id]/pdf
    // For now, trigger browser print which allows Save as PDF
    window.print()
  }

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
      <div className="relative mx-auto w-full max-w-[1100px] rounded-2xl border border-white/10 bg-[#0F0E1A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5749F4]/20">
              <FileText className="h-4 w-4 text-[#5749F4]" />
            </div>
            <h2 className="text-base font-semibold text-white">Create Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_420px]">
          {/* ── Left: Form ── */}
          <div className="space-y-4 min-w-0">
            {/* Client Selector */}
            <SectionCard title="Client">
              <div className="space-y-3">
                <FormField label="Select Client">
                  <div className="relative">
                    <div
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-white/20"
                      onClick={() => setClientDropdownOpen((v) => !v)}
                    >
                      <User className="h-4 w-4 text-white/40" />
                      <span className={`flex-1 text-sm ${form.clientName ? 'text-white' : 'text-white/30'}`}>
                        {form.clientName || 'Search clients…'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-white/30" />
                    </div>

                    {clientDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-white/15 bg-[#1A1830] shadow-2xl">
                        <div className="p-2">
                          <input
                            autoFocus
                            type="text"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-[#5749F4] focus:outline-none"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {filteredClients.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-white/30">No clients found</p>
                          ) : (
                            filteredClients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => selectClient(client)}
                                className="flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                              >
                                <span className="text-sm font-medium text-white">{client.name}</span>
                                <span className="text-xs text-white/40">{client.email}</span>
                                {client.company && (
                                  <span className="text-xs text-white/30">{client.company}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                        <div className="border-t border-white/10 p-2">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#5749F4] transition-colors hover:bg-[#5749F4]/10"
                            onClick={() => setClientDropdownOpen(false)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add new client
                            {/* TODO: open AddClientModal */}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </FormField>

                {form.clientEmail && (
                  <FormField label="Client Email">
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => setField('clientEmail', e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                )}
              </div>
            </SectionCard>

            {/* Invoice Details */}
            <SectionCard title="Invoice Details">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <FormField label="Invoice Number">
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={(e) => setField('invoiceNumber', e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Issue Date">
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setField('issueDate', e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Due Date">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setField('dueDate', e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Currency">
                  <div className="relative">
                    <select
                      value={form.currency}
                      onChange={(e) => setField('currency', e.target.value as CurrencyCode)}
                      className={selectClass}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} style={{ background: '#1A1830' }}>
                          {c} — {CURRENCY_SYMBOLS[c]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </div>
                </FormField>

                {/* Project selector (only shown when client selected) */}
                {form.clientId && (
                  <div className="col-span-2">
                    <FormField label="Project (Optional)">
                      <div className="relative">
                        <select
                          value={form.projectId ?? ''}
                          onChange={(e) => {
                            const proj = MOCK_PROJECTS.find((p) => p.id === e.target.value)
                            setField('projectId', proj?.id ?? null)
                            setField('projectName', proj?.name ?? null)
                          }}
                          className={selectClass}
                        >
                          <option value="" style={{ background: '#1A1830' }}>
                            No project linked
                          </option>
                          {clientProjects.map((p) => (
                            <option key={p.id} value={p.id} style={{ background: '#1A1830' }}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      </div>
                    </FormField>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Line Items */}
            <SectionCard title="Line Items">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={form.lineItems.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {form.lineItems.map((item) => (
                      <SortableLineItemRow
                        key={item.id}
                        item={item}
                        currencySymbol={currencySymbol}
                        onUpdate={updateLineItem}
                        onDelete={deleteLineItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button
                type="button"
                onClick={addLineItem}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-2.5 text-sm text-white/50 transition-colors hover:border-[#5749F4]/50 hover:text-[#5749F4]"
              >
                <Plus className="h-4 w-4" />
                Add Line Item
              </button>
            </SectionCard>

            {/* Totals & Adjustments */}
            <SectionCard title="Totals & Adjustments">
              <div className="space-y-3">
                {/* Subtotal (read-only) */}
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-2.5">
                  <span className="text-sm text-white/60">Subtotal</span>
                  <span className="font-mono text-sm font-semibold text-white">
                    {formatCents(subtotal, currencySymbol)}
                  </span>
                </div>

                {/* Tax */}
                <div className="space-y-2">
                  <Toggle
                    enabled={form.taxEnabled}
                    onChange={(v) => setField('taxEnabled', v)}
                    label="Apply Tax"
                  />
                  {form.taxEnabled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={form.taxRate}
                        onChange={(e) => setField('taxRate', parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-[#5749F4] focus:outline-none"
                      />
                      <span className="text-sm text-white/50">% tax rate</span>
                      <span className="ml-auto font-mono text-sm text-white/70">
                        +{formatCents(taxAmount, currencySymbol)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <Toggle
                    enabled={form.discountEnabled}
                    onChange={(v) => setField('discountEnabled', v)}
                    label="Apply Discount"
                  />
                  {form.discountEnabled && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={form.discountType}
                          onChange={(e) => setField('discountType', e.target.value as DiscountType)}
                          className="appearance-none rounded-xl border border-white/10 bg-white/5 py-1.5 pl-3 pr-7 text-sm text-white focus:border-[#5749F4] focus:outline-none"
                        >
                          <option value="percentage" style={{ background: '#1A1830' }}>%</option>
                          <option value="fixed" style={{ background: '#1A1830' }}>$ fixed</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={form.discountType === 'percentage' ? 1 : 0.01}
                        value={form.discountValue}
                        onChange={(e) =>
                          setField('discountValue', parseFloat(e.target.value) || 0)
                        }
                        placeholder={form.discountType === 'percentage' ? '10' : '50.00'}
                        className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-[#5749F4] focus:outline-none"
                      />
                      {discountAmount > 0 && (
                        <span className="ml-auto font-mono text-sm text-red-400">
                          −{formatCents(discountAmount, currencySymbol)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Grand total */}
                <div className="flex items-center justify-between rounded-xl border border-[#5749F4]/30 bg-[#5749F4]/10 px-4 py-3">
                  <span className="font-semibold text-white">Total Due</span>
                  <span className="font-mono text-lg font-bold text-white">
                    {formatCents(total, currencySymbol)} {form.currency}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Notes */}
            <SectionCard title="Notes">
              <div className="space-y-3">
                <FormField label="Notes to Client (shown on invoice)">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    rows={3}
                    placeholder="Thank you for choosing us! Payment is due within 14 days…"
                    className={`${inputClass} resize-none`}
                  />
                </FormField>
                <FormField label="Internal Notes (photographer only)">
                  <textarea
                    value={form.internalNotes}
                    onChange={(e) => setField('internalNotes', e.target.value)}
                    rows={2}
                    placeholder="Deposit already collected ($500)…"
                    className={`${inputClass} resize-none`}
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* Payment Terms */}
            <SectionCard title="Payment Terms">
              <div className="space-y-4">
                {/* Payment method */}
                <FormField label="Payment Method">
                  <div className="grid grid-cols-2 gap-2">
                    {(['stripe', 'manual'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setField('paymentMethod', method)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                          form.paymentMethod === method
                            ? 'border-[#5749F4] bg-[#5749F4]/15 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                        }`}
                      >
                        {method === 'stripe' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                        {method === 'stripe' ? 'Online (Stripe)' : 'Manual'}
                      </button>
                    ))}
                  </div>
                  {form.paymentMethod === 'stripe' && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {/* TODO: check Stripe Connect setup status */}
                      Stripe Connect setup required to accept online payments.
                    </p>
                  )}
                </FormField>

                {/* Partial payment */}
                <Toggle
                  enabled={form.partialPaymentEnabled}
                  onChange={(v) => setField('partialPaymentEnabled', v)}
                  label="Allow Partial Payments"
                />

                {/* Late fee */}
                <div className="space-y-2">
                  <Toggle
                    enabled={form.lateFeeEnabled}
                    onChange={(v) => setField('lateFeeEnabled', v)}
                    label="Late Payment Fee"
                  />
                  {form.lateFeeEnabled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={0.5}
                        value={form.lateFeePercent}
                        onChange={(e) => setField('lateFeePercent', parseFloat(e.target.value) || 0)}
                        className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-[#5749F4] focus:outline-none"
                      />
                      <span className="text-sm text-white/50">% per month after due date</span>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                Live Preview
              </p>
              <InvoiceCreatorPreview
                form={form}
                subtotal={subtotal}
                taxAmount={taxAmount}
                discountAmount={discountAmount}
                total={total}
                currencySymbol={currencySymbol}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !form.clientEmail}
              className="flex items-center gap-2 rounded-xl bg-[#5749F4] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4638D8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending…' : 'Send Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
