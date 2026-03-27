import {
  ArrowUpRight,
  CreditCard,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import { getStripe } from '@/lib/stripe'
import type { GalleryPayment, Profile, Project } from '@/types/supabase'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildRevenueChart(payments: Pick<GalleryPayment, 'amount' | 'paid_at'>[]): string {
  const now = new Date()
  const counts: number[] = Array(21).fill(0)
  const step = 30 / (counts.length - 1)

  for (const p of payments) {
    if (!p.paid_at || !p.amount) continue
    const daysAgo = (now.getTime() - new Date(p.paid_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysAgo < 0 || daysAgo > 30) continue
    const idx = Math.min(Math.round((30 - daysAgo) / step), counts.length - 1)
    counts[idx] += p.amount / 100
  }

  const max = Math.max(...counts, 1)
  const w = 480
  const h = 120
  const s = w / (counts.length - 1)

  return counts
    .map((c, i) => {
      const x = i * s
      const y = h - (c / max) * h
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-[#95d1d1]/10 text-[#95d1d1] border border-[#95d1d1]/20',
  pending: 'bg-[#ffb780]/10 text-[#ffb780] border border-[#ffb780]/20',
  refunded: 'bg-[#ffb4a5]/10 text-[#ffb4a5] border border-[#ffb4a5]/20',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Profile for Stripe Connect status
  const { data: profileData } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_connect_enabled, tier, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<Profile, 'stripe_account_id' | 'stripe_connect_enabled' | 'tier' | 'subscription_status' | 'stripe_customer_id'> | null

  // Workspace + project IDs
  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]
  const projectIds: string[] = []
  const projectNameMap: Record<string, string> = {}

  if (workspace) {
    const { data: projectRows } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspace.id)

    for (const p of (projectRows ?? []) as Pick<Project, 'id' | 'name'>[]) {
      projectIds.push(p.id)
      projectNameMap[p.id] = p.name
    }
  }

  // Recent transactions from gallery_payments
  const paymentsResult = projectIds.length > 0
    ? await supabase
        .from('gallery_payments')
        .select('id, project_id, client_email, amount, currency, status, stripe_session_id, created_at, paid_at')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] as GalleryPayment[] }

  const payments = (paymentsResult.data ?? []) as GalleryPayment[]

  // Metrics
  const paidPayments = payments.filter((p) => p.status === 'paid' && p.amount != null)
  const totalRevenueCents = paidPayments.reduce((s, p) => s + (p.amount ?? 0), 0)
  const avgBookingCents = paidPayments.length > 0
    ? Math.round(totalRevenueCents / paidPayments.length)
    : 0

  const chartPath = buildRevenueChart(payments as Pick<GalleryPayment, 'amount' | 'paid_at'>[])
  const chartAreaPath = `${chartPath} L 480 120 L 0 120 Z`

  // Stripe Connect balance (best-effort — may fail if key not configured)
  let stripeBalance: { available: number; pending: number } | null = null
  if (profile?.stripe_account_id && profile.stripe_connect_enabled) {
    try {
      const stripe = getStripe()
      const balance = await stripe.balance.retrieve({
        stripeAccount: profile.stripe_account_id,
      })
      const usd = balance.available.find((b) => b.currency === 'usd')
      const usdPending = balance.pending.find((b) => b.currency === 'usd')
      stripeBalance = {
        available: usd?.amount ?? 0,
        pending: usdPending?.amount ?? 0,
      }
    } catch {
      // Stripe not configured in this environment — show placeholder
    }
  }

  const avgGoalCents = Math.max(avgBookingCents * 1.25, 10000)
  const avgPct = avgGoalCents > 0 ? Math.min(avgBookingCents / avgGoalCents, 1) : 0
  const r = 52
  const circumference = 2 * Math.PI * r
  const radialOffset = circumference * (1 - avgPct)

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {/* Top Row: Revenue Chart + Avg Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Total Revenue Card */}
          <div className="lg:col-span-9 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                Total Revenue
              </p>
              <div className="flex items-center gap-1 text-[#95d1d1]">
                <TrendingUp size={14} />
                <span className="text-xs font-medium">Last 30 days</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-6">
              ${(totalRevenueCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <svg viewBox="0 0 480 120" className="w-full h-[120px]" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffb780" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffb780" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartAreaPath} fill="url(#chartGrad)" />
              <path
                d={chartPath}
                fill="none"
                stroke="#ffb780"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Avg Booking Value */}
          <div className="lg:col-span-3 bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-4">
              Avg Booking Value
            </p>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={r} fill="none" stroke="#2c2928" strokeWidth="10" />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="url(#radialGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={radialOffset}
                transform="rotate(-90 70 70)"
              />
              <defs>
                <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffb780" />
                  <stop offset="100%" stopColor="#d48441" />
                </linearGradient>
              </defs>
              <text x="70" y="66" textAnchor="middle" fill="#e7e1df" fontSize="16" fontWeight="700">
                {avgBookingCents > 0
                  ? `$${(avgBookingCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                  : '$0'}
              </text>
              <text x="70" y="82" textAnchor="middle" fill="#a18d80" fontSize="10">
                {paidPayments.length} {paidPayments.length === 1 ? 'payment' : 'payments'}
              </text>
            </svg>
          </div>
        </div>

        {/* Stripe Connect Section */}
        <div className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#ffb780]/10">
              <CreditCard size={20} className="text-[#ffb780]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                Stripe Connect
              </p>
              <p className="text-xs text-[#a18d80] mt-0.5">
                {profile?.stripe_connect_enabled
                  ? 'Connected · Auto payouts enabled'
                  : 'Not connected'}
              </p>
            </div>
          </div>

          {!profile?.stripe_account_id ? (
            <div className="flex items-center gap-3 rounded-xl bg-[#211f1e] p-5">
              <AlertCircle size={18} className="text-[#ffb780] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#d9c2b4]">Connect Stripe to receive payouts</p>
                <p className="text-xs text-[#a18d80] mt-0.5">
                  Go to Settings → Stripe Connect to link your account.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance */}
              <div className="bg-[#211f1e] rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-2">
                  Available Balance
                </p>
                <p className="text-3xl font-bold text-white">
                  {stripeBalance != null
                    ? `$${(stripeBalance.available / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '—'}
                </p>
              </div>

              {/* Pending */}
              <div className="bg-[#211f1e] rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-2">
                  Incoming (Pending)
                </p>
                <p className="text-3xl font-bold text-white">
                  {stripeBalance != null
                    ? `$${(stripeBalance.pending / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '—'}
                </p>
              </div>

              {/* Actions */}
              <div className="bg-[#211f1e] rounded-xl p-5 flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-3">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  <a
                    href={`https://dashboard.stripe.com/${profile.stripe_account_id}/payouts`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#534439] text-sm font-medium text-[#d9c2b4] hover:bg-[#2c2928] transition-colors"
                  >
                    View Payout History
                    <ChevronRight size={14} className="text-[#a18d80]" />
                  </a>
                  <a
                    href={`https://dashboard.stripe.com/${profile.stripe_account_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-semibold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <ArrowUpRight size={14} />
                    Stripe Dashboard
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <section className="bg-[#1d1b1a] rounded-xl border border-[#534439]/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#534439]/40">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          </div>
          {payments.length === 0 ? (
            <div className="py-12 text-center text-[#a18d80] text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#534439]/40">
                    {['ID', 'Client', 'Gallery', 'Status', 'Amount', 'Date'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-6 py-3.5 text-[10px] uppercase tracking-widest font-medium text-[#a18d80]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((txn) => {
                    const statusStyle = STATUS_STYLES[txn.status] ?? STATUS_STYLES['pending']!
                    const shortId = txn.stripe_session_id?.slice(-8) ?? txn.id.slice(-8)
                    return (
                      <tr
                        key={txn.id}
                        className="border-b border-[#534439]/20 hover:bg-[#211f1e] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-[#a18d80]">
                          …{shortId}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#d9c2b4]">
                          {txn.client_email ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#d9c2b4]">
                          {projectNameMap[txn.project_id] ?? txn.project_id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium ${statusStyle}`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {txn.amount != null
                            ? `$${(txn.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#a18d80]">
                          {formatDate(txn.paid_at ?? txn.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
