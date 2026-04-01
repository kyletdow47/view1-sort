'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  FileText,
  Plus,
  Send,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSignature,
  X,
  Sparkles,
  ChevronDown,
  GripVertical,
  ClipboardList,
  Users,
  Calendar,
  Type,
  AlignLeft,
  List,
  Upload,
  ExternalLink,
  RefreshCw,
  Eye,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type ContractStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired'
type ContractType = 'Wedding' | 'Commercial' | 'Portrait' | 'Event'
type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'date' | 'file_upload'

interface Contract {
  id: string
  name: string
  clientName: string
  projectName: string
  contractType: ContractType
  status: ContractStatus
  sentDate: string | null
  signedDate: string | null
  hellosignRequestId: string | null
  content: string
}

interface QuestionnaireQuestion {
  id: string
  label: string
  type: QuestionType
  required: boolean
  options?: string[] // for multiple_choice
}

interface QuestionnaireTemplate {
  id: string
  name: string
  shootType: string
  questions: QuestionnaireQuestion[]
  lastUsed: string | null
  usageCount: number
}

interface QuestionnaireSend {
  templateId: string
  clientName: string
  clientEmail: string
  projectName: string
  status: 'Pending' | 'Completed'
  sentDate: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'c-1',
    name: 'Johnson Wedding Contract',
    clientName: 'Sarah & Tom Johnson',
    projectName: 'Johnson Wedding',
    contractType: 'Wedding',
    status: 'Signed',
    sentDate: 'Mar 1, 2026',
    signedDate: 'Mar 3, 2026',
    hellosignRequestId: 'hs_abc123',
    content: `PHOTOGRAPHY SERVICES AGREEMENT

This Photography Services Agreement ("Agreement") is entered into as of March 1, 2026, between Aperture Studios ("Photographer") and Sarah & Tom Johnson ("Client").

1. SERVICES
Photographer agrees to provide wedding photography services for the event scheduled on June 14, 2026. Coverage includes 8 hours of photography, two photographers, and delivery of 800+ fully edited digital images.

2. PAYMENT
Client agrees to pay a total of $3,200 USD. A 50% retainer of $1,600 is due upon signing. The remaining balance is due 14 days before the event date.

3. DELIVERABLES
Photographer will deliver a password-protected online gallery within 6 weeks of the event date. Images will be delivered in full resolution as JPEG files.

4. CANCELLATION
Cancellations made fewer than 30 days before the event forfeit the retainer. Cancellations more than 30 days prior receive a full refund of the retainer.

5. COPYRIGHT
Photographer retains copyright to all images. Client receives a personal use license for all delivered images.`,
  },
  {
    id: 'c-2',
    name: 'Meridian Hotel Commercial',
    clientName: 'Alex Torres',
    projectName: 'Meridian Hotel Brand',
    contractType: 'Commercial',
    status: 'Sent',
    sentDate: 'Mar 20, 2026',
    signedDate: null,
    hellosignRequestId: 'hs_def456',
    content: `COMMERCIAL PHOTOGRAPHY AGREEMENT

This Commercial Photography Agreement is entered into as of March 20, 2026, between Aperture Studios ("Photographer") and Meridian Hotel Group ("Client").

1. SERVICES
Photographer will provide commercial photography for a half-day brand shoot on April 5, 2026, including product, lifestyle, and team photography.

2. PAYMENT
Client agrees to pay $1,800 USD net-30 upon delivery of final images.

3. LICENSE
Client receives a perpetual commercial license for all delivered images for use in digital and print marketing materials. Usage is limited to the Meridian Hotel brand only.

4. USAGE RIGHTS
Third-party sub-licensing is not permitted without written consent from Photographer.`,
  },
  {
    id: 'c-3',
    name: 'Torres Portrait Session',
    clientName: 'Maria Torres',
    projectName: 'Torres Family Portraits',
    contractType: 'Portrait',
    status: 'Draft',
    sentDate: null,
    signedDate: null,
    hellosignRequestId: null,
    content: `PORTRAIT PHOTOGRAPHY AGREEMENT

This Portrait Photography Agreement is being prepared for Maria Torres, scheduled for April 12, 2026.

1. SERVICES
Photographer will provide a 90-minute portrait session and deliver 30 fully edited digital images.

2. PAYMENT
Session fee of $450 USD due upon booking.

3. USAGE
Images are licensed for personal use only. Commercial usage requires a separate licensing agreement.`,
  },
]

