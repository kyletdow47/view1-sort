'use client'

/**
 * CheckoutView — Client component orchestrating the full checkout flow.
 *
 * Steps:
 *   1. select  — Choose package or confirm individual photo selection
 *   2. review  — Review order summary before payment
 *   3. payment — Enter card details (Stripe Elements placeholder)
 *   4. success — Confirmation + download links
 */

import { useState, useCallback, useMemo } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { PackageSelector } from './PackageSelector'
import { OrderSummary } from './OrderSummary'
import { PaymentForm } from './PaymentForm'
import { CheckoutSuccess } from './CheckoutSuccess'

import type {
  CheckoutPackage,
  CheckoutPhotoItem,
  CheckoutOrder,
  CheckoutStep,
  DownloadLink,
} from '@/types/checkout'
import type { PhotographerBrand } from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Default packages (used when gallery pricing_model === 'package')
// TODO: load from Supabase gallery_packages table (§Decision 8)
// ---------------------------------------------------------------------------

const DEFAULT_PACKAGES: CheckoutPackage[] = [
  {
    id: 'digital',
    name: 'Digital Only',
    description: 'Full-resolution digital files, forever yours',
    price: 39900, // $399.00
    priceLabel: '$399',
    includes: [
      'All gallery photos',
      'Full resolution JPGs',
      'Commercial license',
      'Instant download',
    ],
  },
  {
    id: 'prints-digital',
    name: 'Prints + Digital',
    description: 'Digital files plus a curated set of prints',
    price: 59900, // $599.00
    priceLabel: '$599',
    highlight: true,
    includes: [
      'All gallery photos',
      'Full resolution JPGs',
      '10 premium prints',
      'Shipped in 5–7 days',
    ],
  },
  {
    id: 'album-digital',
    name: 'Full Album + Digital',
    description: 'Lay-flat photo album + all digital files',
    price: 89900, // $899.00
    priceLabel: '$899',
    includes: [
      'All gallery photos',
      'Full resolution JPGs',
      '30-page lay-flat album',
      '5 fine-art prints',
    ],
  },
]

// ---------------------------------------------------------------------------
// Step labels
// ---------------------------------------------------------------------------

const STEP_LABELS: Record<CheckoutStep, string> = {
  select: 'Choose Package',
  review: 'Review Order',
  payment: 'Payment',
  success: 'Confirmed',
}

