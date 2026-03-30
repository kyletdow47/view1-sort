'use client'

import { useState } from 'react'
import {
  ClipboardList,
  Plus,
  Link2,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  X,
  ChevronDown,
  Check,
  Type,
  AlignLeft,
  CalendarDays,
  ListChecks,
  CheckSquare,
  Phone,
  Upload,
  Pencil,
  Trash2,
  Copy,
  MessageSquare,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type ShootType = 'Wedding' | 'Portrait' | 'Event' | 'Commercial' | 'Real Estate' | 'Boudoir'
type FieldType = 'short-text' | 'long-text' | 'date' | 'dropdown' | 'checkbox' | 'phone' | 'file-upload'

interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  helperText: string
  options?: string[]
}

interface BookingForm {
  id: string
  name: string
  shootType: ShootType
  enabled: boolean
  submissionsThisMonth: number
  fields: FormField[]
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const defaultWeddingFields: FormField[] = [
  { id: 'f-w1', type: 'short-text',  label: 'Your Names',           required: true,  helperText: 'First and last name of both partners' },
  { id: 'f-w2', type: 'date',        label: 'Wedding Date',         required: true,  helperText: 'Or expected date range if not confirmed' },
  { id: 'f-w3', type: 'short-text',  label: 'Venue Name & Location',required: true,  helperText: 'Include city and state' },
  { id: 'f-w4', type: 'dropdown',    label: 'Guest Count',          required: false, helperText: 'Approximate number of guests', options: ['Under 50', '50–100', '100–200', '200+'] },
  { id: 'f-w5', type: 'long-text',   label: 'Tell me about your day',required: false, helperText: 'Style, vision, anything important to you' },
  { id: 'f-w6', type: 'phone',       label: 'Best Phone Number',    required: true,  helperText: '' },
]

const defaultPortraitFields: FormField[] = [
  { id: 'f-p1', type: 'short-text',  label: 'Your Name',          required: true,  helperText: '' },
  { id: 'f-p2', type: 'date',        label: 'Preferred Date',     required: true,  helperText: 'We will confirm availability' },
  { id: 'f-p3', type: 'dropdown',    label: 'Session Type',       required: true,  helperText: '', options: ['Individual', 'Couple', 'Family', 'Maternity', 'Newborn'] },
  { id: 'f-p4', type: 'long-text',   label: 'Vision & Vibe',      required: false, helperText: 'Mood, outfit ideas, must-have shots' },
  { id: 'f-p5', type: 'phone',       label: 'Phone Number',       required: true,  helperText: '' },
]

const defaultEventFields: FormField[] = [
  { id: 'f-e1', type: 'short-text',  label: 'Event Name',         required: true,  helperText: '' },
  { id: 'f-e2', type: 'date',        label: 'Event Date',         required: true,  helperText: '' },
  { id: 'f-e3', type: 'short-text',  label: 'Venue',              required: true,  helperText: '' },
  { id: 'f-e4', type: 'dropdown',    label: 'Hours Needed',       required: true,  helperText: '', options: ['2 hours', '4 hours', '6 hours', 'Full day'] },
  { id: 'f-e5', type: 'checkbox',    label: 'Deliverables needed',required: false, helperText: 'Select all that apply' },
  { id: 'f-e6', type: 'file-upload', label: 'Event Brief / Brief', required: false, helperText: 'Upload any reference or brief documents' },
]

const INITIAL_FORMS: BookingForm[] = [
  { id: 'form-1', name: 'Wedding Inquiry',       shootType: 'Wedding',    enabled: true,  submissionsThisMonth: 12, fields: defaultWeddingFields },
  { id: 'form-2', name: 'Portrait Session',      shootType: 'Portrait',   enabled: true,  submissionsThisMonth: 7,  fields: defaultPortraitFields },
  { id: 'form-3', name: 'Event Coverage',        shootType: 'Event',      enabled: false, submissionsThisMonth: 2,  fields: defaultEventFields },
  { id: 'form-4', name: 'Commercial / Brand',    shootType: 'Commercial', enabled: true,  submissionsThisMonth: 4,  fields: [] },
]

/* ------------------------------------------------------------------ */
/*  Config maps                                                         */
/* ------------------------------------------------------------------ */

const SHOOT_TYPE_STYLES: Record<ShootType, string> = {
  Wedding:      'bg-primary/10 text-primary border-primary/20',
  Portrait:     'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Event:        'bg-violet-400/10 text-violet-400 border-violet-400/20',
  Commercial:   'bg-sky-400/10 text-sky-400 border-sky-400/20',
  'Real Estate':'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Boudoir:      'bg-rose-400/10 text-rose-400 border-rose-400/20',
}

const FIELD_TYPE_CONFIG: Record<FieldType, { label: string; icon: React.ElementType }> = {
  'short-text':  { label: 'Short Text',   icon: Type },
  'long-text':   { label: 'Long Text',    icon: AlignLeft },
  'date':        { label: 'Date Picker',  icon: CalendarDays },
  'dropdown':    { label: 'Dropdown',     icon: ListChecks },
  'checkbox':    { label: 'Checkbox',     icon: CheckSquare },
  'phone':       { label: 'Phone',        icon: Phone },
  'file-upload': { label: 'File Upload',  icon: Upload },
}

const SHOOT_TYPES: ShootType[] = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Real Estate', 'Boudoir']
const FIELD_TYPES = Object.keys(FIELD_TYPE_CONFIG) as FieldType[]

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
/*  Field row                                                           */
/* ------------------------------------------------------------------ */

interface FieldRowProps {
  field: FormField
  onChange: (updated: FormField) => void
  onDelete: () => void
}

function FieldRow({ field, onChange, onDelete }: FieldRowProps) {
  const [expanded, setExpanded] = useState(false)
  const cfg = FIELD_TYPE_CONFIG[field.type]
  const Icon = cfg.icon

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical size={14} className="text-on-surface-variant/30 cursor-grab shrink-0" />
        <Icon size={14} className="text-primary shrink-0" />
        <span className="text-sm font-medium text-on-surface flex-1 truncate">{field.label}</span>
        <span className="text-[10px] text-on-surface-variant/50 font-mono shrink-0">{cfg.label}</span>
        {field.required && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">Required</span>
        )}
        <button onClick={() => setExpanded(!expanded)} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={onDelete} className="rounded-lg p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors">
          <X size={13} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-outline-variant/20 px-4 py-4 space-y-3 bg-surface-container-low">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <SectionLabel>Field Label</SectionLabel>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onChange({ ...field, label: e.target.value })}
                className="w-full rounded-lg bg-background px-3 py-2 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <SectionLabel>Field Type</SectionLabel>
              <div className="relative">
                <select
                  value={field.type}
                  onChange={(e) => onChange({ ...field, type: e.target.value as FieldType })}
                  className="w-full appearance-none rounded-lg bg-background px-3 py-2 pr-8 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{FIELD_TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <SectionLabel>Helper Text</SectionLabel>
              <input
                type="text"
                value={field.helperText}
                onChange={(e) => onChange({ ...field, helperText: e.target.value })}
                placeholder="Hint shown below the field"
                className="w-full rounded-lg bg-background px-3 py-2 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onChange({ ...field, required: !field.required })}
              className={`relative h-5 w-9 rounded-full transition-colors ${field.required ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${field.required ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
            <span className="text-xs text-on-surface-variant">Required field</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Form detail panel                                                   */
/* ------------------------------------------------------------------ */

function FormDetailPanel({ form, onUpdate, onClose }: { form: BookingForm; onUpdate: (f: BookingForm) => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [addingType, setAddingType] = useState<FieldType | null>(null)

  const publicUrl = `view1.studio/book/${form.id}`

  function handleCopy() {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function updateField(id: string, updated: FormField) {
    onUpdate({ ...form, fields: form.fields.map((f) => (f.id === id ? updated : f)) })
  }

  function deleteField(id: string) {
    onUpdate({ ...form, fields: form.fields.filter((f) => f.id !== id) })
  }

  function addField(type: FieldType) {
    const cfg = FIELD_TYPE_CONFIG[type]
    const newField: FormField = {
      id: `f-${Date.now()}`,
      type,
      label: cfg.label,
      required: false,
      helperText: '',
    }
    onUpdate({ ...form, fields: [...form.fields, newField] })
    setAddingType(null)
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
        <div>
          <h3 className="font-headline font-extrabold text-on-surface">{form.name}</h3>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest mt-1 ${SHOOT_TYPE_STYLES[form.shootType]}`}>
            {form.shootType}
          </span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Share link */}
      <div className="px-5 py-3 border-b border-outline-variant/20 bg-surface-container">
        <div className="flex items-center gap-2">
          <Link2 size={13} className="text-on-surface-variant/50 shrink-0" />
          <span className="text-xs font-mono text-on-surface-variant flex-1 truncate">{publicUrl}</span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${copied ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'border border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary'}`}
          >
            {copied ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy Link</>}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>Form Fields ({form.fields.length})</SectionLabel>
        </div>

        {form.fields.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/30 py-10">
            <ClipboardList size={28} className="text-on-surface-variant/20 mb-2" />
            <p className="text-xs text-on-surface-variant/50">No fields yet — add some below</p>
          </div>
        )}

        {form.fields.map((field) => (
          <FieldRow key={field.id} field={field} onChange={(updated) => updateField(field.id, updated)} onDelete={() => deleteField(field.id)} />
        ))}

        {/* Add field */}
        {addingType === null ? (
          <button
            onClick={() => setAddingType('short-text')}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/30 py-2.5 text-sm text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Plus size={14} />
            Add Field
          </button>
        ) : (
          <div className="rounded-xl border border-primary/30 bg-surface-container p-4 space-y-3">
            <p className="text-xs font-medium text-on-surface-variant">Choose field type</p>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((type) => {
                const cfg = FIELD_TYPE_CONFIG[type]
                const Icon = cfg.icon
                return (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-3 py-2 text-xs font-medium text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Icon size={12} className="shrink-0" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setAddingType(null)} className="text-xs text-on-surface-variant/50 hover:text-on-surface-variant transition-colors">Cancel</button>
          </div>
        )}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  New form modal (inline)                                             */
/* ------------------------------------------------------------------ */

function NewFormPanel({ onSave, onCancel }: { onSave: (form: BookingForm) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [shootType, setShootType] = useState<ShootType>('Wedding')

  function handleCreate() {
    if (!name.trim()) return
    const defaultFields: Record<ShootType, FormField[]> = {
      Wedding:      defaultWeddingFields,
      Portrait:     defaultPortraitFields,
      Event:        defaultEventFields,
      Commercial:   [],
      'Real Estate':[],
      Boudoir:      [],
    }
    onSave({
      id: `form-${Date.now()}`,
      name: name.trim(),
      shootType,
      enabled: false,
      submissionsThisMonth: 0,
      fields: defaultFields[shootType],
    })
  }

  return (
    <Card className="border-primary/30 !bg-surface-container p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-headline font-extrabold text-lg text-on-surface">New Booking Form</h3>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <SectionLabel>Form Name</SectionLabel>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Inquiry 2026" className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50" />
        </div>
        <div className="space-y-1.5">
          <SectionLabel>Shoot Type</SectionLabel>
          <div className="relative">
            <select value={shootType} onChange={(e) => setShootType(e.target.value as ShootType)} className="w-full appearance-none rounded-xl bg-background px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50">
              {SHOOT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-on-surface-variant/60">Pre-populated with sensible default fields for the selected shoot type.</p>
      <div className="mt-5 flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-xl border border-outline-variant/30 px-5 py-2 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">Cancel</button>
        <button onClick={handleCreate} disabled={!name.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-40 transition-opacity">
          <Check size={14} />
          Create Form
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function BookingFormsPage() {
  const [forms, setForms] = useState<BookingForm[]>(INITIAL_FORMS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)

  function toggleEnabled(id: string) {
    setForms(forms.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)))
  }

  function handleCreate(form: BookingForm) {
    setForms([...forms, form])
    setSelectedId(form.id)
    setShowNew(false)
  }

  function handleUpdate(form: BookingForm) {
    setForms(forms.map((f) => (f.id === form.id ? form : f)))
  }

  function handleDelete(id: string) {
    setForms(forms.filter((f) => f.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const selectedForm = forms.find((f) => f.id === selectedId) ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ClipboardList size={22} className="text-primary shrink-0" />
            <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">Booking Forms</h1>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Build and manage inquiry forms for each shoot type — share a link, collect leads automatically
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setSelectedId(null) }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={15} />
          New Form
        </button>
      </div>

      {/* New form builder */}
      {showNew && <NewFormPanel onSave={handleCreate} onCancel={() => setShowNew(false)} />}

      {/* Form list + detail */}
      <div className="flex gap-5 min-h-[560px]">
        {/* List */}
        <div className="flex flex-col gap-3 w-full max-w-sm shrink-0">
          {forms.map((form) => {
            const isSelected = selectedId === form.id
            return (
              <button
                key={form.id}
                onClick={() => setSelectedId(isSelected ? null : form.id)}
                className={`text-left rounded-2xl border p-4 transition-all group ${
                  isSelected
                    ? 'border-primary/40 bg-surface-container'
                    : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{form.name}</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest mt-1 ${SHOOT_TYPE_STYLES[form.shootType]}`}>
                      {form.shootType}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleEnabled(form.id) }}
                    className="shrink-0 mt-0.5"
                    title={form.enabled ? 'Disable form' : 'Enable form'}
                  >
                    {form.enabled
                      ? <ToggleRight size={20} className="text-primary" />
                      : <ToggleLeft size={20} className="text-on-surface-variant/40" />}
                  </button>
                </div>

                <div className="mt-2.5 flex items-center gap-3 text-[10px] text-on-surface-variant/50">
                  <span>{form.fields.length} fields</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={9} />
                    {form.submissionsThisMonth} this month
                  </span>
                </div>

                {/* Action row on hover or selected */}
                <div className={`mt-3 flex items-center gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(form.id) }}
                    className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2 py-1 text-[10px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Pencil size={9} />Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(form.id) }}
                    className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2 py-1 text-[10px] font-medium text-on-surface-variant hover:border-error/30 hover:text-error transition-colors"
                  >
                    <Trash2 size={9} />Delete
                  </button>
                </div>
              </button>
            )
          })}

          {forms.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-12">
              <ClipboardList size={32} className="text-on-surface-variant/20 mb-2" />
              <p className="text-xs text-on-surface-variant/50">No forms yet</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          {selectedForm ? (
            <FormDetailPanel
              form={selectedForm}
              onUpdate={handleUpdate}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <Card className="flex flex-col items-center justify-center h-full py-16 p-6">
              <ClipboardList size={40} className="text-on-surface-variant/20 mb-3" />
              <p className="text-sm font-medium text-on-surface">Select a form to edit</p>
              <p className="text-xs text-on-surface-variant mt-1 text-center max-w-48">
                Choose a form from the list to manage its fields and share link
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
