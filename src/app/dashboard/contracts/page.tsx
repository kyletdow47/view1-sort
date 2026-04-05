'use client'

/**
 * Contracts & Documents page — /dashboard/contracts
 *
 * Pencil frame: UuJdw
 * Three tabs: Contracts | Templates | Questionnaires
 *
 * HelloSign (Dropbox Sign) integration is STUBBED throughout.
 * TODO(hellosign): Install hellosign-sdk, add HELLOSIGN_API_KEY to env,
 *   then replace stub send/sign handlers with real API calls.
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  Plus,
  Send,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileQuestion,
  LayoutTemplate,
  Search,
  User,
  CalendarDays,
  DollarSign,
  ChevronDown,
  Copy,
  MoreHorizontal,
} from 'lucide-react'
import type {
  ContractRecord,
  ContractTemplate,
  QuestionnaireRecord,
  ContractTab,
  ContractFilter,
  ContractStatus,
} from '@/types/contracts'

// ─────────────────────────────────────────────────────────────
//  Mock data  (TODO: replace with Supabase queries)
// ─────────────────────────────────────────────────────────────

const INITIAL_CONTRACTS: ContractRecord[] = [
  {
    id: 'c-1',
    projectName: 'Smith Wedding Photography',
    clientName: 'Sarah & Jordan Smith',
    clientEmail: 'sarah@example.com',
    category: 'Wedding',
    type: 'Wedding Photography Contract',
    status: 'signed',
    eventDate: 'June 15, 2026',
    valueInCents: 349500,
    sentDate: 'Mar 1, 2026',
    signedDate: 'Mar 3, 2026',
    createdAt: '2026-02-28',
    helloSignRequestId: 'hs_mock_001',
    body: `This Photography Services Agreement ("Agreement") is entered into as of March 1, 2026, between Kyle Dow Photography ("Photographer") and Sarah & Jordan Smith ("Client").\n\n1. SERVICES\nPhotographer agrees to provide wedding photography services for the event scheduled on June 15, 2026. Coverage includes 8 hours of photography, two photographers, and delivery of 800+ fully edited digital images.\n\n2. PAYMENT\nClient agrees to pay a total of $3,495 USD. A 50% retainer of $1,747.50 is due upon signing. The remaining balance is due 14 days before the event date.\n\n3. DELIVERABLES\nPhotographer will deliver an online gallery within 6 weeks of the event date.\n\n4. CANCELLATION\nCancellations made fewer than 30 days before the event forfeit the retainer.\n\n5. INTELLECTUAL PROPERTY\nPhotographer retains all intellectual property rights and copyright to the photographs.`,
  },
  {
    id: 'c-2',
    projectName: 'Johnson Commercial Shoot',
    clientName: 'Alex Johnson',
    clientEmail: 'alex@meridian.com',
    category: 'Commercial',
    type: 'Commercial License Agreement',
    status: 'sent',
    eventDate: 'Apr 20, 2026',
    valueInCents: 180000,
    sentDate: 'Mar 20, 2026',
    signedDate: null,
    createdAt: '2026-03-18',
    helloSignRequestId: 'hs_mock_002',
    body: `This Photography Services Agreement is entered into as of March 20, 2026, between Kyle Dow Photography ("Photographer") and Johnson Enterprises ("Client").\n\n1. SERVICES\nPhotographer will provide commercial photography services for a half-day brand shoot on April 20, 2026.\n\n2. PAYMENT\nClient agrees to pay $1,800 USD net-30 upon delivery of final images.\n\n3. LICENSE\nClient receives a perpetual commercial license for all delivered images for marketing and promotional purposes.`,
  },
  {
    id: 'c-3',
    projectName: 'Porter Portrait Session',
    clientName: 'Maria Porter',
    clientEmail: 'maria@example.com',
    category: 'Portrait',
    type: 'Portrait Session Agreement',
    status: 'draft',
    eventDate: 'Apr 12, 2026',
    valueInCents: 45000,
    sentDate: null,
    signedDate: null,
    createdAt: '2026-03-25',
    helloSignRequestId: null,
    body: `This Photography Services Agreement is being prepared for a portrait session with Maria Porter, scheduled for April 12, 2026.\n\n1. SERVICES\nPhotographer will provide a 90-minute portrait session and deliver 30 fully edited digital images.\n\n2. PAYMENT\nSession fee of $450 USD due upon booking.\n\n3. USAGE\nImages are licensed for personal use only.`,
  },
  {
    id: 'c-4',
    projectName: 'Anderson Family Portraits',
    clientName: 'The Anderson Family',
    clientEmail: 'anderson@example.com',
    category: 'Family',
    type: 'Family Session Contract',
    status: 'expired',
    eventDate: 'Jan 5, 2026',
    valueInCents: 60000,
    sentDate: 'Dec 10, 2025',
    signedDate: null,
    createdAt: '2025-12-08',
    helloSignRequestId: 'hs_mock_003',
    body: `This Photography Services Agreement for a family portrait session was prepared on December 8, 2025. The session scheduled for January 5, 2026 has passed without a signed agreement.\n\n1. SERVICES\nPhotographer will provide a 2-hour family portrait session.\n\n2. PAYMENT\nSession fee of $600 USD due upon booking.`,
  },
]

const MOCK_TEMPLATES: ContractTemplate[] = [
  {
    id: 't-1',
    name: 'Wedding Photography Contract',
    category: 'Wedding',
    body: 'Template body for wedding photography...',
    variableHints: ['{{client_name}}', '{{event_date}}', '{{total_amount}}', '{{retainer_amount}}'],
    lastUsedAt: 'Mar 2026',
    createdAt: '2026-01-01',
  },
  {
    id: 't-2',
    name: 'Portrait Session Agreement',
    category: 'Portrait',
    body: 'Template body for portrait sessions...',
    variableHints: ['{{client_name}}', '{{session_date}}', '{{session_fee}}'],
    lastUsedAt: 'Feb 2026',
    createdAt: '2026-01-01',
  },
  {
    id: 't-3',
    name: 'Commercial License Agreement',
    category: 'Commercial',
    body: 'Template body for commercial licensing...',
    variableHints: ['{{client_name}}', '{{shoot_date}}', '{{license_type}}', '{{total_amount}}'],
    lastUsedAt: 'Jan 2026',
    createdAt: '2026-01-01',
  },
  {
    id: 't-4',
    name: 'Event Photography Contract',
    category: 'Event',
    body: 'Template body for event photography...',
    variableHints: ['{{client_name}}', '{{event_name}}', '{{event_date}}', '{{hours}}'],
    lastUsedAt: 'Dec 2025',
    createdAt: '2025-11-01',
  },
]

const MOCK_QUESTIONNAIRES: QuestionnaireRecord[] = [
  {
    id: 'q-1',
    name: 'Wedding Pre-Shoot Questionnaire',
    category: 'Wedding',
    fields: [],
    responseCount: 12,
    createdAt: '2026-01-01',
    lastSentAt: 'Mar 2026',
  },
  {
    id: 'q-2',
    name: 'Portrait Session Details',
    category: 'Portrait',
    fields: [],
    responseCount: 8,
    createdAt: '2026-01-01',
    lastSentAt: 'Feb 2026',
  },
  {
    id: 'q-3',
    name: 'Commercial Brief',
    category: 'Commercial',
    fields: [],
    responseCount: 3,
    createdAt: '2026-01-01',
    lastSentAt: 'Jan 2026',
  },
]

// ─────────────────────────────────────────────────────────────
//  Status config
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; bg: string; text: string }
> = {
  draft:   { label: 'Draft',   bg: 'rgba(255,255,255,0.08)',  text: '#FFFFFF80' },
  sent:    { label: 'Sent',    bg: 'rgba(96,165,250,0.18)',   text: '#60A5FA'   },
  signed:  { label: 'Signed',  bg: 'rgba(52,211,153,0.18)',   text: '#34D399'   },
  expired: { label: 'Expired', bg: 'rgba(248,113,113,0.18)',  text: '#F87171'   },
}

const FILTER_OPTIONS: { key: ContractFilter; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'sent',    label: 'Sent' },
  { key: 'signed',  label: 'Signed' },
  { key: 'draft',   label: 'Draft' },
  { key: 'expired', label: 'Expired' },
]

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatCents(cents: number | null): string {
  if (cents === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

// ─────────────────────────────────────────────────────────────
//  Stat cell
// ─────────────────────────────────────────────────────────────

function StatCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div
      className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <Icon className="h-4 w-4 shrink-0 text-white/40" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">{label}</p>
        <p className="truncate text-[13px] font-semibold text-white/90">{value}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Contract preview panel
// ─────────────────────────────────────────────────────────────

function ContractPreview({
  contract,
  onClose,
  onSend,
}: {
  contract: ContractRecord
  onClose: () => void
  onSend: (id: string) => void
}) {
  const [body, setBody] = useState(contract.body)
  const [sending, setSending] = useState(false)
  const cfg = STATUS_CONFIG[contract.status]

  async function handleSend() {
    setSending(true)
    try {
      // TODO(hellosign): Replace with HelloSign API call:
      //   const sdk = new HelloSign({ key: process.env.HELLOSIGN_API_KEY })
      //   const result = await sdk.signatureRequest.send({
      //     title: contract.type,
      //     subject: `Please sign: ${contract.projectName}`,
      //     message: 'Your photographer has sent you a contract to sign.',
      //     signers: [{ email_address: contract.clientEmail, name: contract.clientName }],
      //     file_url: [/* PDF URL from Supabase Storage */],
      //   })
      //   await updateContractHelloSignId(contract.id, result.signature_request.signature_request_id)
      await new Promise<void>((resolve) => setTimeout(resolve, 1200))
      onSend(contract.id)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="flex h-full flex-col rounded-2xl"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between p-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-white">{contract.projectName}</h3>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: cfg.bg, color: cfg.text }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-white/50">{contract.type}</p>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-white/35">
            <span>Created {contract.createdAt}</span>
            {contract.sentDate && <span>· Sent {contract.sentDate}</span>}
            {contract.signedDate && (
              <span className="text-emerald-400">· Signed {contract.signedDate}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            title="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-2 px-5 py-3">
        <StatCell icon={User} label="Client" value={contract.clientName} />
        <StatCell icon={CalendarDays} label="Event Date" value={contract.eventDate ?? 'TBD'} />
        <StatCell
          icon={DollarSign}
          label="Contract Value"
          value={formatCents(contract.valueInCents)}
        />
      </div>

      {/* Body editor */}
      <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          aria-label="Contract body"
          className="w-full resize-none rounded-xl px-4 py-3 text-[13px] leading-relaxed text-white/80 outline-none"
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        />

        {/* Signature blocks */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Signatures
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['Photographer', 'Client'] as const).map((party) => (
              <div
                key={party}
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                  {party}
                </p>
                <div
                  className="flex h-10 items-center justify-center rounded-lg"
                  style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
                >
                  {contract.status === 'signed' && party === 'Client' ? (
                    <span className="text-[11px] font-medium text-emerald-400">✓ Signed</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-white/20">
                      Signature
                    </span>
                  )}
                </div>
                <div className="h-px bg-white/[0.06]" />
                <p className="text-[10px] text-white/30">
                  {party === 'Photographer' ? 'Kyle Dow Photography' : contract.clientName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex gap-3 p-5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={handleSend}
          disabled={sending || contract.status === 'signed'}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
          }}
        >
          {sending ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {contract.status === 'signed'
            ? 'Contract Signed'
            : sending
              ? 'Sending…'
              : 'Send Copy'}
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Contracts tab
// ─────────────────────────────────────────────────────────────

function ContractsTab() {
  const [contracts, setContracts] = useState<ContractRecord[]>(INITIAL_CONTRACTS)
  const [selectedId, setSelectedId] = useState<string | null>('c-1')
  const [filter, setFilter] = useState<ContractFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const matchFilter = filter === 'all' || c.status === filter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        c.projectName.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [contracts, filter, search])

  const counts = useMemo(
    () => ({
      signed:  contracts.filter((c) => c.status === 'signed').length,
      sent:    contracts.filter((c) => c.status === 'sent').length,
      draft:   contracts.filter((c) => c.status === 'draft').length,
      expired: contracts.filter((c) => c.status === 'expired').length,
    }),
    [contracts],
  )

  function addContract() {
    const newContract: ContractRecord = {
      id: `c-${Date.now()}`,
      projectName: 'New Contract',
      clientName: 'Client Name',
      clientEmail: '',
      category: 'Other',
      type: 'Photography Contract',
      status: 'draft',
      eventDate: null,
      valueInCents: null,
      sentDate: null,
      signedDate: null,
      createdAt: new Date().toISOString().slice(0, 10),
      body: 'Start writing your contract here...',
      helloSignRequestId: null,
    }
    setContracts([newContract, ...contracts])
    setSelectedId(newContract.id)
  }

  function handleSend(id: string) {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'sent' as ContractStatus,
              sentDate: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            }
          : c,
      ),
    )
  }

  const selected = contracts.find((c) => c.id === selectedId) ?? null

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden md:flex-row">
      {/* Left panel — list */}
      <div className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto md:w-[280px]">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contracts…"
            className="flex-1 bg-transparent text-[13px] text-white/80 placeholder-white/30 outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
              style={{
                background:
                  filter === key ? 'rgba(99,102,241,0.30)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${
                  filter === key ? 'rgba(99,102,241,0.50)' : 'rgba(255,255,255,0.12)'
                }`,
                color: filter === key ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* New contract */}
        <button
          onClick={addContract}
          className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-[13px] font-medium text-white/50 transition-colors hover:border-indigo-400/40 hover:text-indigo-300"
        >
          <Plus className="h-4 w-4" />
          New Contract
        </button>

        {/* Contract list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl py-8">
            <FileText className="mb-2 h-8 w-8 text-white/15" />
            <p className="text-[12px] text-white/30">No contracts found</p>
          </div>
        ) : (
          filtered.map((contract) => {
            const cfg = STATUS_CONFIG[contract.status]
            const isSelected = selectedId === contract.id
            return (
              <button
                key={contract.id}
                onClick={() => setSelectedId(isSelected ? null : contract.id)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: isSelected
                    ? 'rgba(99,102,241,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${
                    isSelected ? 'rgba(99,102,241,0.40)' : 'rgba(255,255,255,0.10)'
                  }`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold leading-tight text-white/90">
                    {contract.projectName}
                  </p>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-white/40">{contract.clientName}</p>
                <p className="mt-0.5 text-[10px] text-white/30">{contract.type}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
                  {contract.eventDate && <span>{contract.eventDate}</span>}
                  {contract.valueInCents !== null && (
                    <span className="font-mono">{formatCents(contract.valueInCents)}</span>
                  )}
                </div>
              </button>
            )
          })
        )}

        {/* Status summary */}
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-2 text-[11px] text-white/35"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            {counts.signed} Signed
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-400" />
            {counts.sent} Sent
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-white/30" />
            {counts.draft} Draft
          </span>
          {counts.expired > 0 && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              {counts.expired} Expired
            </span>
          )}
        </div>
      </div>

      {/* Right panel — contract detail */}
      <div className="min-w-0 flex-1">
        {selected ? (
          <ContractPreview
            contract={selected}
            onClose={() => setSelectedId(null)}
            onSend={handleSend}
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FileText className="mb-3 h-10 w-10 text-white/15" />
            <p className="text-[13px] font-medium text-white/40">Select a contract to preview</p>
            <p className="mt-1 text-[11px] text-white/25">Or create a new one to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Templates tab
// ─────────────────────────────────────────────────────────────

function TemplatesTab() {
  const [templates] = useState<ContractTemplate[]>(MOCK_TEMPLATES)

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-white/50">
          {templates.length} template{templates.length !== 1 ? 's' : ''} available
        </p>
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
        {templates.map((t) => (
          <button
            key={t.id}
            className="flex flex-col gap-3 rounded-xl p-4 text-left transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div className="flex items-start justify-between">
              <LayoutTemplate className="h-5 w-5 shrink-0 text-indigo-400" />
              <span className="rounded-full bg-indigo-400/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                {t.category}
              </span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/90">{t.name}</p>
              <p className="mt-0.5 text-[11px] text-white/35">
                Last used {t.lastUsedAt ?? 'never'}
              </p>
            </div>
            {t.variableHints.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {t.variableHints.slice(0, 3).map((hint) => (
                  <span
                    key={hint}
                    className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-white/40"
                  >
                    {hint}
                  </span>
                ))}
                {t.variableHints.length > 3 && (
                  <span className="text-[9px] text-white/25">
                    +{t.variableHints.length - 3} more
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Questionnaires tab
// ─────────────────────────────────────────────────────────────

function QuestionnairesTab() {
  const [questionnaires] = useState<QuestionnaireRecord[]>(MOCK_QUESTIONNAIRES)

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-white/50">
          {questionnaires.length} questionnaire{questionnaires.length !== 1 ? 's' : ''}
        </p>
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Questionnaire
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {questionnaires.map((q) => (
          <button
            key={q.id}
            className="flex items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <FileQuestion className="h-8 w-8 shrink-0 rounded-xl bg-violet-400/15 p-1.5 text-violet-300" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white/90">{q.name}</p>
              <p className="text-[11px] text-white/40">
                {q.category}
                {q.lastSentAt != null && ` · Last sent ${q.lastSentAt}`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[15px] font-bold text-white/80">{q.responseCount}</p>
              <p className="text-[10px] text-white/35">responses</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-white/25">
        Drag-and-drop questionnaire builder — coming in next sprint
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────

const TABS: {
  key: ContractTab
  icon: React.ElementType
  label: string
}[] = [
  { key: 'Contracts',      icon: FileText,       label: 'Contracts' },
  { key: 'Templates',      icon: LayoutTemplate, label: 'Templates' },
  { key: 'Questionnaires', icon: FileQuestion,   label: 'Questionnaires' },
]

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<ContractTab>('Contracts')
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0">
      {/* Page header */}
      <div
        className="flex shrink-0 items-start justify-between px-8 pb-4 pt-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-white">
            Contracts &amp; Documents
          </h1>
          <p className="mt-0.5 text-[13px] text-white/45">
            Contracts, contract templates, questionnaires, and import tools
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Share Template button */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white/90"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Share Template
              <ChevronDown className="h-3 w-3" />
            </button>
            {showTemplateDropdown && (
              <div
                className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl py-1"
                style={{
                  background: 'rgba(20,20,30,0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {['Wedding Contract', 'Portrait Contract', 'Commercial Agreement'].map((name) => (
                  <button
                    key={name}
                    onClick={() => setShowTemplateDropdown(false)}
                    className="flex w-full items-center px-4 py-2 text-[12px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Contract gradient button */}
          <button
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Contract
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex shrink-0 items-center px-8 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        onClick={() => setShowTemplateDropdown(false)}
      >
        <div
          className="flex items-center gap-1 rounded-2xl p-1"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {TABS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === key
                  ? 'bg-white/[0.15] font-semibold text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div
        className="flex flex-1 overflow-hidden px-6 py-4"
        onClick={() => setShowTemplateDropdown(false)}
      >
        {activeTab === 'Contracts' && <ContractsTab />}
        {activeTab === 'Templates' && <TemplatesTab />}
        {activeTab === 'Questionnaires' && <QuestionnairesTab />}
      </div>
    </div>
  )
}
