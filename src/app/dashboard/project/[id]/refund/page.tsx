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
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/project/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#a18d80] hover:text-[#ffb780] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Project
          </Link>
          <h1 className="font-headline text-2xl font-bold text-[#e7e1df]">Process Refund</h1>
        </div>

        {/* Client info card */}
        <div className="mb-6 rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-4">
            Client Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffb780]/10 text-[#ffb780]">
                <User size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#a18d80]">Client</p>
                <p className="text-sm font-medium text-[#e7e1df]">Sarah Johnson</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#95d1d1]/10 text-[#95d1d1]">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#a18d80]">Email</p>
                <p className="text-sm font-medium text-[#e7e1df]">sarah@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffb780]/10 text-[#ffb780]">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#a18d80]">Amount Paid</p>
                <p className="text-sm font-medium text-[#e7e1df]">${originalAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#95d1d1]/10 text-[#95d1d1]">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#a18d80]">Payment Date</p>
                <p className="text-sm font-medium text-[#e7e1df]">Mar 15, 2026</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#211f1e] px-4 py-3">
            <CreditCard size={16} className="text-[#a18d80]" />
            <span className="text-sm text-[#a18d80]">Payment method: Visa ending in 4242</span>
          </div>
        </div>

        {/* Refund type */}
        <div className="mb-6">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-3">
            Refund Type
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setRefundType('full')}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                refundType === 'full'
                  ? 'border-[#e7765f] bg-[#e7765f]/10 text-[#ffb4a5]'
                  : 'border-[#534439]/50 bg-[#1d1b1a] text-[#a18d80] hover:border-[#534439]'
              }`}
            >
              Full Refund
            </button>
            <button
              onClick={() => setRefundType('partial')}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                refundType === 'partial'
                  ? 'border-[#e7765f] bg-[#e7765f]/10 text-[#ffb4a5]'
                  : 'border-[#534439]/50 bg-[#1d1b1a] text-[#a18d80] hover:border-[#534439]'
              }`}
            >
              Partial Refund
            </button>
          </div>

          {/* Partial amount input */}
          {refundType === 'partial' && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
                Refund Amount
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a18d80]/50"
                />
                <input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  max={originalAmount}
                  className="h-11 w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] pl-10 pr-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#a18d80]/60">
                Maximum: ${originalAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Refund reason */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
            Refund Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as RefundReason)}
            className="h-11 w-full appearance-none rounded-lg border border-[#534439]/50 bg-[#211f1e] px-3 text-sm text-[#e7e1df] outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20"
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
          <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any internal notes about this refund..."
            rows={3}
            className="w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] px-3 py-2.5 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20 resize-none"
          />
        </div>

        {/* Impact warning */}
        {refundType === 'full' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#e7765f]/30 bg-[#e7765f]/5 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#e7765f]" />
            <p className="text-sm leading-relaxed text-[#ffb4a5]">
              Full refund will revoke client&apos;s download access to this gallery. This action cannot be undone.
            </p>
          </div>
        )}

        {/* Refund summary */}
        <div className="mb-6 rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-4">
            Refund Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#a18d80]">Original Amount</span>
              <span className="text-[#e7e1df]">${originalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#a18d80]">Refund Amount</span>
              <span className="text-[#ffb4a5]">-${refundAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#a18d80]">Platform Fee Refund</span>
              <span className="text-[#e7e1df]">-${platformFeeRefund.toLocaleString()}</span>
            </div>
            <div className="border-t border-[#534439]/30 pt-3">
              <div className="flex justify-between text-base font-bold">
                <span className="text-[#e7e1df]">Net Refund to Client</span>
                <span className="text-[#ffb4a5]">${netRefund.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mb-10 flex gap-3">
          <Link
            href={`/dashboard/project/${id}`}
            className="flex-1 rounded-xl border border-[#534439]/50 bg-[#1d1b1a] py-3.5 text-center text-sm font-semibold text-[#a18d80] transition-colors hover:bg-[#252322]"
          >
            Cancel
          </Link>
          <button
            disabled={!reason}
            className="flex-1 rounded-xl bg-gradient-to-br from-[#ffb4a5] to-[#e7765f] py-3.5 font-headline font-bold text-sm text-[#4e2600] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Process Refund
          </button>
        </div>

        {/* Recent refunds */}
        <div className="rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-4">
            Recent Refunds
          </h2>
          <div className="space-y-3">
            {PAST_REFUNDS.map((refund) => (
              <div
                key={refund.id}
                className="flex items-center justify-between rounded-lg bg-[#211f1e] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffb4a5]/10 text-[#ffb4a5]">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e7e1df]">{refund.clientName}</p>
                    <p className="text-[11px] text-[#a18d80]">
                      {refund.date} &middot; {refund.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#ffb4a5]">
                    -${refund.amount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium">
                    {refund.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[#95d1d1]">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#ffb780]">
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
