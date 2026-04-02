'use client'

import { useState } from 'react'
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
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type ContractStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired'
type Tab = 'Contracts' | 'Templates' | 'Questionnaires'

interface Contract {
  id: string
  projectName: string
  clientName: string
  status: ContractStatus
  sentDate: string | null
  signedDate: string | null
  type: string
  body: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'c-1',
    projectName: 'Smith Wedding Photography',
    clientName: 'Sarah & Tom Smith',
    status: 'Signed',
    sentDate: 'Mar 1, 2026',
    signedDate: 'Mar 3, 2026',
    type: 'Wedding Contract',
    body: `This Photography Services Agreement ("Agreement") is entered into as of March 1, 2026, between Kyle Dow Photography ("Photographer") and Sarah & Tom Smith ("Client").\n\n1. SERVICES\nPhotographer agrees to provide wedding photography services for the event scheduled on June 14, 2026. Coverage includes 8 hours of photography, two photographers, and delivery of 800+ fully edited digital images.\n\n2. PAYMENT\nClient agrees to pay a total of $3,200 USD. A 50% retainer of $1,600 is due upon signing. The remaining balance is due 14 days before the event date.\n\n3. DELIVERABLES\nPhotographer will deliver an online gallery within 6 weeks of the event date.\n\n4. CANCELLATION\nCancellations made fewer than 30 days before the event forfeit the retainer.`,
  },
  {
    id: 'c-2',
    projectName: 'Meridian Hotel Brand',
    clientName: 'Alex Torres',
    status: 'Sent',
    sentDate: 'Mar 20, 2026',
    signedDate: null,
    type: 'Commercial Contract',
    body: `This Photography Services Agreement is entered into as of March 20, 2026, between Kyle Dow Photography ("Photographer") and Meridian Hotel Group ("Client").\n\n1. SERVICES\nPhotographer will provide commercial photography services for a half-day brand shoot on April 5, 2026.\n\n2. PAYMENT\nClient agrees to pay $1,800 USD net-30 upon delivery of final images.\n\n3. LICENSE\nClient receives a perpetual commercial license for all delivered images.`,
  },
  {
    id: 'c-3',
    projectName: 'Torres Portrait Session',
    clientName: 'Maria Torres',
    status: 'Draft',
    sentDate: null,
    signedDate: null,
    type: 'Portrait Contract',
    body: `This Photography Services Agreement is being prepared for a portrait session with Maria Torres, scheduled for April 12, 2026.\n\n1. SERVICES\nPhotographer will provide a 90-minute portrait session and deliver 30 fully edited digital images.\n\n2. PAYMENT\nSession fee of $450 USD due upon booking.\n\n3. USAGE\nImages are licensed for personal use only.`,
  },
]

const MOCK_TEMPLATES = [
  { id: 't-1', name: 'Wedding Photography Contract', category: 'Wedding', lastUsed: 'Mar 2026' },
  { id: 't-2', name: 'Portrait Session Agreement', category: 'Portrait', lastUsed: 'Feb 2026' },
  { id: 't-3', name: 'Commercial License Agreement', category: 'Commercial', lastUsed: 'Jan 2026' },
  { id: 't-4', name: 'Event Photography Contract', category: 'Events', lastUsed: 'Dec 2025' },
]

const MOCK_QUESTIONNAIRES = [
  { id: 'q-1', name: 'Wedding Pre-Shoot Questionnaire', responses: 12, category: 'Wedding' },
  { id: 'q-2', name: 'Portrait Session Details', responses: 8, category: 'Portrait' },
  { id: 'q-3', name: 'Commercial Brief', responses: 3, category: 'Commercial' },
]

/* ------------------------------------------------------------------ */
/*  Status config                                                       */
/* ------------------------------------------------------------------ */

const CONTRACT_STATUS: Record<ContractStatus, { label: string; bg: string; text: string }> = {
  Draft:   { label: 'Draft',   bg: 'rgba(255,255,255,0.08)',  text: '#FFFFFF80' },
  Sent:    { label: 'Sent',    bg: 'rgba(96,165,250,0.18)',   text: '#60A5FA'   },
  Signed:  { label: 'Signed',  bg: 'rgba(52,211,153,0.18)',   text: '#34D399'   },
  Expired: { label: 'Expired', bg: 'rgba(248,113,113,0.18)',  text: '#F87171'   },
}

/* ------------------------------------------------------------------ */
/*  Contract preview                                                    */
/* ------------------------------------------------------------------ */

