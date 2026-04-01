'use client'

import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  Users, UserPlus, Search, Zap, Plus, X, Mail, Phone, Calendar,
  DollarSign, MessageSquare, FolderOpen, MoreHorizontal, Check,
  Send, FileText, ChevronRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStatus = 'inquiry' | 'quoted' | 'booked' | 'contracted' | 'prepped' | 'shooting'
type ActiveTab = 'pipeline' | 'clients'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  shoot_type: string | null
  event_date: string | null
  value_cents: number
  status: PipelineStatus
  source: string | null
  notes: string | null
  created_at: string
}

interface ClientProject { name: string; status: string; date: string }
interface ClientPayment { amount_cents: number; date: string; project: string }

interface ClientProfile {
  id: string
  name: string
  email: string
  phone: string | null
  total_projects: number
  total_spend_cents: number
  last_contact: string | null
  status: string
  projects: ClientProject[]
  payments: ClientPayment[]
  notes: string
}

interface WorkflowRule {
  id: string
  name: string
  trigger_event: string
  trigger_label: string
  actions: { type: string; label: string }[]
  is_active: boolean
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PIPELINE_COLUMNS: {
  status: PipelineStatus
  label: string
  color: string
  bgColor: string
}[] = [
  { status: 'inquiry',    label: 'Inquiry',    color: '#9ca3af', bgColor: 'rgba(156,163,175,0.08)' },
  { status: 'quoted',     label: 'Quoted',     color: '#a5b4fc', bgColor: 'rgba(165,180,252,0.08)' },
  { status: 'booked',     label: 'Booked',     color: '#6ee7b7', bgColor: 'rgba(110,231,183,0.08)' },
  { status: 'contracted', label: 'Contracted', color: '#fcd34d', bgColor: 'rgba(252,211,77,0.08)'  },
  { status: 'prepped',    label: 'Prepped',    color: '#93c5fd', bgColor: 'rgba(147,197,253,0.08)' },
  { status: 'shooting',   label: 'Shooting',   color: '#fb923c', bgColor: 'rgba(251,146,60,0.08)'  },
]

const AVATAR_GRADIENTS = [
  'from-[#818cf8] to-[#6366f1]', 'from-[#34d399] to-[#059669]',
  'from-[#f97316] to-[#ea580c]', 'from-[#f472b6] to-[#db2777]',
  'from-[#60a5fa] to-[#2563eb]', 'from-[#fbbf24] to-[#d97706]',
  'from-[#a78bfa] to-[#7c3aed]', 'from-[#2dd4bf] to-[#0d9488]',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]!
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtMoney(cents: number): string {
  if (cents === 0) return '—'
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_LEADS: Lead[] = [
  { id: 'l1',  name: 'Sarah & James Mitchell',  email: 'sarah.mitchell@gmail.com',   phone: '+1 (555) 234-5678', shoot_type: 'Wedding',    event_date: '2026-06-14', value_cents: 380000, status: 'inquiry',    source: 'Instagram', notes: null, created_at: '2026-03-28T10:00:00Z' },
  { id: 'l2',  name: 'Emma Chen',               email: 'emma.chen@icloud.com',        phone: null,                shoot_type: 'Portrait',   event_date: '2026-04-20', value_cents: 65000,  status: 'inquiry',    source: 'Referral',  notes: null, created_at: '2026-03-29T09:00:00Z' },
  { id: 'l3',  name: 'Marcus & Diana Torres',   email: 'torres.family@outlook.com',   phone: '+1 (555) 345-6789', shoot_type: 'Wedding',    event_date: '2026-09-06', value_cents: 420000, status: 'quoted',     source: 'Google',    notes: 'All-day coverage', created_at: '2026-03-20T14:00:00Z' },
  { id: 'l4',  name: 'Priya Sharma',            email: 'priya.sharma@gmail.com',      phone: null,                shoot_type: 'Headshots',  event_date: '2026-04-10', value_cents: 45000,  status: 'quoted',     source: 'Direct',    notes: null, created_at: '2026-03-22T11:00:00Z' },
  { id: 'l5',  name: 'David & Rachel Kim',      email: 'd.kim@gmail.com',             phone: '+1 (555) 456-7890', shoot_type: 'Wedding',    event_date: '2026-07-19', value_cents: 350000, status: 'booked',     source: 'Referral',  notes: 'Deposit received', created_at: '2026-03-10T16:00:00Z' },
  { id: 'l6',  name: 'Olivia Bennett',          email: 'olivia.b@yahoo.com',          phone: '+1 (555) 567-8901', shoot_type: 'Newborn',    event_date: '2026-04-28', value_cents: 55000,  status: 'booked',     source: 'Instagram', notes: null, created_at: '2026-03-15T10:00:00Z' },
  { id: 'l7',  name: 'Noah & Isabella Foster',  email: 'foster.wedding@gmail.com',    phone: '+1 (555) 678-9012', shoot_type: 'Wedding',    event_date: '2026-05-31', value_cents: 480000, status: 'contracted', source: 'Referral',  notes: 'Contract signed 3/20', created_at: '2026-02-28T09:00:00Z' },
  { id: 'l8',  name: 'Aiden Johnson',           email: 'a.johnson@company.com',       phone: '+1 (555) 789-0123', shoot_type: 'Commercial', event_date: '2026-04-15', value_cents: 120000, status: 'contracted', source: 'Direct',    notes: null, created_at: '2026-03-05T14:00:00Z' },
  { id: 'l9',  name: 'Mia & Ethan Rodriguez',  email: 'mia.rodriguez@gmail.com',     phone: '+1 (555) 890-1234', shoot_type: 'Wedding',    event_date: '2026-04-26', value_cents: 395000, status: 'prepped',    source: 'Google',    notes: 'Shot list finalized', created_at: '2026-02-14T11:00:00Z' },
  { id: 'l10', name: 'Liam Nguyen',             email: 'liam.nguyen@gmail.com',       phone: '+1 (555) 901-2345', shoot_type: 'Event',      event_date: '2026-04-18', value_cents: 85000,  status: 'prepped',    source: 'Instagram', notes: null, created_at: '2026-03-01T16:00:00Z' },
  { id: 'l11', name: 'Sophia & William Clark',  email: 'clark.wedding@gmail.com',     phone: '+1 (555) 012-3456', shoot_type: 'Wedding',    event_date: '2026-04-05', value_cents: 520000, status: 'shooting',   source: 'Referral',  notes: 'Shooting today!', created_at: '2026-01-15T09:00:00Z' },
  { id: 'l12', name: 'Harper Lee',              email: 'harper.lee@studio.com',       phone: '+1 (555) 123-4567', shoot_type: 'Fashion',    event_date: '2026-04-03', value_cents: 200000, status: 'shooting',   source: 'Direct',    notes: 'Studio shoot', created_at: '2026-02-20T14:00:00Z' },
]

const DEMO_CLIENTS: ClientProfile[] = [
  {
    id: 'c1', name: 'Sarah Mitchell', email: 'sarah.mitchell@gmail.com', phone: '+1 (555) 234-5678',
    total_projects: 3, total_spend_cents: 245000, last_contact: '2026-03-30T10:00:00Z', status: 'gallery_live',
    projects: [
      { name: 'Wedding June 2025', status: 'delivered', date: '2025-06-14' },
      { name: 'Engagement Session', status: 'delivered', date: '2025-03-20' },
      { name: 'Anniversary Portraits', status: 'gallery_live', date: '2026-03-01' },
    ],
    payments: [
      { amount_cents: 120000, date: '2025-06-20', project: 'Wedding June 2025' },
      { amount_cents: 65000,  date: '2025-03-25', project: 'Engagement Session' },
      { amount_cents: 60000,  date: '2026-03-05', project: 'Anniversary Portraits' },
    ],
    notes: 'Referred 2 clients. Prefers morning shoots. Always tips.',
  },
  {
    id: 'c2', name: 'James & Rachel Torres', email: 'torres.family@outlook.com', phone: '+1 (555) 345-6789',
    total_projects: 2, total_spend_cents: 180000, last_contact: '2026-03-25T14:00:00Z', status: 'review',
    projects: [
      { name: 'Wedding September 2025', status: 'review', date: '2025-09-06' },
      { name: 'Rehearsal Dinner', status: 'delivered', date: '2025-09-05' },
    ],
    payments: [
      { amount_cents: 150000, date: '2025-09-10', project: 'Wedding September 2025' },
      { amount_cents: 30000,  date: '2025-09-07', project: 'Rehearsal Dinner' },
    ],
    notes: 'Large extended family. Provide detailed shot list in advance.',
  },
  {
    id: 'c3', name: 'Emily Chen', email: 'emily.chen@icloud.com', phone: null,
    total_projects: 1, total_spend_cents: 65000, last_contact: '2026-03-22T09:00:00Z', status: 'delivered',
    projects: [{ name: 'Family Holiday Session', status: 'delivered', date: '2025-12-15' }],
    payments: [{ amount_cents: 65000, date: '2025-12-20', project: 'Family Holiday Session' }],
    notes: 'Wants to book annual family sessions going forward.',
  },
  {
    id: 'c4', name: 'Michael Brooks', email: 'm.brooks@brooksphotography.com', phone: '+1 (555) 789-0123',
    total_projects: 2, total_spend_cents: 95000, last_contact: '2026-03-18T16:00:00Z', status: 'gallery_live',
    projects: [
      { name: 'Executive Headshots', status: 'gallery_live', date: '2026-03-10' },
      { name: 'Product Shoot Q4', status: 'delivered', date: '2025-11-20' },
    ],
    payments: [
      { amount_cents: 45000, date: '2026-03-12', project: 'Executive Headshots' },
      { amount_cents: 50000, date: '2025-11-25', project: 'Product Shoot Q4' },
    ],
    notes: 'Corporate client. Invoices net-30.',
  },
  {
    id: 'c5', name: 'Amanda & David Foster', email: 'amanda.foster@gmail.com', phone: '+1 (555) 567-8901',
    total_projects: 1, total_spend_cents: 0, last_contact: '2026-03-12T11:00:00Z', status: 'review',
    projects: [{ name: 'Engagement Session', status: 'review', date: '2026-03-05' }],
    payments: [],
    notes: 'Still reviewing gallery. Follow up next week.',
  },
  {
    id: 'c6', name: 'Lisa Patel', email: 'lisa.patel@yahoo.com', phone: '+1 (555) 901-2345',
    total_projects: 1, total_spend_cents: 35000, last_contact: '2026-03-08T14:00:00Z', status: 'delivered',
    projects: [{ name: 'Newborn Session', status: 'delivered', date: '2026-02-28' }],
    payments: [{ amount_cents: 35000, date: '2026-03-01', project: 'Newborn Session' }],
    notes: 'Expecting again in October. Interested in 6-month milestone session.',
  },
]

const DEMO_RULES: WorkflowRule[] = [
  { id: 'wr1', name: 'Welcome Email on Booking', is_active: true,  trigger_event: 'status_booked',      trigger_label: 'Status → Booked',      actions: [{ type: 'send_email',   label: 'Send welcome email' }] },
  { id: 'wr2', name: 'Contract After Quote',     is_active: true,  trigger_event: 'status_contracted',   trigger_label: 'Status → Contracted',  actions: [{ type: 'create_task',  label: 'Create "Send contract" task' }] },
  { id: 'wr3', name: 'Prep Guide 1 Week Out',    is_active: false, trigger_event: 'status_prepped',      trigger_label: 'Status → Prepped',     actions: [{ type: 'send_email',   label: 'Send prep guide email' }, { type: 'send_telegram', label: 'Notify via Telegram' }] },
  { id: 'wr4', name: 'Gallery Follow-up',        is_active: true,  trigger_event: 'gallery_delivered',   trigger_label: 'Gallery Delivered',    actions: [{ type: 'send_email',   label: 'Send review request (7d delay)' }] },
]

// ─── Add Lead Modal ───────────────────────────────────────────────────────────

function AddLeadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (lead: Lead) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', shoot_type: 'Wedding', event_date: '', value: '', source: 'Instagram' })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) return
    onAdd({
      id: `l${Date.now()}`, name: form.name, email: form.email, phone: form.phone || null,
      shoot_type: form.shoot_type || null, event_date: form.event_date || null,
      value_cents: Math.round(parseFloat(form.value || '0') * 100),
      status: 'inquiry', source: form.source || null, notes: null, created_at: new Date().toISOString(),
    })
    onClose()
  }