const INITIAL_TEMPLATES: QuestionnaireTemplate[] = [
  {
    id: 'qt-1',
    name: 'Wedding Questionnaire',
    shootType: 'Wedding',
    lastUsed: 'Mar 15, 2026',
    usageCount: 12,
    questions: [
      { id: 'q1', label: 'What are the names of the couple?', type: 'short_text', required: true },
      { id: 'q2', label: 'What is the ceremony venue?', type: 'short_text', required: true },
      { id: 'q3', label: 'What is your wedding date?', type: 'date', required: true },
      { id: 'q4', label: 'Describe your vision for the photos', type: 'long_text', required: false },
      { id: 'q5', label: 'How did you find us?', type: 'multiple_choice', required: false, options: ['Instagram', 'Referral', 'Google', 'Wedding fair', 'Other'] },
    ],
  },
  {
    id: 'qt-2',
    name: 'Portrait Session Intake',
    shootType: 'Portrait',
    lastUsed: 'Mar 28, 2026',
    usageCount: 8,
    questions: [
      { id: 'q1', label: 'Who is being photographed?', type: 'short_text', required: true },
      { id: 'q2', label: 'What is the purpose of these photos?', type: 'multiple_choice', required: true, options: ['Personal', 'Corporate headshots', 'Family', 'Maternity', 'Other'] },
      { id: 'q3', label: 'Any specific shots or poses you have in mind?', type: 'long_text', required: false },
      { id: 'q4', label: 'Please upload any inspiration images (optional)', type: 'file_upload', required: false },
    ],
  },
  {
    id: 'qt-3',
    name: 'Commercial Brand Brief',
    shootType: 'Commercial',
    lastUsed: null,
    usageCount: 3,
    questions: [
      { id: 'q1', label: 'Brand name', type: 'short_text', required: true },
      { id: 'q2', label: 'Describe your brand personality', type: 'long_text', required: true },
      { id: 'q3', label: 'Target audience', type: 'short_text', required: true },
      { id: 'q4', label: 'Where will these images be used?', type: 'multiple_choice', required: true, options: ['Website', 'Social media', 'Print ads', 'Packaging', 'All of the above'] },
    ],
  },
]

const INITIAL_SENDS: QuestionnaireSend[] = [
  {
    templateId: 'qt-1',
    clientName: 'Sarah & Tom Johnson',
    clientEmail: 'sarah@example.com',
    projectName: 'Johnson Wedding',
    status: 'Completed',
    sentDate: 'Feb 20, 2026',
  },
  {
    templateId: 'qt-2',
    clientName: 'Maria Torres',
    clientEmail: 'maria@example.com',
    projectName: 'Torres Family Portraits',
    status: 'Pending',
    sentDate: 'Mar 28, 2026',
  },
]

/* ------------------------------------------------------------------ */
/*  Status configs                                                      */
/* ------------------------------------------------------------------ */

const CONTRACT_STATUS: Record<ContractStatus, { label: string; fill: string; text: string; icon: React.ElementType }> = {
  Draft:   { label: 'Draft',   fill: 'bg-[#6b7280]/15', text: 'text-[#9ca3af]', icon: FileText },
  Sent:    { label: 'Sent',    fill: 'bg-[#3b82f6]/15', text: 'text-[#60a5fa]', icon: Send },
  Signed:  { label: 'Signed',  fill: 'bg-[#34d399]/15', text: 'text-[#34d399]', icon: CheckCircle2 },
  Expired: { label: 'Expired', fill: 'bg-[#f87171]/15', text: 'text-[#f87171]', icon: AlertTriangle },
}

