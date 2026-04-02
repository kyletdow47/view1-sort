'use client'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface InvoicePreviewProps {
  invoiceNumber: string
  clientName: string
  dueDate: string
  items: LineItem[]
  taxRate: number
  depositDeduction: number
  subtotal: number
  tax: number
  total: number
}

export function InvoicePreview({
  invoiceNumber,
  clientName,
  dueDate,
  items,
  taxRate,
  depositDeduction,
  subtotal,
  tax,
  total,
}: InvoicePreviewProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="rounded-xl border border-white/10 bg-white p-8 text-slate-900 shadow-xl">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold">INVOICE</h1>
          <p className="mt-1 text-sm text-slate-600">#{invoiceNumber}</p>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p>Issue Date: {today}</p>
          <p>Due Date: {dueDate}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bill To</p>
        <p className="mt-2 text-lg font-semibold">{clientName}</p>
      </div>

      {/* Line Items Table */}
      <div className="mb-8 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Description</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Qty</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Unit Price</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">{item.description}</td>
                <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">${(item.unitPrice / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                  ${((item.quantity * item.unitPrice) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-mono font-semibold text-slate-900">${(subtotal / 100).toFixed(2)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax ({taxRate}%)</span>
              <span className="font-mono font-semibold text-slate-900">${(tax / 100).toFixed(2)}</span>
            </div>
          )}
          {depositDeduction > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Deposit Deduction</span>
              <span className="font-mono font-semibold text-slate-900">-${(depositDeduction / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-mono font-bold text-slate-900">${(total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-600">
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}
