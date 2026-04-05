'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, User, Mail, Phone, Camera, DollarSign, FileText } from 'lucide-react'
import type { ClientStage, NewClientFormData, ProjectType } from '@/types/clients'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAGES: { value: ClientStage; label: string }[] = [
  { value: 'inquiry',   label: 'Inquiry' },
  { value: 'quoted',    label: 'Quoted' },
  { value: 'booked',    label: 'Booked' },
  { value: 'shooting',  label: 'Shooting' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'paid',      label: 'Paid' },
]

const PROJECT_TYPES: ProjectType[] = [
  'Wedding',
  'Engagement',
  'Portrait',
  'Family',
  'Newborn',
  'Maternity',
  'Commercial',
  'Branding',
  'Corporate',
  'Event',
  'Mini Session',
  'Elopement',
  'Other',
]

/* ------------------------------------------------------------------ */
/*  Field component                                                    */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string
  icon: typeof User
  required?: boolean
  children: React.ReactNode
}

function Field({ label, icon: Icon, required, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/40">
        <Icon className="h-3 w-3" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] text-white/90 placeholder-white/20 outline-none ring-0 transition-all focus:border-[#5749F4]/50 focus:bg-white/8'

const selectClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] text-white/90 outline-none ring-0 transition-all focus:border-[#5749F4]/50 appearance-none cursor-pointer'

/* ------------------------------------------------------------------ */
/*  AddClientModal                                                     */
/* ------------------------------------------------------------------ */

interface AddClientModalProps {
  isOpen: boolean
  defaultStage?: ClientStage
  onClose: () => void
  onAdd: (data: NewClientFormData) => void
}

const INITIAL_FORM: NewClientFormData = {
  displayName: '',
  email: '',
  phone: '',
  shootType: '',
  projectType: 'Wedding',
  stage: 'inquiry',
  price: '',
  notes: '',
}

export function AddClientModal({
  isOpen,
  defaultStage,
  onClose,
  onAdd,
}: AddClientModalProps) {
  const [form, setForm] = useState<NewClientFormData>({
    ...INITIAL_FORM,
    stage: defaultStage ?? 'inquiry',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof NewClientFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens or defaultStage changes
  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, stage: defaultStage ?? 'inquiry' })
      setErrors({})
    }
  }, [isOpen, defaultStage])

  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const set = useCallback(
    <K extends keyof NewClientFormData>(key: K, value: NewClientFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    },
    [],
  )

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewClientFormData, string>> = {}
    if (!form.displayName.trim()) newErrors.displayName = 'Name is required'
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!form.shootType.trim()) newErrors.shootType = 'Shoot type is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await onAdd(form)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Add new client"
      >
        <div
          className="relative w-full max-w-lg rounded-3xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(25,25,35,0.98) 0%, rgba(15,15,25,0.98) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Add New Client</h2>
              <p className="mt-0.5 text-[12px] text-white/40">
                Add a client to your CRM pipeline
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Name */}
              <Field label="Full Name" icon={User} required>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => set('displayName', e.target.value)}
                  placeholder="Sarah Mitchell"
                  className={inputClass}
                  autoFocus
                />
                {errors.displayName && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.displayName}</p>
                )}
              </Field>

              {/* Email */}
              <Field label="Email" icon={Mail} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="sarah@example.com"
                  className={inputClass}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>
                )}
              </Field>

              {/* Phone */}
              <Field label="Phone" icon={Phone}>
                <input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                />
              </Field>

              {/* Two-column: shoot type + project type */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shoot Description" icon={Camera} required>
                  <input
                    type="text"
                    value={form.shootType}
                    onChange={(e) => set('shootType', e.target.value)}
                    placeholder="Wedding · June 13th"
                    className={inputClass}
                  />
                  {errors.shootType && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.shootType}</p>
                  )}
                </Field>

                <Field label="Project Type" icon={Camera}>
                  <select
                    value={form.projectType}
                    onChange={(e) => set('projectType', e.target.value as ProjectType)}
                    className={selectClass}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Two-column: stage + price */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pipeline Stage" icon={User}>
                  <select
                    value={form.stage}
                    onChange={(e) => set('stage', e.target.value as ClientStage)}
                    className={selectClass}
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Estimated Value" icon={DollarSign}>
                  <input
                    type="text"
                    value={form.price ?? ''}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="$2,500"
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Notes */}
              <Field label="Notes" icon={FileText}>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Any notes about this client..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-[13px] font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
