import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import type { Profile } from '@/types/supabase'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role credentials')
  return createServiceClient(url, key)
}

export async function GET(): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const settingsUrl = `${appUrl}/dashboard/settings/connect`

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${appUrl}/auth/login`)
    }

    // Retrieve the account ID we stored when initiating Connect
    const { data: profileData } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<Profile, 'stripe_account_id'> | null
    const accountId = profile?.stripe_account_id

    if (!accountId) {
      return NextResponse.redirect(`${settingsUrl}?error=no_account`)
    }

    // Verify account status with Stripe
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(accountId)

    const chargesEnabled = account.charges_enabled ?? false
    const detailsSubmitted = account.details_submitted ?? false

    // Update profile with real verification status
    const serviceSupabase = getServiceSupabase()
    await serviceSupabase
      .from('profiles')
      .update({ stripe_connect_enabled: chargesEnabled })
      .eq('id', user.id)

    // Determine redirect status
    let status: string
    if (chargesEnabled) {
      status = 'success'
    } else if (detailsSubmitted) {
      status = 'pending'
    } else {
      status = 'incomplete'
    }

    return NextResponse.redirect(`${settingsUrl}?connected=${status}`)
  } catch (err) {
    console.error('Stripe Connect callback error:', err)
    return NextResponse.redirect(`${settingsUrl}?error=callback_failed`)
  }
}
