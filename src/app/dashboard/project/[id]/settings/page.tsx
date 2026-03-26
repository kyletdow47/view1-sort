'use client'

import { Settings, ArrowLeft, Trash2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function DisabledInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="px-4 py-2.5 rounded-lg bg-background border border-view1-border opacity-60">
        <span className="text-sm text-muted-foreground">{placeholder}</span>
      </div>
    </div>
  )
}

function DisabledSelect({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-background border border-view1-border opacity-60">
        <span className="text-sm text-muted-foreground">{placeholder}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
      </div>
    </div>
  )
}

export default function ProjectSettingsPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent" />
          Project Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure project details, access, and pricing</p>
      </div>

      {/* General */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">General</h2>
        <DisabledInput label="Project Name" placeholder="My Project" />
        <DisabledSelect label="Sorting Preset" placeholder="Wedding" />
      </section>

      {/* Metadata */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Metadata</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DisabledInput label="Shoot Date" placeholder="Select date" />
          <DisabledInput label="Location" placeholder="City, Country" />
        </div>
        <DisabledInput label="Description" placeholder="Notes about this project..." />
      </section>

      {/* Client Access */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Client Access</h2>
        <DisabledInput label="Client Email" placeholder="client@example.com" />
        <div className="flex items-center gap-3 opacity-50">
          <div className="w-10 h-5 rounded-full bg-background border border-view1-border" />
          <span className="text-sm text-muted-foreground">Password protect gallery</span>
        </div>
        <div className="flex items-center gap-3 opacity-50">
          <div className="w-10 h-5 rounded-full bg-background border border-view1-border" />
          <span className="text-sm text-muted-foreground">Allow downloads</span>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
        <DisabledSelect label="Pricing Model" placeholder="Per photo" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DisabledInput label="Price per Photo" placeholder="$0.00" />
          <DisabledInput label="Package Price" placeholder="$0.00" />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-red-500/20 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Permanently delete this project and all associated media. This action cannot be undone.
        </p>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium opacity-60 cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </button>
      </section>
    </div>
  )
}
