'use client'

import { useState } from 'react'
import { X, CalendarDays, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NewBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  workspaceId: string
}

const EVENT_TYPES = ['Wedding', 'Real Estate', 'Portrait', 'Commercial', 'Travel', 'Other']
const PACKAGES = ['Standard', 'Premium', 'Full Day', 'Half Day', 'Custom']

export function NewBookingModal({ isOpen, onClose, onCreated, workspaceId }: NewBookingModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [shootDate, setShootDate] = useState('')
  const [shootTime, setShootTime] = useState('')
  const [eventType, setEventType] = useState('')
  const [location, setLocation] = useState('')
  const [packageType, setPackageType] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !shootDate) {
      setError('Client name and event date are required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const amountCents = amount ? Math.round(parseFloat(amount) * 100) : null

      const { error: insertError } = await supabase.from('bookings').insert({
        workspace_id: workspaceId,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        shoot_date: shootDate,
        shoot_time: shootTime || null,
        package_type: packageType || eventType || null,
        amount_cents: amountCents,
        location: location.trim() || null,
        notes: notes.trim() || null,
        status: 'pending',
      })

      if (insertError) throw insertError

      onCreated()
      onClose()
      // Reset form
      setClientName('')
      setClientEmail('')
      setShootDate('')
      setShootTime('')
      setEventType('')
      setLocation('')
      setPackageType('')
      setAmount('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-outline-variant/30 bg-surface-container p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dim">
              <CalendarDays size={20} className="text-on-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">New Booking</h2>
              <p className="text-xs text-on-surface-variant">Schedule a new shoot session</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-on-surface-variant hover:bg-[#2c2928] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Sarah Johnson"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={shootTime}
                onChange={(e) => setShootTime(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Event Type + Package */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/40"
              >
                <option value="">Select type...</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Package
              </label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/40"
              >
                <option value="">Select package...</option>
                {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Location + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Juan, CA"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2400"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details about the shoot..."
              rows={2}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none focus:border-primary/40 resize-none"
            />
          </div>

          {error && <p className="text-xs text-[#e7765f]">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-outline-variant/30 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-[#2c2928] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
