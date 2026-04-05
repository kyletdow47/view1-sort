'use client'

/**
 * PaymentForm — Stripe Elements placeholder
 *
 * TODO: Replace with real Stripe Elements integration:
 *   1. Install @stripe/stripe-js and @stripe/react-stripe-js
 *   2. Wrap this component (or the checkout page) with <Elements stripe={stripePromise} options={...}>
 *   3. Replace the card number/expiry/cvc divs with <CardNumberElement>, <CardExpiryElement>, <CardCvcElement>
 *   4. Use useStripe() + useElements() hooks to confirm the payment on submit
 *   5. API route /api/checkout/create-payment-intent creates the PaymentIntent and returns clientSecret
 */

import { useState } from 'react'
import { CreditCard, Lock } from 'lucide-react'

interface PaymentFormProps {
  totalCents: number
  galleryId: string
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
}

export function PaymentForm({
  totalCents,
  galleryId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [email, setEmail] = useState('')

  const formattedTotal = `$${(totalCents / 100).toFixed(2)}`

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!cardholderName.trim() || !email.trim()) return

    setIsProcessing(true)

    try {
      /**
       * TODO: Real Stripe payment flow:
       *
       * 1. Fetch payment intent from server:
       *    const res = await fetch('/api/checkout/create-payment-intent', {
       *      method: 'POST',
       *      headers: { 'Content-Type': 'application/json' },
       *      body: JSON.stringify({ galleryId, amountCents: totalCents }),
       *    })
       *    const { clientSecret } = await res.json()
       *
       * 2. Confirm the payment with Stripe.js:
       *    const stripe = useStripe()
       *    const elements = useElements()
       *    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
       *      payment_method: {
       *        card: elements.getElement(CardNumberElement),
       *        billing_details: { name: cardholderName, email },
       *      },
       *    })
       *
       * 3. If paymentIntent.status === 'succeeded', call onSuccess(paymentIntent.id)
       */

      // Mock: simulate a 1.5s payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock success — remove this when real Stripe is wired up
      onSuccess('pi_mock_' + Math.random().toString(36).slice(2))
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Contact info */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/40">
          Contact Information
        </h3>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="checkout-email"
            className="text-[12px] font-medium text-white/55"
          >
            Email address
          </label>
          <input
            id="checkout-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#5749F4]/60 focus:bg-white/[0.09]"
          />
        </div>
      </div>

      {/* Card details */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/40">
          Payment Details
        </h3>

        {/* Cardholder name */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="checkout-name"
            className="text-[12px] font-medium text-white/55"
          >
            Cardholder name
          </label>
          <input
            id="checkout-name"
            type="text"
            required
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#5749F4]/60 focus:bg-white/[0.09]"
          />
        </div>

        {/* Card number placeholder — replace with Stripe CardNumberElement */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-white/55">Card number</label>
          {/* TODO: Replace with <CardNumberElement> from @stripe/react-stripe-js */}
          <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3">
            <CreditCard className="h-4 w-4 shrink-0 text-white/30" />
            <span className="text-[13px] text-white/25">
              •••• •••• •••• ••••
            </span>
          </div>
          <p className="text-[10px] text-white/25 italic">
            Stripe card input will render here once Stripe Elements is integrated
          </p>
        </div>

        {/* Expiry / CVC row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-white/55">Expiry</label>
            {/* TODO: Replace with <CardExpiryElement> */}
            <div className="flex items-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3">
              <span className="text-[13px] text-white/25">MM / YY</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-white/55">CVC</label>
            {/* TODO: Replace with <CardCvcElement> */}
            <div className="flex items-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3">
              <span className="text-[13px] text-white/25">•••</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isProcessing || !cardholderName.trim() || !email.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5749F4] px-6 py-4 text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {formattedTotal}
          </>
        )}
      </button>

      {/* Fine print */}
      <p className="text-center text-[10px] text-white/25 leading-relaxed">
        By completing this purchase you agree to our terms of service.
        Your payment is secured and encrypted by Stripe.
      </p>
    </form>
  )
}
