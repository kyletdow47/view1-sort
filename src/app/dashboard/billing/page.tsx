import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BillingView } from '@/components/features/billing/BillingView'
import type { Profile } from '@/types/supabase'

/* ── Demo data ── */
const DEMO_BILLING = {
  profile: {
    tier: 'pro' as const,
    stripe_customer_id: null,
    stripe_account_id: null,
  },
  connectStatus: 'not_connected' as const,
  balance: { available: 0, pending: 0 },
  transactions: [
    { id: 'TXN-4821', description: 'Wedding Package — Sarah Mitchell', status: 'Paid' as const, amount: 420000, created: 1711123200 },
    { id: 'TXN-4820', description: 'Editorial Shoot — James Harrington', status: 'Paid' as const, amount: 180000, created: 1710950400 },
    { id: 'TXN-4819', description: 'Preset Bundle — Elena Vasquez', status: 'Pending' as const, amount: 8900, created: 1710864000 },
    { id: 'TXN-4818', description: 'Portrait Session — David Kim', status: 'Refunded' as const, amount: 65000, created: 1710777600 },
    { id: 'TXN-4817', description: 'Event Coverage — Olivia Chen', status: 'Paid' as const, amount: 340000, created: 1710518400 },
  ],
}

async function getStripeConnectData(accountId: string) {
  try {
    const { getStripe } = await import('@/lib/stripe')
    const stripe = getStripe()

    const account = await stripe.accounts.retrieve(accountId)

    const balanceData = await stripe.balance.retrieve({
      stripeAccount: accountId,
    })

    const available = balanceData.available.reduce((sum, b) => sum + b.amount, 0)
    const pending = balanceData.pending.reduce((sum, b) => sum + b.amount, 0)

    const charges = await stripe.charges.list(
      { limit: 20 },
      { stripeAccount: accountId },
    )

    const transactions = charges.data.map((charge) => ({
      id: charge.id.slice(-8).toUpperCase(),
      description: charge.description ?? charge.billing_details?.name ?? 'Payment',
      status: charge.refunded
        ? ('Refunded' as const)
        : charge.paid
          ? ('Paid' as const)
          : ('Pending' as const),
      amount: charge.amount,
      created: charge.created,
    }))

    return {
      connectStatus: account.charges_enabled ? ('connected' as const) : ('onboarding' as const),
      balance: { available, pending },
      transactions,
    }
  } catch {
    return {
      connectStatus: 'error' as const,
      balance: { available: 0, pending: 0 },
      transactions: [],
    }
  }
}

export default async function BillingPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  if (isDemo) {
    return (
      <BillingView
        tier={DEMO_BILLING.profile.tier}
        connectStatus={DEMO_BILLING.connectStatus}
        balance={DEMO_BILLING.balance}
        transactions={DEMO_BILLING.transactions}
        isDemo
      />
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('tier, stripe_customer_id, stripe_account_id')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<Profile, 'tier' | 'stripe_customer_id' | 'stripe_account_id'> | null
  const tier = profile?.tier ?? 'free'
  const connectAccountId = profile?.stripe_account_id

  if (connectAccountId) {
    const connectData = await getStripeConnectData(connectAccountId)
    return (
      <BillingView
        tier={tier}
        connectStatus={connectData.connectStatus}
        balance={connectData.balance}
        transactions={connectData.transactions}
        connectAccountId={connectAccountId}
      />
    )
  }

  return (
    <BillingView
      tier={tier}
      connectStatus="not_connected"
      balance={{ available: 0, pending: 0 }}
      transactions={[]}
    />
  )
}
