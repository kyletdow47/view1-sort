'use client'

import { useState } from 'react'
import {
  FileText,
  Plus,
  Send,
  Download,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSignature,
  ReceiptText,
  X,
  ChevronRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type ContractStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired'
type InvoiceStatus = 'Unpaid' | 'Paid' | 'Overdue'

interface Contract {
  id: string
  projectName: string
  clientName: string
  status: ContractStatus
  sentDate: string | null
  signedDate: string | null
  body: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  project: string
  clientName: string
  amount: number
  status: InvoiceStatus
  dueDate: string
  paidDate: string | null
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'c-1',
    projectName: 'Johnson Wedding',
    clientName: 'Sarah & Tom Johnson',
    status: 'Signed',
    sentDate: 'Mar 1, 2026',
    signedDate: 'Mar 3, 2026',
    body: `This Photography Services Agreement ("Agreement") is entered into as of March 1, 2026, between Aperture Studios ("Photographer") and Sarah & Tom Johnson ("Client").\n\n1. SERVICES\nPhotographer agrees to provide wedding photography services for the event scheduled on June 14, 2026. Coverage includes 8 hours of photography, two photographers, and delivery of 800+ fully edited digital images.\n\n2. PAYMENT\nClient agrees to pay a total of $3,200 USD. A 50% retainer of $1,600 is due upon signing. The remaining balance is due 14 days before the event date.\n\n3. DELIVERABLES\nPhotographer will deliver an online gallery within 6 weeks of the event date.\n\n4. CANCELLATION\nCancellations made fewer than 30 days before the event forfeit the retainer.`,
  },
  {
    id: 'c-2',
    projectName: 'Meridian Hotel Brand',
    clientName: 'Alex Torres',
    status: 'Sent',
    sentDate: 'Mar 20, 2026',
    signedDate: null,
    body: `This Photography Services Agreement is entered into as of March 20, 2026, between Aperture Studios ("Photographer") and Meridian Hotel Group ("Client").\n\n1. SERVICES\nPhotographer will provide commercial photography services for a half-day brand shoot on April 5, 2026, including product, lifestyle, and team photography.\n\n2. PAYMENT\nClient agrees to pay $1,800 USD net-30 upon delivery of final images.\n\n3. LICENSE\nClient receives a perpetual commercial license for all delivered images for use in digital and print marketing materials.`,
  },
  {
    id: 'c-3',
    projectName: 'Torres Portrait Session',
    clientName: 'Maria Torres',
    status: 'Draft',
    sentDate: null,
    signedDate: null,
    body: `This Photography Services Agreement is being prepared for a portrait session with Maria Torres, scheduled for April 12, 2026.\n\n1. SERVICES\nPhotographer will provide a 90-minute portrait session and deliver 30 fully edited digital images.\n\n2. PAYMENT\nSession fee of $450 USD due upon booking.\n\n3. USAGE\nImages are licensed for personal use only. Commercial usage requires a separate licensing agreement.`,
  },
]

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-0042',
    project: 'Johnson Wedding',
    clientName: 'Sarah & Tom Johnson',
    amount: 1600,
    status: 'Paid',
    dueDate: 'Mar 10, 2026',
    paidDate: 'Mar 8, 2026',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-0043',
    project: 'Meridian Hotel Brand',
    clientName: 'Alex Torres',
    amount: 1800,
    status: 'Unpaid',
    dueDate: 'Apr 20, 2026',
    paidDate: null,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-0041',
    project: 'Coastal Real Estate',
    clientName: 'Property Pros LLC',
    amount: 920,
    status: 'Overdue',
    dueDate: 'Mar 15, 2026',
    paidDate: null,
  },
]

/* ------------------------------------------------------------------ */
/*  Status configs                                                      */
/* ------------------------------------------------------------------ */

