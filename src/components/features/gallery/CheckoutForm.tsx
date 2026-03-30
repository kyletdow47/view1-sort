'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, CreditCard, Lock, Shield } from 'lucide-react'
import type { Project } from '@/types/supabase'

interface CheckoutFormProps {
  project: Project
  projectId: string
  photographerName: string
}

function getPriceLabel(project: Project): string {
  if (project.pricing_model === 'flat_fee' && project.flat_fee_cents != null) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: project.currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(project.flat_fee_cents / 100)
  }
  if (project.pricing_model === 'per_photo' && project.per_photo_cents != null) {
    return `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: project.currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(project.per_photo_cents / 100)} / photo`
  }
  return 'Paid'
}

export function CheckoutForm({ project, projectId, photographerName }: CheckoutFormProps) {
  const [email, setEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const priceLabel = getPriceLabel(project)
  const canSubmit = email.includes('@') && termsAccepted && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/gallery/${projectId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const body = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !body.url) {
        setError(body.error ?? 'Failed to create checkout session.')
        setLoading(false)
        return
      }

      window.location.href = body.url
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-6 py-10">
      {/* Project header */}
      <div className="mb-8 text-center">
        <h1 className="font-headline text-2xl font-bold text-[#e7e1df]">{project.name}</h1>
        <p className="mt-1 text-sm text-[#a18d80]">by {photographerName}</p>
      </div>

      {/* Order summary */}
      <div className="mb-6 rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
        <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-4">
          Order Summary
        </h2>
        <p className="text-sm text-[#d9c2b4] mb-4">
          Full access to the {project.name} gallery with download rights.
        </p>
        <div className="border-t border-[#534439]/30 pt-4">
          <div className="flex justify-between text-base font-bold">
            <span className="text-[#e7e1df]">
              {project.pricing_model === 'flat_fee' ? 'Gallery Fee' : 'Price'}
            </span>
            <span className="text-[#ffb780]">{priceLabel}</span>
          </div>
          {project.pricing_model === 'per_photo' && (
            <p className="mt-2 text-xs text-[#a18d80]">
              Final total calculated at checkout based on your selection.
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="mb-6 rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
            Your Email
          </h2>
          <div className="flex items-center gap-1.5 text-[#a18d80]/60">
            <Shield size={12} />
            <span className="text-[10px]">Powered by Stripe</span>
          </div>
        </div>

        <div className="relative">
          <CreditCard
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a18d80]/50"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
            className="h-11 w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] pl-10 pr-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20 disabled:opacity-50"
          />
        </div>

        <p className="mt-2 text-xs text-[#a18d80]/60">
          Your download link and receipt will be sent here.
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Terms */}
      <label className="mb-6 flex cursor-pointer items-start gap-3">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-4 w-4 rounded border border-[#534439] bg-[#211f1e] transition-colors peer-checked:border-[#ffb780] peer-checked:bg-[#ffb780]" />
          {termsAccepted && (
            <Check size={10} className="absolute inset-0 m-auto text-[#4e2600]" />
          )}
        </div>
        <span className="text-xs leading-relaxed text-[#a18d80]">
          I agree to the{' '}
          <Link href="#" className="text-[#ffb780] underline underline-offset-2">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-[#ffb780] underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-3.5 font-headline font-bold text-[#4e2600] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to Stripe…' : `Continue to Payment — ${priceLabel}`}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[#a18d80]/60">
        <Lock size={12} />
        <span className="text-[11px]">256-bit encryption &middot; Your payment is secure</span>
      </div>
    </form>
  )
}