const QUESTION_TYPE_CONFIG: Record<QuestionType, { label: string; icon: React.ElementType }> = {
  short_text:      { label: 'Short text',      icon: Type },
  long_text:       { label: 'Long text',        icon: AlignLeft },
  multiple_choice: { label: 'Multiple choice',  icon: List },
  date:            { label: 'Date picker',       icon: Calendar },
  file_upload:     { label: 'File upload',       icon: Upload },
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

function StatusBadge({ status }: { status: ContractStatus }) {
  const cfg = CONTRACT_STATUS[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.fill} ${cfg.text}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  AI Generation Modal                                                 */
/* ------------------------------------------------------------------ */

interface AIGenerateModalProps {
  onClose: () => void
  onGenerated: (contract: Contract) => void
}

const CONTRACT_TEMPLATES: Record<ContractType, string> = {
  Wedding: `PHOTOGRAPHY SERVICES AGREEMENT — WEDDING

This Wedding Photography Services Agreement ("Agreement") is entered into as of {{date}}, between {{photographer_name}} ("Photographer") and {{client_name}} ("Client").

1. EVENT DETAILS
Photographer agrees to provide wedding photography services for the event scheduled on {{event_date}} at {{venue}}. Coverage includes {{hours}} hours of photography.

2. DELIVERABLES
Photographer will deliver {{photo_count}} fully edited digital images via an online gallery within {{turnaround}} weeks of the event.

3. PAYMENT
Total fee: {{total_amount}}. A non-refundable retainer of 50% is due upon signing. Remaining balance due 14 days before the event.

4. CANCELLATION
Client must notify Photographer in writing. Cancellations within 30 days of the event forfeit the full balance. Cancellations 30+ days prior forfeit the retainer only.

5. COPYRIGHT & USAGE
Photographer retains all copyright. Client receives a personal use license for all delivered images.

{{special_terms}}`,

  Commercial: `COMMERCIAL PHOTOGRAPHY AGREEMENT

This Commercial Photography Agreement ("Agreement") is entered into as of {{date}}, between {{photographer_name}} ("Photographer") and {{client_name}} ("Client").

1. SERVICES
Photographer will provide commercial photography services on {{event_date}} for the following project: {{project_description}}.

2. LICENSE
Client receives a {{license_duration}} commercial usage license for all delivered images. License is limited to {{usage_scope}}.

3. PAYMENT
Total fee: {{total_amount}}, payable net-30 upon delivery of final images.

4. EXCLUSIVITY
Photographer retains the right to display images in their portfolio unless Client requests confidentiality in writing.

{{special_terms}}`,

  Portrait: `PORTRAIT PHOTOGRAPHY AGREEMENT

This Portrait Session Agreement is entered into as of {{date}}, between {{photographer_name}} ("Photographer") and {{client_name}} ("Client").

1. SESSION DETAILS
Session date: {{event_date}}. Duration: {{hours}} hours. Location: {{venue}}.

2. DELIVERABLES
Client will receive {{photo_count}} fully edited digital images within {{turnaround}} weeks of the session.

3. PAYMENT
Session fee: {{total_amount}}, due in full upon booking.

4. USAGE
Images are licensed for personal use only. Commercial use requires a separate agreement.

{{special_terms}}`,

  Event: `EVENT PHOTOGRAPHY AGREEMENT

This Event Photography Agreement is entered into as of {{date}}, between {{photographer_name}} ("Photographer") and {{client_name}} ("Client").

1. EVENT DETAILS
Event: {{project_description}} on {{event_date}} at {{venue}}. Coverage: {{hours}} hours.

2. DELIVERABLES
Photographer will deliver {{photo_count}}+ edited images within {{turnaround}} weeks via online gallery.

3. PAYMENT
Total fee: {{total_amount}}. 50% retainer due upon signing; balance due on event day.

4. CANCELLATION
Cancellations within 14 days of the event are non-refundable.

{{special_terms}}`,
}

function AIGenerateModal({ onClose, onGenerated }: AIGenerateModalProps) {
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [contractType, setContractType] = useState<ContractType>('Wedding')
  const [project, setProject] = useState('Johnson Wedding')
  const [client, setClient] = useState('Sarah & Tom Johnson')
  const [specialTerms, setSpecialTerms] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')

  function handleGenerate() {
    setIsGenerating(true)
    // TODO: wire to Supabase Edge Function calling Claude API (claude-sonnet-4-6)
    setTimeout(() => {
      const template = CONTRACT_TEMPLATES[contractType]
      const filled = template
        .replace(/{{date}}/g, 'April 1, 2026')
        .replace(/{{photographer_name}}/g, 'Aperture Studios')
        .replace(/{{client_name}}/g, client)
        .replace(/{{event_date}}/g, 'June 14, 2026')
        .replace(/{{venue}}/g, 'TBD')
        .replace(/{{hours}}/g, '8')
        .replace(/{{photo_count}}/g, '800+')
        .replace(/{{turnaround}}/g, '6')
        .replace(/{{total_amount}}/g, '$3,200')
        .replace(/{{project_description}}/g, project)
        .replace(/{{license_duration}}/g, 'perpetual')
        .replace(/{{usage_scope}}/g, 'digital and print marketing')
        .replace(/{{special_terms}}/g, specialTerms ? `\n6. ADDITIONAL TERMS\n${specialTerms}` : '')
      setGeneratedContent(filled)
      setIsGenerating(false)
      setStep('preview')
    }, 1800)
  }

  function handleAccept() {
    const newContract: Contract = {
      id: `c-${Date.now()}`,
      name: `${client} ${contractType} Contract`,
      clientName: client,
      projectName: project,
      contractType,
      status: 'Draft',
      sentDate: null,
      signedDate: null,
      hellosignRequestId: null,
      content: generatedContent,
    }
    onGenerated(newContract)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-on-surface">Generate Contract with AI</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {step === 'form' ? 'Fill in the details and AI will draft your contract' : 'Review and edit before sending'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'form' ? (
            <div className="space-y-5">
              {/* Project */}
              <div className="space-y-1.5">
                <SectionLabel>Project</SectionLabel>
                <input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="e.g. Johnson Wedding"
                  className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
                />
              </div>

              {/* Client */}
              <div className="space-y-1.5">
                <SectionLabel>Client Name</SectionLabel>
                <input
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g. Sarah & Tom Johnson"
                  className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
                />
              </div>

              {/* Contract type */}
              <div className="space-y-1.5">
                <SectionLabel>Contract Type</SectionLabel>
                <div className="relative">
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full appearance-none rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 pr-10"
                  >
                    {(['Wedding', 'Commercial', 'Portrait', 'Event'] as ContractType[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              {/* Special terms */}
              <div className="space-y-1.5">
                <SectionLabel>Special Terms (optional)</SectionLabel>
                <textarea
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  rows={4}
                  placeholder="Any additional terms, custom clauses, or notes for the AI to include..."
                  className="w-full rounded-xl bg-background px-4 py-3 text-sm text-on-surface leading-relaxed outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Contract generated — review and edit below
              </div>
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={22}
                className="w-full rounded-xl bg-background px-4 py-3 text-sm text-on-surface font-mono leading-relaxed outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/20 flex items-center gap-3">
          {step === 'form' ? (
            <>
              <button
                onClick={onClose}
                className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:border-outline-variant/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !project || !client}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate with AI
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('form')}
                className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:border-outline-variant/50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  // TODO: trigger PDF download via server-side route
                }}
                className="flex items-center gap-2 rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Download size={14} />
                PDF
              </button>
              <button
                onClick={handleAccept}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity"
              >
                <FileSignature size={14} />
                Save as Draft
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Contract detail panel                                               */
/* ------------------------------------------------------------------ */

function ContractDetail({ contract, onClose, onSendForSignature }: {
  contract: Contract
  onClose: () => void
  onSendForSignature: (id: string) => void
}) {
  const [content, setContent] = useState(contract.content)
  const isSendable = contract.status === 'Draft'
  const isSigned = contract.status === 'Signed'

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
        <div className="min-w-0">
          <h3 className="font-headline font-extrabold text-on-surface truncate">{contract.name}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{contract.clientName} · {contract.projectName}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <StatusBadge status={contract.status} />
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* HelloSign status banner */}
      {contract.hellosignRequestId && (
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-4 py-2.5">
          <ExternalLink size={13} className="text-[#60a5fa] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#60a5fa]">HelloSign request active</p>
            <p className="text-[10px] text-on-surface-variant truncate font-mono">{contract.hellosignRequestId}</p>
          </div>
          {isSigned && (
            <span className="text-[10px] font-medium text-emerald-400">Signed {contract.signedDate}</span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-1.5">
          <SectionLabel>Contract Content</SectionLabel>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            readOnly={!isSendable}
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-on-surface font-mono leading-relaxed outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 resize-none disabled:opacity-70"
          />
        </div>
      </div>

      <div className="p-5 border-t border-outline-variant/20 flex gap-3">
        {isSendable && (
          <button
            onClick={() => onSendForSignature(contract.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity"
          >
            <Send size={14} />
            Send for Signature
          </button>
        )}
        {!isSendable && !isSigned && (
          <button
            disabled
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3b82f6]/15 py-2.5 text-sm font-bold text-[#60a5fa] cursor-default"
          >
            <Clock size={14} />
            Awaiting Signature
          </button>
        )}
        {isSigned && (
          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#34d399]/15 py-2.5 text-sm font-bold text-emerald-400">
            <CheckCircle2 size={14} />
            Contract Signed
          </div>
        )}
        <button className="flex items-center gap-2 rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
          <Download size={14} />
          PDF
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Contracts tab                                                        */
/* ------------------------------------------------------------------ */

function ContractsTab() {
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS)
  const [selectedId, setSelectedId] = useState<string | null>('c-1')
  const [showAIModal, setShowAIModal] = useState(false)

  const selectedContract = contracts.find((c) => c.id === selectedId) ?? null

  function handleSendForSignature(contractId: string) {
    // TODO: call POST /api/contracts/send-for-signature → Supabase Edge Function → HelloSign API
    setContracts(prev => prev.map(c =>
      c.id === contractId
        ? { ...c, status: 'Sent', sentDate: 'Apr 1, 2026', hellosignRequestId: `hs_${Date.now()}` }
        : c
    ))
  }

  return (
    <>
      {showAIModal && (
        <AIGenerateModal
          onClose={() => setShowAIModal(false)}
          onGenerated={(contract) => {
            setContracts(prev => [contract, ...prev])
            setSelectedId(contract.id)
          }}
        />
      )}

      <div className="flex gap-5 min-h-[560px]">
        {/* List */}
        <div className="flex flex-col gap-3 w-full max-w-xs shrink-0">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity"
          >
            <Sparkles size={14} />
            Generate Contract
          </button>

          <div className="space-y-2">
            {contracts.map((contract) => {
              const isSelected = selectedId === contract.id
              return (
                <button
                  key={contract.id}
                  onClick={() => setSelectedId(isSelected ? null : contract.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-primary/40 bg-surface-container'
                      : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-on-surface leading-snug">{contract.name}</p>
                    <StatusBadge status={contract.status} />
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant truncate">{contract.clientName}</p>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant/50 truncate">{contract.projectName}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-on-surface-variant/50">
                    {contract.sentDate && <span>Sent {contract.sentDate}</span>}
                    {contract.signedDate && <span className="text-emerald-400">Signed {contract.signedDate}</span>}
                    {!contract.sentDate && <span>Not sent</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0">
          {selectedContract ? (
            <ContractDetail
              contract={selectedContract}
              onClose={() => setSelectedId(null)}
              onSendForSignature={handleSendForSignature}
            />
          ) : (
            <Card className="flex flex-col items-center justify-center h-full py-16">
              <FileSignature size={40} className="text-on-surface-variant/20 mb-3" />
              <p className="text-sm font-medium text-on-surface">Select a contract to preview</p>
              <p className="text-xs text-on-surface-variant mt-1">Or generate a new one with AI</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Questionnaire builder — sortable question row                       */
/* ------------------------------------------------------------------ */

function SortableQuestion({
  question,
  onUpdate,
  onRemove,
}: {
  question: QuestionnaireQuestion
  onUpdate: (q: QuestionnaireQuestion) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const TypeIcon = QUESTION_TYPE_CONFIG[question.type].icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-xl border border-outline-variant/20 bg-surface-container p-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Label */}
        <input
          value={question.label}
          onChange={(e) => onUpdate({ ...question, label: e.target.value })}
          placeholder="Question text"
          className="w-full rounded-lg bg-background px-3 py-1.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/40"
        />

        {/* Type + required */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={question.type}
              onChange={(e) => onUpdate({ ...question, type: e.target.value as QuestionType })}
              className="appearance-none rounded-lg bg-surface-container-high pl-7 pr-6 py-1 text-[11px] text-on-surface-variant outline-none ring-1 ring-outline-variant/20 focus:ring-primary/40"
            >
              {(Object.keys(QUESTION_TYPE_CONFIG) as QuestionType[]).map((t) => (
                <option key={t} value={t}>{QUESTION_TYPE_CONFIG[t].label}</option>
              ))}
            </select>
            <TypeIcon size={11} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
              className="rounded accent-primary"
            />
            <span className="text-[11px] text-on-surface-variant">Required</span>
          </label>

          {question.type === 'multiple_choice' && (
            <span className="text-[10px] text-on-surface-variant/50">
              {question.options?.length ?? 0} options
            </span>
          )}
        </div>

        {/* Options editor for multiple choice */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-1">
            {(question.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const updated = [...(question.options ?? [])]
                    updated[i] = e.target.value
                    onUpdate({ ...question, options: updated })
                  }}
                  className="flex-1 rounded-lg bg-background px-3 py-1 text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/40"
                />
                <button
                  onClick={() => {
                    const updated = (question.options ?? []).filter((_, idx) => idx !== i)
                    onUpdate({ ...question, options: updated })
                  }}
                  className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onUpdate({ ...question, options: [...(question.options ?? []), ''] })}
              className="text-[10px] text-primary hover:underline"
            >
              + Add option
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onRemove(question.id)}
        className="shrink-0 mt-0.5 text-on-surface-variant/30 hover:text-error transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Questionnaire builder modal                                         */
/* ------------------------------------------------------------------ */

interface QuestionnaireBuilderProps {
  template?: QuestionnaireTemplate
  onClose: () => void
  onSave: (t: QuestionnaireTemplate) => void
}

function QuestionnaireBuilder({ template, onClose, onSave }: QuestionnaireBuilderProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [shootType, setShootType] = useState(template?.shootType ?? 'Wedding')
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>(
    template?.questions ?? []
  )

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id)
        const newIndex = items.findIndex((q) => q.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, label: '', type: 'short_text', required: false },
    ])
  }

  function updateQuestion(updated: QuestionnaireQuestion) {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function handleSave() {
    const saved: QuestionnaireTemplate = {
      id: template?.id ?? `qt-${Date.now()}`,
      name,
      shootType,
      questions,
      lastUsed: template?.lastUsed ?? null,
      usageCount: template?.usageCount ?? 0,
    }
    onSave(saved)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <ClipboardList size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-on-surface">
                {template ? 'Edit Questionnaire' : 'Create Questionnaire'}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Drag to reorder questions</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <SectionLabel>Template Name</SectionLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding Questionnaire"
                className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <SectionLabel>Shoot Type</SectionLabel>
              <div className="relative">
                <select
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 pr-10"
                >
                  {['Wedding', 'Portrait', 'Commercial', 'Event', 'Other'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Questions ({questions.length})</SectionLabel>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <Plus size={11} />
                Add question
              </button>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {questions.map((q) => (
                    <SortableQuestion
                      key={q.id}
                      question={q}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/30 py-10 text-center">
                <ClipboardList size={28} className="text-on-surface-variant/20 mb-2" />
                <p className="text-sm text-on-surface-variant">No questions yet</p>
                <button onClick={addQuestion} className="mt-2 text-xs text-primary hover:underline">
                  Add your first question
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant/20 flex gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:border-outline-variant/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <CheckCircle2 size={14} />
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Send questionnaire modal                                            */
/* ------------------------------------------------------------------ */

function SendQuestionnaireModal({
  templates,
  onClose,
  onSent,
}: {
  templates: QuestionnaireTemplate[]
  onClose: () => void
  onSent: (send: QuestionnaireSend) => void
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectName, setProjectName] = useState('')

  function handleSend() {
    // TODO: create questionnaire_submissions row in Supabase + send email with magic link
    onSent({
      templateId,
      clientName,
      clientEmail,
      projectName,
      status: 'Pending',
      sentDate: 'Apr 1, 2026',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Send size={16} className="text-primary" />
            </div>
            <h2 className="font-headline font-bold text-on-surface">Send Questionnaire</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <SectionLabel>Template</SectionLabel>
            <div className="relative">
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full appearance-none rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 pr-10"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            </div>
          </div>

          <div className="space-y-1.5">
            <SectionLabel>Client Name</SectionLabel>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <SectionLabel>Client Email</SectionLabel>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <SectionLabel>Project</SectionLabel>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Johnson Wedding"
              className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant/20 flex gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:border-outline-variant/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!clientName || !clientEmail || !projectName}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send size={14} />
            Send Link
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Questionnaires tab                                                  */
/* ------------------------------------------------------------------ */

function QuestionnairesTab() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>(INITIAL_TEMPLATES)
  const [sends, setSends] = useState<QuestionnaireSend[]>(INITIAL_SENDS)
  const [builderTemplate, setBuilderTemplate] = useState<QuestionnaireTemplate | null | 'new'>(null)
  const [showSendModal, setShowSendModal] = useState(false)

  function saveTemplate(t: QuestionnaireTemplate) {
    setTemplates((prev) => {
      const exists = prev.find((x) => x.id === t.id)
      return exists ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev]
    })
  }

  return (
    <>
      {builderTemplate !== null && (
        <QuestionnaireBuilder
          template={builderTemplate === 'new' ? undefined : builderTemplate}
          onClose={() => setBuilderTemplate(null)}
          onSave={saveTemplate}
        />
      )}

      {showSendModal && (
        <SendQuestionnaireModal
          templates={templates}
          onClose={() => setShowSendModal(false)}
          onSent={(send) => setSends((prev) => [send, ...prev])}
        />
      )}

      <div className="space-y-6">
        {/* Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-surface">Templates</h3>
            <button
              onClick={() => setBuilderTemplate('new')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              Create Questionnaire
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((template) => (
              <Card key={template.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{template.name}</p>
                    <span className="text-[10px] text-on-surface-variant/60">{template.shootType}</span>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                    <ClipboardList size={9} />
                    {template.questions.length} q
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/50">
                  <span>Used {template.usageCount}×</span>
                  {template.lastUsed && <span>Last: {template.lastUsed}</span>}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setBuilderTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 py-1.5 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Eye size={11} />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowSendModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors"
                  >
                    <Send size={11} />
                    Send
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sent questionnaires */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-surface">Sent</h3>
            <button
              onClick={() => setShowSendModal(true)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Send size={11} />
              Send questionnaire
            </button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {['Client', 'Project', 'Template', 'Sent', 'Status', 'Actions'].map((col) => (
                      <th key={col} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant/60">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sends.map((send, i) => {
                    const template = templates.find((t) => t.id === send.templateId)
                    return (
                      <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                              {send.clientName[0]}
                            </div>
                            <span className="text-sm font-medium text-on-surface">{send.clientName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-on-surface-variant">{send.projectName}</td>
                        <td className="px-4 py-3.5 text-sm text-on-surface-variant">{template?.name ?? '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-on-surface-variant">{send.sentDate}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            send.status === 'Completed'
                              ? 'bg-[#34d399]/15 text-[#34d399]'
                              : 'bg-[#fbbf24]/15 text-[#fbbf24]'
                          }`}>
                            {send.status === 'Completed' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                            {send.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {send.status === 'Pending' && (
                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
                                <RefreshCw size={10} />
                                Remind
                              </button>
                              <button className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
                                <ExternalLink size={10} />
                                View
                              </button>
                            </div>
                          )}
                          {send.status === 'Completed' && (
                            <button className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
                              <Eye size={10} />
                              Responses
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {sends.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-on-surface-variant">
                        No questionnaires sent yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

type Tab = 'Contracts' | 'Questionnaires'

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Contracts')

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'Contracts',      icon: FileSignature, label: 'Contracts' },
    { id: 'Questionnaires', icon: ClipboardList,  label: 'Questionnaires' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <FileText size={22} className="text-primary shrink-0" />
          <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">
            Contracts & Docs
          </h1>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          AI-generated contracts, HelloSign e-signatures, and client questionnaires
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-low p-1 w-fit">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Contracts'      && <ContractsTab />}
      {activeTab === 'Questionnaires' && <QuestionnairesTab />}
    </div>
  )
}
