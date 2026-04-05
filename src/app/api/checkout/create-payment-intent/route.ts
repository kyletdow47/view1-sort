/**
 * POST /api/checkout/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for gallery checkout.
 *
 * TODO: Integrate real Stripe Connect:
 *   1. Install Stripe: already in package.json as stripe@^17.0.0
 *   2. Set STRIPE_SECRET_KEY in .env.local
 *   3. Set STRIPE_CONNECT_ACCOUNT_ID per photographer (from profiles/workspaces table)
 *   4. Use Stripe.paymentIntents.create({ ..., transfer_data: { destination: connectAccountId } })
 *      to route funds to photographer via Stripe Connect
 *   5. Store the payment_intent_id in a new orders table (§Decision 8) with status = 'pending'
 *   6. Use /api/webhooks/stripe route to listen for payment_intent.succeeded and:
 *      a. Update orders table status → 'paid'
 *      b. Generate signed Cloudflare download URLs
 *      c. Send download email via Resend
 */

import { NextRequest, NextResponse } from 'next/server'

interface CreatePaymentIntentBody {
  galleryId: string
  amountCents: number
  /** Stripe Connect account ID for the photographer — required for payouts */
  connectAccountId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePaymentIntentBody
    const { galleryId, amountCents, connectAccountId } = body

    if (!galleryId || typeof amountCents !== 'number' || amountCents < 50) {
      return NextResponse.json(
        { error: 'Invalid request: galleryId and amountCents (min $0.50) are required' },
        { status: 400 },
      )
    }

    /**
     * TODO: Replace mock with real Stripe integration:
     *
     * import Stripe from 'stripe'
     * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
     *
     * const paymentIntent = await stripe.paymentIntents.create({
     *   amount: amountCents,
     *   currency: 'usd',
     *   automatic_payment_methods: { enabled: true },
     *   metadata: { galleryId, source: 'view1-sort-checkout' },
     *   ...(connectAccountId && {
     *     application_fee_amount: Math.round(amountCents * 0.05), // 5% platform fee
     *     transfer_data: { destination: connectAccountId },
     *   }),
     * })
     *
     * return NextResponse.json({
     *   clientSecret: paymentIntent.client_secret,
     *   paymentIntentId: paymentIntent.id,
     *   amount: amountCents,
     * })
     */

    // Mock response — remove once Stripe is integrated
    void connectAccountId // suppress unused warning during mock phase
    const mockPaymentIntentId = `pi_mock_${galleryId}_${Date.now()}`
    return NextResponse.json({
      clientSecret: `${mockPaymentIntentId}_secret_mock`,
      paymentIntentId: mockPaymentIntentId,
      amount: amountCents,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
