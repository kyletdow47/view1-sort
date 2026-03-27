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
      className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 ${className}`}
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* ====== LEFT COLUMN ====== */}
        <div className="col-span-12 lg:col-span-3 overflow-y-auto space-y-4 pr-1">
          {/* Workflow Presets */}
          <Card>
            <SectionLabel>Workflow Presets</SectionLabel>
            <div className="mt-3 space-y-2">
              {workflowPresets.map((preset) => {
                const Icon = preset.icon
                const isActive = activePreset === preset.name
                return (
                  <button
                    key={preset.name}
                    onClick={() => setActivePreset(preset.name)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
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
            <p className="mt-1 text-[11px] text-on-surface-variant/50">
              Drag to add to your flow
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {formElements.map((el) => {
                const Icon = el.icon
                return (
                  <div
                    key={el.name}
                    draggable
                    className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container p-3 cursor-grab text-center transition-colors hover:border-primary/30 hover:bg-surface-container-high active:cursor-grabbing"
                  >
                    <Icon size={18} className="text-on-surface-variant" />
                    <span className="text-[11px] font-medium text-on-surface-variant">
                      {el.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ====== CENTER COLUMN ====== */}
        <div className="col-span-12 lg:col-span-5 overflow-y-auto space-y-4 px-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-2xl italic font-extrabold text-on-surface">
                Booking Flow
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
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
          <div className="flex flex-col items-center gap-0.5 py-1">
            <div className="h-6 w-px bg-outline-variant/30" />
            <ArrowDown size={14} className="text-outline-variant/40" />
            <div className="h-6 w-px bg-outline-variant/30" />
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
        <div className="col-span-12 lg:col-span-4 overflow-y-auto px-1">
          <div className="mb-3">
            <SectionLabel>Live Client Preview</SectionLabel>
          </div>

          {/* Phone mockup */}
          <div className="mx-auto w-[320px]">
            <div className="rounded-[2.5rem] border-4 border-[#373433] bg-[#151312] p-2 shadow-2xl">
              {/* Notch */}
              <div className="mx-auto mb-2 h-5 w-28 rounded-full bg-[#151312] border border-outline-variant/20" />

              {/* Screen */}
              <div className="rounded-[2rem] bg-white overflow-hidden" style={{ height: 560 }}>
                <div className="p-5 space-y-5">
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
                  <div className="space-y-4">
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
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-6">
                        <span className="text-[12px] text-gray-400">
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

      {/* ====== BOTTOM STATUS BAR ====== */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3">
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
