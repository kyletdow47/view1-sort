'use client'

import { useState } from 'react'
import { Plus, Download, Send, CheckCircle } from 'lucide-react'
import { InvoiceCreator } from './InvoiceCreator'

interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  createdDate: string
}

const invoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-001',
    client: 'Sarah Johnson',
    amount: 2500,
    status: 'paid',
    dueDate: '2026-03-31',
    createdDate: '2026-03-01',
  },
  {
    id: '2',
    number: 'INV-002',
    client: 'Michael Chen',
    amount: 1800,
    status: 'pending',
    dueDate: '2026-04-10',
    createdDate: '2026-03-15',
  },
  {
    id: '3',
    number: 'INV-003',
    client: 'Emma Davis',
    amount: 3200,
    status: 'paid',
    dueDate: '2026-03-20',
    createdDate: '2026-02-28',
  },
  {
    id: '4',
    number: 'INV-004',
    client: 'James Wilson',
    amount: 1200,
    status: 'overdue',
    dueDate: '2026-03-15',
    createdDate: '2026-02-13',
  },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-300',
    pending: 'bg-amber-500/20 text-amber-300',
    overdue: 'bg-red-500/20 text-red-300',
  }
  return colors[status] ?? 'bg-amber-500/20 text-amber-300'
}

export function InvoicesTab() {
  const [showCreator, setShowCreator] = useState(false)

  return (
    <div className="space-y-6">
      {/* Create Invoice Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 rounded-xl bg-[#5749F4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4638D8]"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Invoices List */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left font-medium text-white/60">Number</th>
                <th className="px-4 py-3 text-left font-medium text-white/60">Client</th>
                <th className="px-4 py-3 text-right font-medium text-white/60">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-white/60">Due Date</th>
                <th className="px-4 py-3 text-center font-medium text-white/60">Status</th>
                <th className="px-4 py-3 text-right font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-white">{invoice.number}</td>
                  <td className="px-4 py-3 text-white">{invoice.client}</td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-white/80">{invoice.dueDate}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        title="Send Invoice"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          className="rounded p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-green-400"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Creator Modal */}
      {showCreator && (
        <InvoiceCreator
          onClose={() => setShowCreator(false)}
        />
      )}
    </div>
  )
}
