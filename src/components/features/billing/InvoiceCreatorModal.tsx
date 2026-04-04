'use client'

import { useState } from 'react'
import { X, Plus, Send, Save, Trash2 } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface LineItem {
  id: string
  description: string
  qty: number
  rate: number
}

interface InvoiceCreatorModalProps {
  open: boolean
  onClose: () => void
  clientName?: string
  clientAvatar?: string
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).substring(2, 9)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function InvoiceCreatorModal({ open, onClose, clientName = 'Sarah Mitchell', clientAvatar = 'SM' }: InvoiceCreatorModalProps) {
  const [items, setItems] = useState<LineItem[]>([
    { id: uid(), description: 'Wedding Photography — Full Day', qty: 1, rate: 3200 },
    { id: uid(), description: 'Second Photographer', qty: 1, rate: 500 },
    { id: uid(), description: 'Photo Album Design', qty: 1, rate: 350 },
  ])
  const [invoiceNum] = useState('INV-053')
  const [issueDate] = useState('Apr 3, 2026')
  const [dueDate, setDueDate] = useState('May 3, 2026')
  const [taxRate] = useState(8)
  const [sent, setSent] = useState(false)

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  function addItem() {
    setItems((prev) => [...prev, { id: uid(), description: '', qty: 1, rate: 0 }])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-[680px] rounded-3xl backdrop-blur-[40px]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.20)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-white">Create Invoice</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Bill to */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-white/50">Bill To:</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.18] bg-white/[0.08] px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-blue-500 text-[9px] font-bold text-white">
                {clientAvatar}
              </div>
              <span className="text-sm font-medium text-white">{clientName}</span>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Invoice #', value: invoiceNum, readonly: true },
              { label: 'Issue Date', value: issueDate, readonly: true },
              { label: 'Due Date', value: dueDate, readonly: false },
            ].map(({ label, value, readonly }) => (
              <div key={label}>
                <label className="mb-1 block text-xs text-white/40">{label}</label>
                <input
                  value={value}
                  readOnly={readonly}
                  onChange={(e) => !readonly && setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.18] bg-white/[0.08] px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50 read-only:opacity-60"
                />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-gradient-to-r from-amber-400/40 via-indigo-400/40 to-transparent" />

          {/* Line items */}
          <div className="mb-2 grid grid-cols-[1fr_56px_72px_80px_32px] gap-2 px-1">
            {['Description', 'Qty', 'Rate', 'Amount', ''].map((h) => (
              <span key={h} className="text-[11px] font-medium text-white/40">{h}</span>
            ))}
          </div>

          <div className="mb-2 space-y-1.5 max-h-48 overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`grid grid-cols-[1fr_56px_72px_80px_32px] items-center gap-2 rounded-xl px-1 py-1.5 ${idx % 2 === 0 ? 'bg-white/[0.04]' : ''}`}
              >
                <input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Item description"
                  className="rounded-lg border border-transparent bg-white/[0.05] px-2 py-1 text-xs text-white placeholder-white/20 outline-none focus:border-white/[0.15]"
                />
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                  className="w-full rounded-lg border border-transparent bg-white/[0.05] px-2 py-1 text-center text-xs text-white outline-none focus:border-white/[0.15]"
                />
                <input
                  type="number"
                  min={0}
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                  className="w-full rounded-lg border border-transparent bg-white/[0.05] px-2 py-1 text-xs text-white outline-none focus:border-white/[0.15]"
                />
                <span className="text-right text-xs font-medium text-white">
                  {formatCurrency(item.qty * item.rate)}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-rose-400 transition-colors flex justify-center">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            Add Line Item
          </button>

          {/* Divider */}
          <div className="mb-4 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-amber-400/40" />

          {/* Totals */}
          <div className="mb-5 flex flex-col items-end gap-1">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="w-24 text-right text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <span className="text-white/50">Tax ({taxRate}%)</span>
              <span className="w-24 text-right text-white">{formatCurrency(tax)}</span>
            </div>
            <div className="mt-1 h-px w-32 bg-white/[0.15]" />
            <div className="flex items-center gap-8">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="w-24 text-right text-xl font-bold text-white">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex-1 rounded-2xl border border-white/[0.18] py-3 text-sm font-medium text-white/70 hover:border-white/[0.28] hover:text-white transition-colors">
              <Save className="mr-2 inline h-4 w-4" />
              Save as Draft
            </button>
            <button
              onClick={() => { setSent(true); setTimeout(onClose, 1200) }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-all"
              style={{ background: sent ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
            >
              <Send className="h-4 w-4" />
              {sent ? 'Sent!' : 'Send Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