function ContractPreview({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [body, setBody] = useState(contract.body)

  return (
    <div
      className="flex h-full flex-col rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Preview header */}
      <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h3 className="text-[15px] font-bold text-white">{contract.projectName}</h3>
          <p className="mt-0.5 text-[12px] text-white/50">{contract.clientName}</p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-white/40">
            <span>{contract.type}</span>
            {contract.sentDate && <span>· Sent {contract.sentDate}</span>}
            {contract.signedDate && <span className="text-emerald-400">· Signed {contract.signedDate}</span>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="w-full rounded-xl px-4 py-3 text-[13px] leading-relaxed text-white/80 outline-none resize-none"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.10)' }}
        />

        {/* Signature blocks */}
        <div className="grid grid-cols-2 gap-3">
          {['Photographer', 'Client'].map((party) => (
            <div
              key={party}
              className="rounded-xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">{party}</p>
              <div
                className="flex h-10 items-center justify-center rounded-lg"
                style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
              >
                <span className="text-[10px] text-white/20 uppercase tracking-wider">Signature</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <p className="text-[10px] text-white/30">Date: ______________</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
        >
          <Send className="h-3.5 w-3.5" />
          Send to Client
        </button>
        <button
          className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </button>
      </div>
    </div>
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
      projectName: 'New Contract',
      clientName: 'Client Name',
      status: 'Draft',
      sentDate: null,
      signedDate: null,
      type: 'Photography Contract',
      body: 'Start writing your contract here...',
    }
    setContracts([newContract, ...contracts])
    setSelectedId(newContract.id)
  }

  const selected = contracts.find((c) => c.id === selectedId) ?? null

  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* Left list */}
      <div className="flex w-[280px] shrink-0 flex-col gap-2 overflow-y-auto">
        <button
          onClick={addContract}
          className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-[13px] font-medium text-white/50 transition-colors hover:border-indigo-400/40 hover:text-indigo-300"
        >
          <Plus className="h-4 w-4" />
          New Contract
        </button>

        {contracts.map((contract) => {
          const cfg = CONTRACT_STATUS[contract.status]
          const isSelected = selectedId === contract.id
          return (
            <button
              key={contract.id}
              onClick={() => setSelectedId(isSelected ? null : contract.id)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isSelected ? 'rgba(99,102,241,0.40)' : 'rgba(255,255,255,0.10)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-white/90 leading-tight">{contract.projectName}</p>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: cfg.bg, color: cfg.text }}
                >
                  {cfg.label}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-white/40 truncate">{contract.clientName}</p>
              <p className="mt-1 text-[10px] text-white/30">{contract.type}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
                {contract.sentDate && <span>Sent {contract.sentDate}</span>}
                {contract.signedDate && <span className="text-emerald-400/80">· Signed {contract.signedDate}</span>}
                {!contract.sentDate && <span>Not yet sent</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Right preview */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <ContractPreview contract={selected} onClose={() => setSelectedId(null)} />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <FileText className="h-10 w-10 text-white/15 mb-3" />
            <p className="text-[13px] font-medium text-white/40">Select a contract to preview</p>
            <p className="mt-1 text-[11px] text-white/25">Or create a new one to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Templates tab                                                       */
/* ------------------------------------------------------------------ */

function TemplatesTab() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-white/50">{MOCK_TEMPLATES.length} templates available</p>
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto">
        {MOCK_TEMPLATES.map((t) => (
          <button
            key={t.id}
            className="flex flex-col gap-2 rounded-xl p-4 text-left transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <div className="flex items-start justify-between">
              <LayoutTemplate className="h-5 w-5 text-indigo-400 shrink-0" />
              <span className="rounded-full bg-indigo-400/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                {t.category}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-white/90">{t.name}</p>
            <p className="text-[11px] text-white/35">Last used {t.lastUsed}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Questionnaires tab                                                  */
/* ------------------------------------------------------------------ */

function QuestionnairesTab() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-white/50">{MOCK_QUESTIONNAIRES.length} questionnaires</p>
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Questionnaire
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {MOCK_QUESTIONNAIRES.map((q) => (
          <button
            key={q.id}
            className="flex items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <FileQuestion className="h-8 w-8 shrink-0 rounded-xl bg-violet-400/15 p-1.5 text-violet-300" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/90">{q.name}</p>
              <p className="text-[11px] text-white/40">{q.category}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[15px] font-bold text-white/80">{q.responses}</p>
              <p className="text-[10px] text-white/35">responses</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

const TABS: { key: Tab; icon: React.ElementType }[] = [
  { key: 'Contracts', icon: FileText },
  { key: 'Templates', icon: LayoutTemplate },
  { key: 'Questionnaires', icon: FileQuestion },
]

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Contracts')

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col gap-0">
      {/* Tab bar */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex items-center gap-1 rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === key ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {key}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'Contracts' && (
            <>
              <div className="flex items-center gap-3 text-[12px] text-white/40">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> 1 Signed</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-400" /> 1 Sent</span>
                <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-white/30" /> 1 Draft</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden px-6 py-4">
        {activeTab === 'Contracts' && <ContractsTab />}
        {activeTab === 'Templates' && <TemplatesTab />}
        {activeTab === 'Questionnaires' && <QuestionnairesTab />}
      </div>
    </div>
  )
}