const STEP_ORDER: CheckoutStep[] = ['select', 'review', 'payment', 'success']

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CheckoutViewProps {
  galleryId: string
  galleryName: string
  pricingModel: string
  brand: PhotographerBrand
  /** Pre-selected photo IDs from the gallery viewer (for per-photo pricing) */
  initialPhotoIds?: string[]
  /** Available individual photos (for per-photo pricing display) */
  availablePhotos?: CheckoutPhotoItem[]
  /** Per-photo price in cents (for per-photo pricing model) */
  perPhotoCents?: number
  /**
   * Override the initial step — used when returning from Stripe Checkout redirect
   * with ?paid=true to jump directly to the success confirmation screen.
   */
  initialStep?: CheckoutStep
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutView({
  galleryId,
  galleryName,
  pricingModel,
  brand,
  initialPhotoIds = [],
  availablePhotos = [],
  perPhotoCents = 1500, // $15 per photo default
  initialStep = 'select',
}: CheckoutViewProps) {
  const [step, setStep] = useState<CheckoutStep>(initialStep)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    DEFAULT_PACKAGES[0]?.id ?? null,
  )
  const [selectedPhotoIds] = useState<string[]>(initialPhotoIds)
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Determine if this gallery uses per-photo or package pricing
  const isPerPhoto = pricingModel === 'per_photo'

  // Compute order totals
  const order: CheckoutOrder = useMemo(() => {
    let subtotal = 0

    if (isPerPhoto) {
      subtotal = selectedPhotoIds.length * perPhotoCents
    } else {
      const pkg = DEFAULT_PACKAGES.find((p) => p.id === selectedPackageId)
      subtotal = pkg?.price ?? 0
    }

    const tax = 0 // TODO: calculate tax based on jurisdiction via Stripe Tax
    return {
      type: isPerPhoto ? 'individual' : 'package',
      galleryId,
      galleryName,
      selectedPackageId: isPerPhoto ? null : selectedPackageId,
      selectedPhotoIds,
      subtotal,
      tax,
      total: subtotal + tax,
    }
  }, [isPerPhoto, selectedPackageId, selectedPhotoIds, perPhotoCents, galleryId, galleryName])

  // Step navigation
  const currentStepIndex = STEP_ORDER.indexOf(step)

  const canProceed = useMemo(() => {
    if (step === 'select') {
      return isPerPhoto ? selectedPhotoIds.length > 0 : selectedPackageId !== null
    }
    if (step === 'review') return order.total > 0
    return true
  }, [step, isPerPhoto, selectedPhotoIds.length, selectedPackageId, order.total])

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEP_ORDER.length) {
      setStep(STEP_ORDER[nextIndex])
    }
  }, [currentStepIndex])

  const goBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(STEP_ORDER[prevIndex])
    }
  }, [currentStepIndex])

  function handlePaymentSuccess(intentId: string) {
    setPaymentIntentId(intentId)
    setStep('success')
  }

  // Mock download links — real implementation: Supabase Edge Function issues
  // signed Cloudflare Images links after payment_intent webhook confirmation
  const downloadLinks: DownloadLink[] =
    step === 'success'
      ? [
          {
            label: `${galleryName} — Full Gallery`,
            url: '#', // TODO: Signed Cloudflare download URL from Supabase Edge Function
            expiresAt: '48 hours',
          },
        ]
      : []

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white">
      {/* Background mesh matching client portal */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 65% 15%, rgba(87,73,244,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 45% at 20% 80%, rgba(96,165,250,0.08) 0%, transparent 70%)',
            'linear-gradient(160deg, #030305 0%, #080810 30%, #060609 60%, #030305 100%)',
          ].join(', '),
        }}
      />

      {/* Header — photographer branding */}
      <header className="border-b border-white/[0.07] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {brand.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.avatarUrl}
                alt={brand.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: brand.accentColor }}
              >
                {brand.avatarInitials}
              </div>
            )}
            <span className="text-[14px] font-semibold text-white/80">
              {brand.name}
            </span>
          </div>

          {/* Step indicators — hidden on success */}
          {step !== 'success' && (
            <div className="hidden sm:flex items-center gap-1">
              {STEP_ORDER.filter((s) => s !== 'success').map((s, idx) => {
                const sIndex = STEP_ORDER.indexOf(s)
                const isActive = s === step
                const isPast = sIndex < currentStepIndex
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                        isActive
                          ? 'bg-[#5749F4] text-white'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/10 text-white/30',
                      ].join(' ')}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span
                      className={[
                        'hidden lg:block text-[11px] font-medium transition-colors',
                        isActive
                          ? 'text-white/80'
                          : isPast
                          ? 'text-emerald-400/70'
                          : 'text-white/25',
                      ].join(' ')}
                    >
                      {STEP_LABELS[s]}
                    </span>
                    {idx < 2 && (
                      <div className="mx-1 h-px w-6 bg-white/15" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Secure badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="hidden sm:block">Secure checkout</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {step === 'success' ? (
          <CheckoutSuccess
            paymentIntentId={paymentIntentId}
            galleryName={galleryName}
            brand={brand}
            downloadLinks={downloadLinks}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Left panel: step content ── */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Step heading */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                  Step {currentStepIndex + 1} of {STEP_ORDER.length - 1}
                </p>
                <h1 className="mt-1 text-[22px] font-bold text-white">
                  {STEP_LABELS[step]}
                </h1>
              </div>

              {/* Select step */}
              {step === 'select' && !isPerPhoto && (
                <PackageSelector
                  packages={DEFAULT_PACKAGES}
                  selectedPackageId={selectedPackageId}
                  onSelect={setSelectedPackageId}
                />
              )}

              {/* Per-photo: show selected photos */}
              {step === 'select' && isPerPhoto && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-white/40">
                    Selected Photos
                  </h3>
                  {selectedPhotoIds.length === 0 ? (
                    <p className="text-[13px] text-white/30">
                      No photos selected. Go back to the gallery to select photos.
                    </p>
                  ) : (
                    <p className="text-[14px] text-white/70">
                      {selectedPhotoIds.length} photo
                      {selectedPhotoIds.length !== 1 ? 's' : ''} selected ·{' '}
                      <span className="font-mono font-semibold text-white">
                        ${((selectedPhotoIds.length * perPhotoCents) / 100).toFixed(2)}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Review step: just show order summary inline */}
              {step === 'review' && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    Review your order below. Once you proceed to payment, your order
                    is locked in.
                  </p>
                </div>
              )}

              {/* Payment step */}
              {step === 'payment' && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 backdrop-blur-md">
                  {paymentError && (
                    <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
                      {paymentError}
                    </div>
                  )}
                  <PaymentForm
                    totalCents={order.total}
                    galleryId={galleryId}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setPaymentError(msg)}
                  />
                </div>
              )}

              {/* Navigation buttons (not shown on payment step — form handles submit) */}
              {step !== 'payment' && (
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[13px] font-medium text-white/70 transition-all hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed}
                    className="flex items-center gap-2 rounded-xl bg-[#5749F4] px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Right panel: order summary ── */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="lg:sticky lg:top-8">
                <OrderSummary
                  order={order}
                  packages={DEFAULT_PACKAGES}
                  photos={availablePhotos}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
