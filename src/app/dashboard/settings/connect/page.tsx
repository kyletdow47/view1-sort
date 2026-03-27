'use client'

import {
  CreditCard,
  Zap,
  Shield,
  FileText,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Globe,
  Building2,
  Receipt,
  Target,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/*  Mock data (client table — kept static for now)                    */
/* ------------------------------------------------------------------ */

const connectedClients = [
  {
    client: 'Sarah & James',
    project: 'Wedding Collection',
    lastPayment: 'Mar 18, 2026',
    status: 'Active',
    volume: '$8,450.00',
  },
  {
    client: 'Meridian Hotels',
    project: 'Brand Refresh',
    lastPayment: 'Mar 12, 2026',
    status: 'Active',
    volume: '$12,800.00',
  },
  {
    client: 'Emily Torres',
    project: 'Portrait Session',
    lastPayment: 'Feb 28, 2026',
    status: 'Completed',
    volume: '$2,200.00',
  },
  {
    client: 'Neon Magazine',
    project: 'Editorial Spread',
    lastPayment: 'Feb 14, 2026',
    status: 'Pending',
    volume: '$6,100.00',
  },
]

const payoutFreqs = ['Daily', 'Weekly', 'Monthly'] as const

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}
    >
      {children}
    </div>
  )
}

function BenefitItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant">{desc}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-green-500/10 text-green-400',
    Completed: 'bg-secondary/10 text-secondary',
    Pending: 'bg-yellow-500/10 text-yellow-400',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors[status] ?? 'bg-surface-container text-on-surface-variant'}`}
    >
      {status}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StripeConnectPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [payoutFreq, setPayoutFreq] =
    useState<(typeof payoutFreqs)[number]>('Weekly')

  // Check for ?connected=true or ?error= from callback redirect
  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
    if (searchParams.get('error')) {
      setConnectError('Stripe onboarding could not be completed. Please try again.')
    }
  }, [searchParams])

  // Load profile to check if already connected
  useEffect(() => {
    if (!user) return

    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('stripe_account_id')
          .eq('id', user.id)
          .single()

        setStripeAccountId(data?.stripe_account_id ?? null)
      } finally {
        setProfileLoading(false)
      }
    }

    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    setConnectError(null)

    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const json = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !json.url) {
        throw new Error(json.error ?? 'Failed to start onboarding')
      }

      // Redirect to Stripe onboarding
      window.location.href = json.url
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Something went wrong')
      setConnecting(false)
    }
  }, [])

  const isConnected = Boolean(stripeAccountId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">
          Stripe Connect
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage payouts, client billing, and payment settings
        </p>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <p className="text-sm text-green-400">
            Stripe Connect account linked successfully!
          </p>
        </div>
      )}

      {/* Error banner */}
      {connectError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle size={18} className="text-error shrink-0" />
          <p className="text-sm text-error">{connectError}</p>
        </div>
      )}

      {/* Top row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Onboarding hero card */}
        <Card className="col-span-12 lg:col-span-8 relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#ffb780]/15 to-[#d48441]/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1 space-y-5">
              <div>
                <SectionLabel>Payment Integration</SectionLabel>
                <h2 className="mt-2 font-headline text-2xl font-extrabold text-on-surface">
                  {isConnected
                    ? 'Stripe Account Connected'
                    : 'Connect your Stripe Account'}
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                  {isConnected
                    ? 'Your Stripe Express account is linked. Clients can now pay you directly through their galleries.'
                    : 'Accept payments from clients seamlessly. Funds are deposited directly into your bank account with full transparency.'}
                </p>
              </div>

              {!isConnected && (
                <div className="space-y-3">
                  <BenefitItem
                    icon={Zap}
                    title="Instant Payouts"
                    desc="Get paid within minutes of client payment"
                  />
                  <BenefitItem
                    icon={Shield}
                    title="Secure Payments"
                    desc="PCI-compliant with end-to-end encryption"
                  />
                  <BenefitItem
                    icon={FileText}
                    title="Automated Tax Reports"
                    desc="1099-K generation and annual summaries"
                  />
                </div>
              )}

              {profileLoading ? (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : isConnected ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex items-center gap-2 rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-60"
                  >
                    {connecting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ExternalLink size={14} />
                    )}
                    Manage in Stripe
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-8 py-3 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {connecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  {connecting ? 'Redirecting…' : 'Connect with Stripe'}
                  {!connecting && <ChevronRight size={16} />}
                </button>
              )}
            </div>

            {/* Decorative illustration placeholder */}
            <div className="hidden lg:flex h-52 w-52 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-high border border-outline-variant/20">
              <div className="space-y-2 text-center">
                {isConnected ? (
                  <>
                    <CheckCircle2 size={40} className="mx-auto text-green-400/60" />
                    <span className="text-[10px] text-green-400/60 uppercase tracking-wider">
                      Connected
                    </span>
                  </>
                ) : (
                  <>
                    <CreditCard size={40} className="mx-auto text-primary/40" />
                    <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider">
                      Stripe
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Status */}
        <Card className="col-span-12 lg:col-span-4">
          <SectionLabel>Account Status</SectionLabel>
          <div className="mt-3 flex items-center gap-2">
            {profileLoading ? (
              <Loader2 size={18} className="animate-spin text-on-surface-variant/50" />
            ) : isConnected ? (
              <>
                <CheckCircle2 size={18} className="text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  Verified
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={18} className="text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">
                  Not connected
                </span>
              </>
            )}
          </div>

          {isConnected && (
            <div className="mt-5 space-y-4">
              <div>
                <SectionLabel>Next Payout</SectionLabel>
                <p className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
                  $4,250.00
                </p>
              </div>

              <div className="space-y-1.5">
                <SectionLabel>Payout Frequency</SectionLabel>
                <div className="flex gap-1.5">
                  {payoutFreqs.map((f) => (
                    <button
                      key={f}
                      onClick={() => setPayoutFreq(f)}
                      className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                        payoutFreq === f
                          ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                          : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isConnected && !profileLoading && (
            <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
              Connect your Stripe account to start accepting payments from clients.
            </p>
          )}
        </Card>
      </div>

      {/* Connected Client Accounts */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Connected Client Accounts
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {connectedClients.length} active connections
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {[
                  'Client / Project',
                  'Last Payment',
                  'Status',
                  'Total Volume',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pr-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {connectedClients.map((row) => (
                <tr
                  key={row.client}
                  className="border-b border-outline-variant/10 last:border-0"
                >
                  <td className="py-3.5 pr-4">
                    <p className="text-sm font-medium text-on-surface">
                      {row.client}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {row.project}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-on-surface-variant">
                    {row.lastPayment}
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3.5 pr-4 text-sm font-medium text-on-surface">
                    {row.volume}
                  </td>
                  <td className="py-3.5">
                    <button className="rounded-lg p-1.5 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Payout Settings */}
        <Card className="col-span-12 lg:col-span-6">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-5">
            Payout Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-surface-container px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-on-surface-variant/50" />
                <span className="text-sm text-on-surface-variant">
                  Currency
                </span>
              </div>
              <span className="text-sm font-medium text-on-surface">
                USD ($)
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container px-4 py-3">
              <div className="flex items-center gap-3">
                <Building2 size={16} className="text-on-surface-variant/50" />
                <span className="text-sm text-on-surface-variant">
                  Bank Account
                </span>
              </div>
              <span className="text-sm font-medium text-on-surface">
                ****4829
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container px-4 py-3">
              <div className="flex items-center gap-3">
                <Receipt size={16} className="text-on-surface-variant/50" />
                <span className="text-sm text-on-surface-variant">Tax ID</span>
              </div>
              <span className="text-sm font-medium text-on-surface">
                US-***-**7291
              </span>
            </div>
          </div>
        </Card>

        {/* Monthly Goal */}
        <Card className="col-span-12 lg:col-span-6">
          <div className="flex items-center gap-2 mb-5">
            <Target size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Monthly Goal
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-on-surface-variant">
                Target:{' '}
                <span className="font-semibold text-on-surface">$12,000</span>
              </p>
              <span className="text-2xl font-extrabold text-primary">74%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441] transition-all"
                style={{ width: '74%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>$8,880 earned</span>
              <span>$3,120 remaining</span>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-surface-container p-3">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-secondary" />
              <span className="text-xs text-on-surface-variant">
                On track to exceed goal by{' '}
                <span className="text-secondary font-medium">Mar 31</span>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
