'use client'

import {
  Type,
  Calendar,
  ChevronDown,
  AlignLeft,
  Upload,
  Mail,
  GripVertical,
  Plus,
  Smartphone,
  Link2,
  Rocket,
  Sparkles,
  Mountain,
  Building2,
  Plane,
  Circle,
  ArrowDown,
  Zap,
  Eye,
  Check,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const workflowPresets = [
  { name: 'Wedding Arch', icon: Sparkles, active: true },
  { name: 'Real Estate Pro', icon: Building2, active: false },
  { name: 'Editorial Travel', icon: Plane, active: false },
]

const formElements = [
  { name: 'Short Text', icon: Type },
  { name: 'Date Picker', icon: Calendar },
  { name: 'Dropdown', icon: ChevronDown },
  { name: 'Textarea', icon: AlignLeft },
  { name: 'File Upload', icon: Upload },
  { name: 'Email Opt-in', icon: Mail },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BookingFormsPage() {
  const [activePreset, setActivePreset] = useState('Wedding Arch')
  const [confirmMode, setConfirmMode] = useState<'auto' | 'manual'>('auto')
  const [emailDelay, setEmailDelay] = useState('instant')
  const [confirmMessage, setConfirmMessage] = useState('')

  return (
    <div className="flex flex-col">
      {/* 3-Column Layout — fits one screen */}
      <div className="grid grid-cols-12 gap-3">
        {/* ====== LEFT COLUMN ====== */}
        <div className="col-span-12 lg:col-span-3 space-y-3 pr-1">
          {/* Workflow Presets */}
          <Card>
            <SectionLabel>Workflow Presets</SectionLabel>
            <div className="mt-2 space-y-1.5">
              {workflowPresets.map((preset) => {
                const Icon = preset.icon
                const isActive = activePreset === preset.name
                return (
                  <button
                    key={preset.name}
                    onClick={() => setActivePreset(preset.name)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-br from-[#ffb780]/15 to-[#d48441]/10 text-primary ring-1 ring-primary/30'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-primary' : ''} />
                    {preset.name}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Form Elements */}
          <Card>
            <SectionLabel>Form Elements</SectionLabel>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {formElements.map((el) => {
                const Icon = el.icon
                return (
                  <div
                    key={el.name}
                    draggable
                    className="flex flex-col items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container p-2 cursor-grab text-center transition-colors hover:border-primary/30 hover:bg-surface-container-high active:cursor-grabbing"
                  >
                    <Icon size={15} className="text-on-surface-variant" />
                    <span className="text-[10px] font-medium text-on-surface-variant">
                      {el.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ====== CENTER COLUMN ====== */}
        <div className="col-span-12 lg:col-span-5 space-y-3 px-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-xl italic font-extrabold text-on-surface">
                Booking Flow
              </h1>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {activePreset} workflow
              </p>
            </div>
          </div>

          {/* Step 01 */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                01
              </div>
              <h3 className="font-headline font-bold text-on-surface">
                Initial Inquiry
              </h3>
              <SectionLabel>Required</SectionLabel>
            </div>

            <div className="space-y-2">
              {/* Full Name field */}
              <div className="flex items-center gap-3 rounded-lg bg-surface-container px-4 py-3 ring-1 ring-outline-variant/15">
                <GripVertical
                  size={14}
                  className="text-on-surface-variant/30 cursor-grab"
                />
                <Type size={14} className="text-on-surface-variant/60" />
                <span className="flex-1 text-sm text-on-surface">
                  Full Name
                </span>
                <span className="font-label text-[9px] uppercase tracking-widest text-primary/60">
                  Text
                </span>
              </div>

              {/* Event Date field */}
              <div className="flex items-center gap-3 rounded-lg bg-surface-container px-4 py-3 ring-1 ring-outline-variant/15">
                <GripVertical
                  size={14}
                  className="text-on-surface-variant/30 cursor-grab"
                />
                <Calendar size={14} className="text-on-surface-variant/60" />
                <span className="flex-1 text-sm text-on-surface">
                  Event Date
                </span>
                <span className="font-label text-[9px] uppercase tracking-widest text-primary/60">
                  Date
                </span>
              </div>
            </div>
          </Card>

          {/* Flow Connector */}
          <div className="flex flex-col items-center gap-0 py-0">
            <div className="h-3 w-px bg-outline-variant/30" />
            <ArrowDown size={12} className="text-outline-variant/40" />
            <div className="h-3 w-px bg-outline-variant/30" />
          </div>

          {/* Step 02 */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/20 text-[10px] font-bold text-secondary">
                02
              </div>
              <h3 className="font-headline font-bold text-on-surface">
                Package Selection
              </h3>
              <SectionLabel>Optional</SectionLabel>
            </div>

            {/* Drop zone */}
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 py-10 text-center transition-colors hover:border-primary/30 hover:bg-primary/5">
              <div className="space-y-1">
                <Plus size={24} className="mx-auto text-on-surface-variant/30" />
                <p className="text-xs text-on-surface-variant/50">
                  Drop form elements here
                </p>
              </div>
            </div>
          </Card>

          {/* Add Step */}
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/30 py-4 text-sm font-medium text-on-surface-variant/50 transition-colors hover:border-primary/30 hover:text-primary">
            <Plus size={16} />
            Append New Workflow Step
          </button>
        </div>

        {/* ====== RIGHT COLUMN ====== */}
        <div className="col-span-12 lg:col-span-4 px-1">
          <div className="mb-2">
            <SectionLabel>Live Client Preview</SectionLabel>
          </div>

          {/* Phone mockup — compact */}
          <div className="mx-auto w-[280px]">
            <div className="rounded-[2rem] border-[3px] border-[#373433] bg-[#151312] p-1.5 shadow-2xl">
              {/* Notch */}
              <div className="mx-auto mb-1.5 h-4 w-24 rounded-full bg-[#151312] border border-outline-variant/20" />

              {/* Screen */}
              <div className="rounded-[1.5rem] bg-white overflow-hidden" style={{ height: 440 }}>
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]" />
                      <span className="text-[11px] font-bold text-gray-900">
                        Aperture Studios
                      </span>
                    </div>
                    <h3 className="font-headline text-lg font-extrabold text-gray-900">
                      Johnson Wedding
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Book your photography session
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="flex gap-1">
                    <div className="h-1 flex-1 rounded-full bg-[#d48441]" />
                    <div className="h-1 flex-1 rounded-full bg-gray-200" />
                    <div className="h-1 flex-1 rounded-full bg-gray-200" />
                  </div>

                  {/* Form fields */}
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Full Name *
                      </label>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-[12px] text-gray-400">
                          Enter your full name
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Event Date *
                      </label>
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-[12px] text-gray-400">
                          Select date
                        </span>
                        <Calendar size={12} className="text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-[12px] text-gray-400">
                          your@email.com
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Event Type
                      </label>
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-[12px] text-gray-400">
                          Select type
                        </span>
                        <ChevronDown size={12} className="text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Additional Details
                      </label>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                        <span className="text-[11px] text-gray-400">
                          Tell us about your vision...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-3 text-[12px] font-bold text-[#4e2600]">
                    Continue to Step 2
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== BOOKING CONFIRMATION SECTION ====== */}
      <div className="mt-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
        <SectionLabel>Confirmation Settings</SectionLabel>

        {/* Mode Cards */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Auto-Confirm */}
          <button
            onClick={() => setConfirmMode('auto')}
            className={`relative flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-all ${
              confirmMode === 'auto'
                ? 'bg-gradient-to-br from-[#ffb780]/15 to-[#d48441]/10 ring-1 ring-primary/30'
                : 'bg-surface-container ring-1 ring-outline-variant/15 hover:bg-surface-container-high'
            }`}
          >
            {confirmMode === 'auto' && (
              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                <Check size={12} className="text-primary" />
              </div>
            )}
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              confirmMode === 'auto' ? 'bg-primary/20' : 'bg-surface-container-high'
            }`}>
              <Zap size={18} className={confirmMode === 'auto' ? 'text-primary' : 'text-on-surface-variant/60'} />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${confirmMode === 'auto' ? 'text-primary' : 'text-on-surface'}`}>
                Auto-Confirm
              </h4>
              <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant/50">
                Bookings are automatically confirmed. Client receives instant confirmation email.
              </p>
            </div>
          </button>

          {/* Manual Review */}
          <button
            onClick={() => setConfirmMode('manual')}
            className={`relative flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-all ${
              confirmMode === 'manual'
                ? 'bg-gradient-to-br from-[#ffb780]/15 to-[#d48441]/10 ring-1 ring-primary/30'
                : 'bg-surface-container ring-1 ring-outline-variant/15 hover:bg-surface-container-high'
            }`}
          >
            {confirmMode === 'manual' && (
              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                <Check size={12} className="text-primary" />
              </div>
            )}
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              confirmMode === 'manual' ? 'bg-primary/20' : 'bg-surface-container-high'
            }`}>
              <Eye size={18} className={confirmMode === 'manual' ? 'text-primary' : 'text-on-surface-variant/60'} />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${confirmMode === 'manual' ? 'text-primary' : 'text-on-surface'}`}>
                Manual Review
              </h4>
              <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant/50">
                Photographer reviews each booking before confirming. Client receives &quot;pending&quot; email.
              </p>
            </div>
          </button>
        </div>

        {/* Confirmation Email Delay */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-on-surface-variant/50" />
            <span className="text-xs font-medium text-on-surface-variant">
              Confirmation email delay
            </span>
          </div>
          <div className="relative">
            <select
              value={emailDelay}
              onChange={(e) => setEmailDelay(e.target.value)}
              className="w-full appearance-none rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/40 cursor-pointer"
            >
              <option value="instant">Instant</option>
              <option value="5min">5 minutes</option>
              <option value="1hour">1 hour</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none" />
          </div>
        </div>

        {/* Custom Confirmation Message */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-on-surface-variant/50" />
            <span className="text-xs font-medium text-on-surface-variant">
              Custom confirmation message
            </span>
          </div>
          <textarea
            value={confirmMessage}
            onChange={(e) => setConfirmMessage(e.target.value)}
            placeholder="Thank you for your booking! We look forward to working with you..."
            rows={3}
            className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none transition-colors focus:border-primary/40 resize-none"
          />
        </div>
      </div>

      {/* ====== BOTTOM STATUS BAR ====== */}
      <div className="mt-3 flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Circle size={8} className="fill-green-400 text-green-400" />
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
              Status:{' '}
              <span className="text-green-400">Draft Saved</span>
            </span>
          </div>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
            Conv. Rate:{' '}
            <span className="text-on-surface font-medium">12.4%</span>
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
            Avg Time:{' '}
            <span className="text-on-surface font-medium">2m 45s</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary">
            <Link2 size={14} />
            Preview Link
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-5 py-2 text-xs font-bold text-[#4e2600] transition-opacity hover:opacity-90">
            <Rocket size={14} />
            Publish Changes
          </button>
        </div>
      </div>
    </div>
  )
}