const CONTRACT_STATUS: Record<ContractStatus, { label: string; className: string; icon: React.ElementType }> = {
  Draft:   { label: 'Draft',  className: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30', icon: FileText },
  Sent:    { label: 'Sent',   className: 'bg-sky-400/10 text-sky-400 border-sky-400/20', icon: Send },
  Signed:  { label: 'Signed', className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: CheckCircle2 },
  Expired: { label: 'Expired',className: 'bg-error/10 text-error border-error/20', icon: AlertTriangle },
}

const INVOICE_STATUS: Record<InvoiceStatus, { label: string; className: string; icon: React.ElementType }> = {
  Unpaid:  { label: 'Unpaid',  className: 'bg-amber-400/10 text-amber-400 border-amber-400/20', icon: Clock },
  Paid:    { label: 'Paid',    className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: CheckCircle2 },
  Overdue: { label: 'Overdue', className: 'bg-error/10 text-error border-error/20', icon: AlertTriangle },
}

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low ${className}`}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Contract preview panel                                             */
/* ------------------------------------------------------------------ */

function ContractPreview({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [body, setBody] = useState(contract.body)

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
        <div>
          <h3 className="font-headline font-extrabold text-on-surface">{contract.projectName}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{contract.clientName}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="space-y-1.5">
          <SectionLabel>Contract Body</SectionLabel>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-on-surface font-body leading-relaxed outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Signature blocks */}
        <div className="space-y-1.5">
          <SectionLabel>Signature Blocks</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            {['Photographer', 'Client'].map((party) => (
              <div key={party} className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 space-y-3">
                <p className="text-xs font-medium text-on-surface-variant">{party}</p>
                <div className="h-12 rounded-lg border border-dashed border-outline-variant/30 flex items-center justify-center">
                  <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider">Signature</span>
                </div>
                <div className="h-px bg-outline-variant/20" />
                <p className="text-[10px] text-on-surface-variant/50">Date: ______________</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-outline-variant/20 flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity">
          <Send size={14} />
          Send to Client
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
          <Download size={14} />
          PDF
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Contracts tab                                                       */
/* ------------------------------------------------------------------ */

function ContractsTab() {
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS)
  const [selectedId, setSelectedId] = useState<string | null>('c-1')

  function addContract() {
    const newContract: Contract = {
      id: `c-${Date.now()}`,
      projectName: 'New Project',
      clientName: 'Client Name',
      status: 'Draft',
      sentDate: null,
      signedDate: null,
      body: 'Start writing your contract here...',
    }
    setContracts([newContract, ...contracts])
    setSelectedId(newContract.id)
  }

  const selectedContract = contracts.find((c) => c.id === selectedId) ?? null

  return (
    <div className="flex gap-5 min-h-[520px]">
      {/* List */}
      <div className="flex flex-col gap-3 w-full max-w-sm shrink-0">
        <button
          onClick={addContract}
          className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant/40 px-4 py-3 text-sm font-medium text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Plus size={15} />
          New Contract
        </button>

        {contracts.map((contract) => {
          const cfg = CONTRACT_STATUS[contract.status]
          const StatusIcon = cfg.icon
          const isSelected = selectedId === contract.id

          return (
            <button
              key={contract.id}
              onClick={() => setSelectedId(isSelected ? null : contract.id)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isSelected
                  ? 'border-primary/40 bg-surface-container'
                  : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-on-surface truncate">{contract.projectName}</p>
                <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}>
                  <StatusIcon size={9} />
                  {cfg.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant truncate">{contract.clientName}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-on-surface-variant/50">
                {contract.sentDate && <span>Sent {contract.sentDate}</span>}
                {contract.signedDate && <span className="text-emerald-400">Signed {contract.signedDate}</span>}
                {!contract.sentDate && <span>Not sent</span>}
              </div>
              {isSelected && <ChevronRight size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />}
            </button>
          )
        })}
      </div>

      {/* Preview */}
      <div className="flex-1 min-w-0">
        {selectedContract ? (
          <ContractPreview contract={selectedContract} onClose={() => setSelectedId(null)} />
        ) : (
          <Card className="flex flex-col items-center justify-center h-full py-16">
            <FileSignature size={40} className="text-on-surface-variant/20 mb-3" />
            <p className="text-sm font-medium text-on-surface">Select a contract to preview</p>
            <p className="text-xs text-on-surface-variant mt-1">Or create a new one to get started</p>
          </Card>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Invoices tab                                                        */
/* ------------------------------------------------------------------ */

function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)

  function markPaid(id: string) {
    setInvoices(invoices.map((inv) =>
      inv.id === id
        ? { ...inv, status: 'Paid', paidDate: 'Mar 30, 2026' }
        : inv
    ))
  }

  function addInvoice() {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      project: 'New Project',
      clientName: 'Client Name',
      amount: 0,
      status: 'Unpaid',
      dueDate: 'Apr 30, 2026',
      paidDate: null,
    }
    setInvoices([...invoices, newInvoice])
  }

  const totalUnpaid = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Outstanding', value: `$${totalUnpaid.toLocaleString()}`, accent: 'text-amber-400' },
          { label: 'Collected', value: `$${totalPaid.toLocaleString()}`, accent: 'text-emerald-400' },
          { label: 'Total Invoices', value: String(invoices.length), accent: 'text-primary' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <SectionLabel>{label}</SectionLabel>
            <p className={`font-headline text-2xl font-extrabold mt-1 ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* New invoice button */}
      <div className="flex justify-end">
        <button
          onClick={addInvoice}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          New Invoice
        </button>
      </div>

      {/* Invoice list */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {['Invoice #', 'Project', 'Client', 'Amount', 'Status', 'Due Date', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant/60">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const cfg = INVOICE_STATUS[invoice.status]
                const StatusIcon = cfg.icon
                return (
                  <tr key={invoice.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm font-medium text-on-surface">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-on-surface">{invoice.project}</td>
                    <td className="px-4 py-3.5 text-sm text-on-surface-variant">{invoice.clientName}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm font-semibold text-on-surface">${invoice.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${cfg.className}`}>
                        <StatusIcon size={9} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-on-surface-variant">
                      {invoice.paidDate ? (
                        <span className="text-emerald-400">Paid {invoice.paidDate}</span>
                      ) : (
                        invoice.dueDate
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {invoice.status !== 'Paid' && (
                          <>
                            <button className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
                              <Bell size={10} />
                              Remind
                            </button>
                            <button
                              onClick={() => markPaid(invoice.id)}
                              className="flex items-center gap-1 rounded-lg border border-emerald-400/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                            >
                              <CheckCircle2 size={10} />
                              Mark Paid
                            </button>
                          </>
                        )}
                        {invoice.status === 'Paid' && (
                          <button className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
                            <Download size={10} />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

type Tab = 'Contracts' | 'Invoices'

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Contracts')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <FileText size={22} className="text-primary shrink-0" />
          <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">Contracts & Invoices</h1>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage agreements and billing for every project
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-low p-1 w-fit">
        {(['Contracts', 'Invoices'] as Tab[]).map((tab) => {
          const Icon = tab === 'Contracts' ? FileSignature : ReceiptText
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={14} />
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'Contracts' ? <ContractsTab /> : <InvoicesTab />}
    </div>
  )
}