  const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30'
  const selectCls = 'w-full bg-[#1E2038] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30'
  const labelCls = 'block text-[11px] font-medium text-white/50 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E2038] rounded-2xl border border-white/[0.10] p-6 shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">Add New Lead</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Sarah & James Mitchell" required />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="client@email.com" required />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className={labelCls}>Shoot Type</label>
              <select value={form.shoot_type} onChange={e => setForm(f => ({ ...f, shoot_type: e.target.value }))} className={selectCls}>
                {['Wedding','Portrait','Engagement','Newborn','Commercial','Event','Headshots','Fashion','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Event Date</label>
              <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Value ($)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className={`${inputCls} font-mono`} placeholder="3500" />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className={selectCls}>
                {['Instagram','Referral','Google','Direct','Website','TikTok','Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.12] text-sm text-white/50 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#818cf8] text-sm font-semibold text-white hover:bg-[#6366f1] transition-colors">Add Lead</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Lead Card (draggable) ────────────────────────────────────────────────────

function LeadCard({ lead, accentColor }: { lead: Lead; accentColor: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })
  const grad = avatarGradient(lead.name)
  const ini = initials(lead.name)

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, zIndex: 999, opacity: isDragging ? 0.45 : 1 } : undefined}
      {...listeners}
      {...attributes}
      className="bg-white/[0.07] hover:bg-white/[0.10] border border-white/[0.09] rounded-xl p-3 cursor-grab active:cursor-grabbing transition-colors select-none"
    >
      <div className="flex items-start gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
          {ini}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-white/90 truncate leading-tight">{lead.name}</p>
          {lead.shoot_type && <p className="text-[10px] text-white/40 truncate mt-0.5">{lead.shoot_type}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        {lead.event_date ? (
          <span className="flex items-center gap-1 text-[10px] text-white/40">
            <Calendar size={9} />
            {new Date(lead.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ) : <span />}
        {lead.value_cents > 0 && (
          <span className="text-[10px] font-mono font-bold" style={{ color: accentColor }}>
            {fmtMoney(lead.value_cents)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Kanban Column (droppable) ────────────────────────────────────────────────

function KanbanColumn({
  col, leads, onAddLead,
}: {
  col: typeof PIPELINE_COLUMNS[number]
  leads: Lead[]
  onAddLead?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.status })
  const total = leads.reduce((s, l) => s + l.value_cents, 0)

  return (
    <div className="flex flex-col w-[210px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
          <span className="text-[11px] font-semibold text-white/75">{col.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/40 font-medium tabular-nums">{leads.length}</span>
        </div>
        {total > 0 && (
          <span className="text-[10px] font-mono text-white/30 tabular-nums">{fmtMoney(total)}</span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 flex-1 min-h-[120px] rounded-xl p-2 transition-colors"
        style={{ backgroundColor: isOver ? col.bgColor : 'rgba(255,255,255,0.02)' }}
      >
        {leads.map(l => <LeadCard key={l.id} lead={l} accentColor={col.color} />)}
        {onAddLead && (
          <button
            onClick={onAddLead}
            className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl border border-dashed border-white/[0.12] text-[10px] font-medium text-white/25 hover:text-white/50 hover:border-white/25 transition-colors mt-1"
          >
            <Plus size={10} />
            Add Lead
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Client Profile Drawer ────────────────────────────────────────────────────

function ClientDrawer({ client, onClose }: { client: ClientProfile; onClose: () => void }) {
  const grad = avatarGradient(client.name)
  const ini = initials(client.name)
  const [section, setSection] = useState<'projects' | 'payments' | 'notes'>('projects')

  const statusColor: Record<string, string> = {
    delivered: 'text-[#34d399]', gallery_live: 'text-[#60a5fa]',
    review: 'text-[#fbbf24]', processing: 'text-[#818cf8]',
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[390px] bg-[#14122A] border-l border-white/[0.08] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Client Profile</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>

        {/* Profile */}
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>{ini}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{client.name}</h3>
              <p className="text-xs text-white/40 truncate mt-0.5">{client.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] hover:bg-white/[0.09] transition-colors">
                <Phone size={11} className="text-white/30 flex-shrink-0" /><span className="text-[11px] text-white/60 truncate">{client.phone}</span>
              </a>
            )}
            <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] hover:bg-white/[0.09] transition-colors">
              <Mail size={11} className="text-white/30" /><span className="text-[11px] text-white/60">Email</span>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.07] border-b border-white/[0.07]">
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-white font-mono tabular-nums">{client.total_projects}</p>
            <p className="text-[10px] text-white/35 mt-0.5">Projects</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-base font-bold text-[#34d399] font-mono tabular-nums">{fmtMoney(client.total_spend_cents)}</p>
            <p className="text-[10px] text-white/35 mt-0.5">Total Paid</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-bold text-white/80">
              {client.last_contact ? new Date(client.last_contact).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
            </p>
            <p className="text-[10px] text-white/35 mt-0.5">Last Contact</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.07]">
          {(['projects','payments','notes'] as const).map(s => (
            <button key={s} onClick={() => setSection(s)}
              className={`flex-1 py-3 text-[11px] font-medium capitalize transition-colors ${section === s ? 'text-white border-b-2 border-[#818cf8]' : 'text-white/35 hover:text-white/60'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {section === 'projects' && client.projects.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <div className="p-2 rounded-lg bg-white/[0.05]"><FolderOpen size={12} className="text-white/35" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/85 truncate">{p.name}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{fmtDate(p.date)}</p>
              </div>
              <span className={`text-[10px] font-medium capitalize ${statusColor[p.status] ?? 'text-white/35'}`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>
          ))}
          {section === 'payments' && (
            client.payments.length === 0
              ? <p className="text-xs text-white/25 text-center py-10">No payments yet</p>
              : client.payments.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <div className="p-2 rounded-lg bg-[#34d399]/[0.10]"><DollarSign size={12} className="text-[#34d399]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-white/70 truncate">{p.project}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{fmtDate(p.date)}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#34d399]">{fmtMoney(p.amount_cents)}</span>
                </div>
              ))
          )}
          {section === 'notes' && (
            <p className="text-xs text-white/55 leading-relaxed p-1">{client.notes || 'No notes yet.'}</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.07] flex gap-2">
          {[
            { icon: <MessageSquare size={12} />, label: 'Message' },
            { icon: <FolderOpen size={12} />, label: 'Projects' },
            { icon: <FileText size={12} />, label: 'Invoice' },
          ].map(a => (
            <button key={a.label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[11px] font-medium text-white/55 hover:bg-white/[0.09] hover:text-white/80 transition-colors">
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Client Card ──────────────────────────────────────────────────────────────

function ClientCard({ client, onClick }: { client: ClientProfile; onClick: () => void }) {
  const grad = avatarGradient(client.name)
  const ini = initials(client.name)
  return (
    <div onClick={onClick} className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] rounded-2xl p-4 cursor-pointer transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>{ini}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90 truncate">{client.name}</p>
          <p className="text-xs text-white/35 truncate mt-0.5">{client.email}</p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.08] text-white/35 hover:text-white transition-all" onClick={e => e.stopPropagation()}>
          <MoreHorizontal size={13} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/[0.05] rounded-lg py-2 px-2 text-center">
          <p className="text-xs font-bold text-white font-mono tabular-nums">{client.total_projects}</p>
          <p className="text-[9px] text-white/35 mt-0.5">Projects</p>
        </div>
        <div className="bg-white/[0.05] rounded-lg py-2 px-2 text-center">
          <p className="text-xs font-bold text-[#34d399] font-mono tabular-nums">{fmtMoney(client.total_spend_cents)}</p>
          <p className="text-[9px] text-white/35 mt-0.5">Spent</p>
        </div>
        <div className="bg-white/[0.05] rounded-lg py-2 px-2 text-center">
          <p className="text-xs font-bold text-white/65">
            {client.last_contact ? new Date(client.last_contact).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          </p>
          <p className="text-[9px] text-white/35 mt-0.5">Last contact</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-[10px] text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-colors" onClick={e => { e.stopPropagation() }}>
          <MessageSquare size={10} />Message
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-[10px] text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-colors" onClick={e => { e.stopPropagation() }}>
          <FolderOpen size={10} />Projects
        </button>
        <button className="ml-auto flex items-center gap-0.5 text-[10px] text-white/25 hover:text-white/50 transition-colors" onClick={e => { e.stopPropagation(); onClick() }}>
          View<ChevronRight size={10} />
        </button>
      </div>
    </div>
  )
}

// ─── Add Rule Modal ───────────────────────────────────────────────────────────

const TRIGGER_OPTS = [
  { value: 'status_inquiry',    label: 'Status → Inquiry' },
  { value: 'status_booked',     label: 'Status → Booked' },
  { value: 'status_contracted', label: 'Status → Contracted' },
  { value: 'status_prepped',    label: 'Status → Prepped' },
  { value: 'payment_received',  label: 'Payment Received' },
  { value: 'gallery_delivered', label: 'Gallery Delivered' },
  { value: 'gallery_viewed',    label: 'Gallery Viewed' },
]
const ACTION_OPTS = [
  { value: 'send_email',    label: 'Send Email' },
  { value: 'create_task',   label: 'Create Task' },
  { value: 'send_telegram', label: 'Send Telegram Notification' },
]

function AddRuleModal({ onClose, onAdd }: { onClose: () => void; onAdd: (r: WorkflowRule) => void }) {
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState(TRIGGER_OPTS[0]!.value)
  const [action, setAction] = useState(ACTION_OPTS[0]!.value)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    onAdd({
      id: `wr${Date.now()}`, name, is_active: true,
      trigger_event: trigger, trigger_label: TRIGGER_OPTS.find(t => t.value === trigger)!.label,
      actions: [{ type: action, label: ACTION_OPTS.find(a => a.value === action)!.label }],
    })
    onClose()
  }

  const selectCls = 'w-full bg-[#1E2038] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1E2038] rounded-2xl border border-white/[0.10] p-6 shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">New Automation Rule</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white transition-colors"><X size={14} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5">Rule Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              placeholder="e.g. Send welcome email on booking" required />
          </div>
          <div className="p-3 bg-white/[0.04] rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">When</span>
            </div>
            <select value={trigger} onChange={e => setTrigger(e.target.value)} className={selectCls}>
              {TRIGGER_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="p-3 bg-white/[0.04] rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Then</span>
            </div>
            <select value={action} onChange={e => setAction(e.target.value)} className={selectCls}>
              {ACTION_OPTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.12] text-sm text-white/40 hover:bg-white/[0.05] transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#818cf8] text-sm font-semibold text-white hover:bg-[#6366f1] transition-colors">Create Rule</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Workflow Panel ───────────────────────────────────────────────────────────

const ACTION_ICONS: Record<string, React.ReactNode> = {
  send_email:    <Mail size={10} />,
  create_task:   <Check size={10} />,
  send_telegram: <Send size={10} />,
}

function WorkflowPanel({ rules, onAdd, onToggle }: {
  rules: WorkflowRule[]
  onAdd: (r: WorkflowRule) => void
  onToggle: (id: string) => void
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-[#fbbf24]" />
          <h3 className="text-xs font-semibold text-white/85">Automations</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#fbbf24]/[0.14] text-[#fbbf24] font-medium tabular-nums">
            {rules.filter(r => r.is_active).length} on
          </span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#818cf8]/[0.14] text-[#818cf8] text-[10px] font-medium hover:bg-[#818cf8]/[0.22] transition-colors">
          <Plus size={10} />Add
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <p className="text-[11px] font-medium text-white/80 leading-snug flex-1">{rule.name}</p>
              {/* Toggle */}
              <button
                onClick={() => onToggle(rule.id)}
                className={`relative flex-shrink-0 w-8 h-[18px] rounded-full transition-colors mt-0.5 ${rule.is_active ? 'bg-[#34d399]/50' : 'bg-white/[0.12]'}`}
              >
                <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${rule.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-white/25 w-7 font-medium">WHEN</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#818cf8]/[0.12] text-[#a5b4fc] font-medium truncate">{rule.trigger_label}</span>
              </div>
              {rule.actions.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-white/25 w-7 font-medium">THEN</span>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#34d399]/[0.10] text-[#6ee7b7] font-medium truncate">
                    {ACTION_ICONS[a.type]}{a.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddRuleModal onClose={() => setShowModal(false)} onAdd={r => { onAdd(r); setShowModal(false) }} />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientsCRMPage() {
  const [tab, setTab] = useState<ActiveTab>('pipeline')
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS)
  const [clients] = useState<ClientProfile[]>(DEMO_CLIENTS)
  const [rules, setRules] = useState<WorkflowRule[]>(DEMO_RULES)
  const [showWorkflow, setShowWorkflow] = useState(true)
  const [showAddLead, setShowAddLead] = useState(false)
  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const newStatus = over.id as PipelineStatus
    if (!PIPELINE_COLUMNS.find(c => c.status === newStatus)) return
    setLeads(prev => prev.map(l => l.id === active.id ? { ...l, status: newStatus } : l))
    // TODO: supabase.from('leads').update({ status: newStatus }).eq('id', active.id)
  }

  const filteredClients = clients.filter(c =>
    (statusFilter === 'all' || c.status === statusFilter) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
  )

  const pipelineValue = leads.reduce((s, l) => s + l.value_cents, 0)
  const clientRevenue = clients.reduce((s, c) => s + c.total_spend_cents, 0)

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col overflow-hidden" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.07] flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Clients & CRM</h1>
          <p className="text-xs text-white/35 mt-0.5">Pipeline, profiles & automation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWorkflow(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${showWorkflow ? 'bg-[#fbbf24]/[0.12] border-[#fbbf24]/25 text-[#fbbf24]' : 'border-white/[0.12] text-white/40 hover:bg-white/[0.05]'}`}
          >
            <Zap size={12} />Automations
          </button>
          <button
            onClick={() => setShowAddLead(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#818cf8] text-xs font-semibold text-white hover:bg-[#6366f1] transition-colors"
          >
            <UserPlus size={12} />Add Lead
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-5 px-6 py-2.5 border-b border-white/[0.06] bg-white/[0.015] flex-shrink-0 overflow-x-auto">
        {[
          { label: 'Pipeline Value', value: fmtMoney(pipelineValue), color: 'text-[#818cf8]' },
          { label: 'Active Leads', value: String(leads.length), color: 'text-white' },
          { label: 'Clients', value: String(clients.length), color: 'text-white' },
          { label: 'Total Revenue', value: fmtMoney(clientRevenue), color: 'text-[#34d399]' },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center gap-3 flex-shrink-0">
            {i > 0 && <div className="w-px h-3 bg-white/[0.10]" />}
            <span className="text-[10px] text-white/35 uppercase tracking-wide">{s.label}</span>
            <span className={`text-xs font-bold font-mono tabular-nums ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-3.5 pb-2 flex-shrink-0">
        {(['pipeline', 'clients'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${tab === t ? 'bg-white/[0.10] text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'}`}>
            {t === 'pipeline' ? 'Pipeline' : 'Clients'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main */}
        <div className="flex-1 overflow-hidden min-w-0">
          {tab === 'pipeline' ? (
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
              <div className="flex gap-4 p-5 overflow-x-auto h-full items-start">
                {PIPELINE_COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.status}
                    col={col}
                    leads={leads.filter(l => l.status === col.status)}
                    onAddLead={col.status === 'inquiry' ? () => setShowAddLead(true) : undefined}
                  />
                ))}
              </div>
            </DndContext>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07] flex-shrink-0">
                <div className="relative flex-1 max-w-xs">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.11] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                    placeholder="Search clients…" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white/[0.06] border border-white/[0.11] rounded-xl px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-white/25">
                  <option value="all">All Status</option>
                  <option value="gallery_live">Gallery Live</option>
                  <option value="delivered">Delivered</option>
                  <option value="review">In Review</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <Users size={36} className="text-white/[0.12]" />
                    <p className="text-sm text-white/30">No clients found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredClients.map(c => <ClientCard key={c.id} client={c} onClick={() => setActiveClient(c)} />)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workflow sidebar */}
        {showWorkflow && (
          <div className="w-[268px] flex-shrink-0 border-l border-white/[0.07] p-4 bg-white/[0.01] overflow-hidden flex flex-col">
            <WorkflowPanel
              rules={rules}
              onAdd={r => setRules(prev => [...prev, r])}
              onToggle={id => setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r))}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddLead && (
        <AddLeadModal onClose={() => setShowAddLead(false)} onAdd={lead => { setLeads(prev => [...prev, lead]); setShowAddLead(false) }} />
      )}
      {activeClient && <ClientDrawer client={activeClient} onClose={() => setActiveClient(null)} />}
    </div>
  )
}
