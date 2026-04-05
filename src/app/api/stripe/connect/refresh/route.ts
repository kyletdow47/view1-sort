import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAccountLink } from '@/lib/stripe/connect'

/**
 * POST /api/stripe/connect/refresh
 *
 * Refreshes a Stripe Connect Account Link when the previous onboarding
 * URL has expired. Called when Stripe redirects to the refresh_url.
 *
 * TODO(stripe-connect): This route is called when the Connect onboarding
 * link expires. In production, the refresh_url passed to createAccountLink
 * should point here so Stripe can renew the session automatically.
 */
export async function POST(): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.stripe_account_id) {
    return NextResponse.json(
      { error: 'No Stripe account found. Please start onboarding first.' },
      { status: 400 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const refreshUrl = `${appUrl}/api/stripe/connect/refresh`
  const returnUrl = `${appUrl}/api/stripe/connect/callback`

  try {
    const onboardingUrl = await createAccountLink(
      profile.stripe_account_id,
      refreshUrl,
      returnUrl,
    )
    return NextResponse.json({ url: onboardingUrl })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to refresh onboarding link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/stripe/connect/refresh
 *
 * Handles the browser redirect from Stripe when the onboarding URL expires.
 * Stripe calls this as a GET with no body — we regenerate the link and
 * redirect the photographer back to the Stripe-hosted onboarding flow.
 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const settingsUrl = `${appUrl}/dashboard/settings/connect`

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${appUrl}/auth/login`)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.redirect(`${settingsUrl}?error=no_account`)
    }

    const refreshUrl = `${appUrl}/api/stripe/connect/refresh`
    const returnUrl = `${appUrl}/api/stripe/connect/callback`

    const onboardingUrl = await createAccountLink(
      profile.stripe_account_id,
      refreshUrl,
      returnUrl,
    )

    return NextResponse.redirect(onboardingUrl)
  } catch (err) {
    console.error('Stripe Connect refresh error:', err)
    return NextResponse.redirect(`${settingsUrl}?error=refresh_failed`)
  }
}
