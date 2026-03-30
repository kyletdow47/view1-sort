import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createAccountLink } from '@/lib/stripe/connect'

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

  if (profileError) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const refreshUrl = `${appUrl}/api/stripe/connect`
  const returnUrl = `${appUrl}/api/stripe/connect/callback`

  try {
    let accountId = profile?.stripe_account_id ?? null
    if (!accountId) {
      accountId = await createConnectAccount(user.id)
    }

    const onboardingUrl = await createAccountLink(accountId, refreshUrl, returnUrl)
    return NextResponse.json({ url: onboardingUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start Stripe Connect onboarding'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
