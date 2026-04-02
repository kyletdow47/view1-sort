'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  AlertTriangle,
  CreditCard,
  Mail,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface RefundPageProps {
  params: Promise<{ id: string }>
}

type RefundType = 'full' | 'partial'
type RefundReason = '' | 'client_request' | 'quality_issue' | 'cancelled' | 'duplicate' | 'other'

const REASON_OPTIONS: { value: RefundReason; label: string }[] = [
  { value: '', label: 'Select a reason...' },
  { value: 'client_request', label: 'Client Request' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'cancelled', label: 'Cancelled Project' },
  { value: 'duplicate', label: 'Duplicate Payment' },
  { value: 'other', label: 'Other' },
]

interface PastRefund {
  id: string
  date: string
  clientName: string
  amount: number
  reason: string
  status: 'completed' | 'pending'
}

const PAST_REFUNDS: PastRefund[] = [
  {
    id: '1',
    date: 'Mar 12, 2026',
    clientName: 'Emily Chen',
    amount: 1800,
    reason: 'Cancelled Project',
    status: 'completed',
  },
  {
    id: '2',
    date: 'Feb 28, 2026',
    clientName: 'David Park',
    amount: 450,
    reason: 'Client Request (Partial)',
    status: 'completed',
  },
]

export default function RefundPage({ params }: RefundPageProps) {
  const { id } = use(params)

  const [refundType, setRefundType] = useState<RefundType>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [reason, setReason] = useState<RefundReason>('')
  const [notes, setNotes] = useState('')

  const originalAmount = 2568
  const platformFee = 168
  const netOriginal = originalAmount - platformFee

  const refundAmount = refundType === 'full' ? originalAmount : (Number(partialAmount) || 0)
  const platformFeeRefund = refundType === 'full' ? platformFee : Math.round((Number(partialAmount) || 0) * (platformFee / originalAmount))
  const netRefund = refundAmount - platformFeeRefund

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/project/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Project
          </Link>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Process Refund</h1>
        </div>

        {/* Client info card */}
        <div className="mb-6 rounded-xl border border-outline-variant/40 bg-surface p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">
            Client Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Client</p>
                <p className="text-sm font-medium text-on-surface">Sarah Johnson</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Email</p>
                <p className="text-sm font-medium text-on-surface">sarah@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Amount Paid</p>
                <p className="text-sm font-medium text-on-surface">${originalAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Payment Date</p>
                <p className="text-sm font-medium text-on-surface">Mar 15, 2026</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface-container px-4 py-3">
            <CreditCard size={16} className="text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">Payment method: Visa ending in 4242</span>
          </div>
        </div>

        {/* Refund type */}
        <div className="mb-6">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
            Refund Type
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setRefundType('full')}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                refundType === 'full'
                  ? 'border-brand-coral bg-brand-coral/10 text-rose-400'
                  : 'border-outline-variant/50 bg-surface text-on-surface-variant hover:border-outline-variant'
              }`}
            >
              Full Refund
            </button>
            <button
              onClick={() => setRefundType('partial')}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                refundType === 'partial'
                  ? 'border-brand-coral bg-brand-coral/10 text-rose-400'
                  : 'border-outline-variant/50 bg-surface text-on-surface-variant hover:border-outline-variant'
              }`}
            >
              Partial Refund
            </button>
          </div>

          {/* Partial amount input */}
          {refundType === 'partial' && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                Refund Amount
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                />
                <input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  max={originalAmount}
                  className="h-11 w-full rounded-lg border border-outline-variant/50 bg-surface-container pl-10 pr-3 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-on-surface-variant/60">
                Maximum: ${originalAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Refund reason */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">
            Refund Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as RefundReason)}
            className="h-11 w-full appearance-none rounded-lg border border-outline-variant/50 bg-surface-container px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Internal notes */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any internal notes about this refund..."
            rows={3}
            className="w-full rounded-lg border border-outline-variant/50 bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Impact warning */}
        {refundType === 'full' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-coral/30 bg-brand-coral/5 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brand-coral" />
            <p className="text-sm leading-relaxed text-rose-400">
              Full refund will revoke client&apos;s download access to this gallery. This action cannot be undone.
            </p>
          </div>
        )}

        {/* Refund summary */}
        <div className="mb-6 rounded-xl border border-outline-variant/40 bg-surface p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">
            Refund Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Original Amount</span>
              <span className="text-on-surface">${originalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Refund Amount</span>
              <span className="text-rose-400">-${refundAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Platform Fee Refund</span>
              <span className="text-on-surface">-${platformFeeRefund.toLocaleString()}</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-3">
              <div className="flex justify-between text-base font-bold">
                <span className="text-on-surface">Net Refund to Client</span>
                <span className="text-rose-400">${netRefund.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mb-10 flex gap-3">
          <Link
            href={`/dashboard/project/${id}`}
            className="flex-1 rounded-xl border border-outline-variant/50 bg-surface py-3.5 text-center text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Cancel
          </Link>
          <button
            disabled={!reason}
            className="flex-1 rounded-xl bg-gradient-to-br from-brand-peach to-brand-coral py-3.5 font-headline font-bold text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Process Refund
          </button>
        </div>

        {/* Recent refunds */}
        <div className="rounded-xl border border-outline-variant/40 bg-surface p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">
            Recent Refunds
          </h2>
          <div className="space-y-3">
            {PAST_REFUNDS.map((refund) => (
              <div
                key={refund.id}
                className="flex items-center justify-between rounded-lg bg-surface-container px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-peach/10 text-rose-400">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{refund.clientName}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {refund.date} &middot; {refund.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-rose-400">
                    -${refund.amount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium">
                    {refund.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-primary">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
