'use client'

import { FileText, Plus, GripVertical, Type, Calendar, MapPin, MessageSquare } from 'lucide-react'

const sampleFields = [
  { icon: Type, label: 'Full Name', type: 'Text' },
  { icon: Calendar, label: 'Preferred Date', type: 'Date Picker' },
  { icon: MapPin, label: 'Location', type: 'Text' },
  { icon: MessageSquare, label: 'Additional Notes', type: 'Textarea' },
]

export default function BookingFormsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Phase 2 Banner */}
      <div className="px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
        Phase 2 -- This feature is planned for the next release
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent" />
          Booking Form Builder
        </h1>
        <p className="text-muted-foreground mt-1">Create custom booking forms for your clients to fill out</p>
      </div>

      {/* Form Fields List */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">Form Fields</h2>
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">Draft</span>
        </div>

        <div className="space-y-2">
          {sampleFields.map((field) => (
            <div
              key={field.label}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background border border-view1-border opacity-50"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/30" />
              <field.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">{field.label}</span>
              <span className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded">{field.type}</span>
            </div>
          ))}
        </div>

        <button
          disabled
          className="flex items-center gap-2 w-full justify-center px-4 py-3 rounded-lg border-2 border-dashed border-view1-border text-muted-foreground text-sm opacity-40 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Build custom intake forms to streamline your booking process
      </p>
    </div>
  )
}
