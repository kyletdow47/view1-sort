import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

/**
 * GET /api/stripe/connect/status
 *
 * Returns the current Stripe Connect account status for the authenticated
 * photographer, refreshing the profile if needed.
 *
 * Response:
 * {
 *   connected: boolean
 *   chargesEnabled: boolean
 *   detailsSubmitted: boolean
 *   payoutsEnabled: boolean
 *   email: string | null
 *   dashboardUrl: string          // Stripe Express dashboard link
 *   requiresAction: boolean       // true if user needs to do something
 *   restrictions: string[]        // list of active restrictions
 * }
 *
 * TODO(stripe-connect): dashboardUrl requires a real call to
 * stripe.accounts.createLoginLink(accountId). Currently returns a
 * placeholder Stripe dashboard URL. Wire this once STRIPE_SECRET_KEY
 * is configured in production.
 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_connect_enabled, email')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }

  const accountId = profile?.stripe_account_id ?? null

  if (!accountId) {
    return NextResponse.json({
      connected: false,
      chargesEnabled: false,
      detailsSubmitted: false,
      payoutsEnabled: false,
      email: null,
      dashboardUrl: 'https://dashboard.stripe.com',
      requiresAction: true,
      restrictions: [],
    })
  }

  try {
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(accountId)

    const chargesEnabled = account.charges_enabled ?? false
    const detailsSubmitted = account.details_submitted ?? false
    const payoutsEnabled = account.payouts_enabled ?? false

    // Collect any active requirements that need action
    const restrictions: string[] = [
      ...(account.requirements?.currently_due ?? []),
      ...(account.requirements?.past_due ?? []),
    ]

    // Generate a Stripe Express dashboard login link
    // TODO(stripe-connect): Uncomment when STRIPE_SECRET_KEY is set
    // const loginLink = await stripe.accounts.createLoginLink(accountId)
    // const dashboardUrl = loginLink.url

    const dashboardUrl = `https://dashboard.stripe.com/connect/accounts/${accountId}`

    return NextResponse.json({
      connected: true,
      chargesEnabled,
      detailsSubmitted,
      payoutsEnabled,
      email: account.email ?? profile?.email ?? null,
      dashboardUrl,
      requiresAction: restrictions.length > 0,
      restrictions,
    })
  } catch (err) {
    console.error('Stripe Connect status check error:', err)
    return NextResponse.json({ error: 'Failed to retrieve Stripe account status' }, { status: 500 })
  }
}
