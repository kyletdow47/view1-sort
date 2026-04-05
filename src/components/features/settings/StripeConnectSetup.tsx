'use client'

import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  CreditCard,
  ChevronRight,
  Smartphone,
  Building2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { useState, useEffect, useCallback, type ElementType } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

type ConnectStatus = 'loading' | 'not_connected' | 'pending' | 'connected' | 'restricted'

interface PaymentMethods {
  cards: boolean
  applePay: boolean
  bankTransfer: boolean
}

interface ConnectProfile {
  stripeAccountId: string | null
  stripeConnectEnabled: boolean
  email: string
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function ToggleSwitch({
  checked,
  onChange,
  gradient,
  disabled = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  gradient: string
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative h-5 w-9 rounded-full transition-all disabled:opacity-50"
      style={{ background: checked ? gradient : 'rgba(255,255,255,0.15)' }}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function BenefitRow({ icon: Icon, label, sub }: { icon: ElementType; label: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8">
        <Icon size={15} className="text-white/60" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white font-[Geist,sans-serif]">{label}</p>
        <p className="text-xs text-white/50 font-[Geist,sans-serif]">{sub}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */

/**
 * StripeConnectSetup — Stripe Connect onboarding widget.
 *
 * Handles all UI states:
 *   - loading          → spinner
 *   - not_connected    → "Connect with Stripe" CTA with benefit rows
 *   - pending          → incomplete-setup warning + "Continue Setup"
 *   - connected        → account info + payment methods toggles
 *   - restricted       → restricted account banner
 *
 * Pencil frame: WkLgB ("Stripe Connect Onboarding")
 * Route: /dashboard/settings/connect
 */
export function StripeConnectSetup({
  previewStatus,
}: {
  /** Override status for UI previews / Storybook. Skips profile load. */
  previewStatus?: ConnectStatus
}) {
  const { user } = useAuth()
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<ConnectStatus>('loading')
  const [profile, setProfile] = useState<ConnectProfile>({
    stripeAccountId: null,
    stripeConnectEnabled: false,
    email: '',
  })
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    cards: true,
    applePay: true,
    bankTransfer: false,
  })

  /* ── Load profile ── */
  useEffect(() => {
    if (previewStatus) {
      setStatus(previewStatus)
      return
    }
    if (!user) return

    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('stripe_account_id, stripe_connect_enabled, email')
          .eq('id', user.id)
          .single()

        const accountId = (data as Record<string, unknown> | null)?.stripe_account_id as string | null ?? null
        const enabled = (data as Record<string, unknown> | null)?.stripe_connect_enabled as boolean ?? false

        setProfile({
          stripeAccountId: accountId,
          stripeConnectEnabled: enabled,
          email: ((data as Record<string, unknown> | null)?.email as string | null) ?? user.email ?? '',
        })

        if (!accountId) setStatus('not_connected')
        else if (!enabled) setStatus('pending')
        else setStatus('connected')
      } catch {
        setStatus('not_connected')
      }
    }

    load()
  }, [user, previewStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handle callback query params ── */
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')

    if (connected === 'success' || connected === 'true') {
      setToastMessage('Stripe account connected successfully!')
      setTimeout(() => setToastMessage(null), 5000)
    } else if (connected === 'pending') {
      setToastMessage('Setup in progress — some features may be limited until verification.')
    } else if (connected === 'incomplete') {
      setConnectError('Setup not completed. Please finish connecting your account.')
    } else if (error) {
      setConnectError('Stripe onboarding could not be completed. Please try again.')
    }
  }, [searchParams])

  /* ── Connect / re-initiate onboarding ── */
  const handleConnect = useCallback(async () => {
    setConnecting(true)
    setConnectError(null)

    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const json = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !json.url) {
        throw new Error(json.error ?? 'Failed to start onboarding')
      }

      window.location.href = json.url
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Something went wrong')
      setConnecting(false)
    }
  }, [])

  /* ── Open Stripe Dashboard ── */
  const handleManageInStripe = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/connect/status')
      const json = (await res.json()) as { dashboardUrl?: string }
      const url = json.dashboardUrl ?? 'https://dashboard.stripe.com'
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open('https://dashboard.stripe.com', '_blank', 'noopener,noreferrer')
    }
  }, [])

  /* ── Disconnect ── */
  const handleDisconnect = useCallback(async () => {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true)
      setTimeout(() => setConfirmDisconnect(false), 4000)
      return
    }
    try {
      await supabase
        .from('profiles')
        .update({ stripe_account_id: null, stripe_connect_enabled: false })
        .eq('id', user?.id ?? '')
      setStatus('not_connected')
      setProfile((p) => ({ ...p, stripeAccountId: null, stripeConnectEnabled: false }))
      setConfirmDisconnect(false)
    } catch {
      setConnectError('Failed to disconnect. Please try again.')
    }
  }, [confirmDisconnect, supabase, user?.id])

  /* ─────── Render ─────── */

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-12 text-white/40">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm font-medium font-[Geist,sans-serif]">
          Loading payment settings…
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3">
          <CheckCircle2 size={16} className="shrink-0 text-green-400" />
          <p className="text-sm text-green-400 font-[Geist,sans-serif]">{toastMessage}</p>
        </div>
      )}

      {/* Error */}
      {connectError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <p className="text-sm text-red-400 font-[Geist,sans-serif]">{connectError}</p>
        </div>
      )}

      {/* ── Not connected: Connect CTA ── */}
      {status === 'not_connected' && (
        <div
          className="rounded-3xl p-6 backdrop-blur-2xl space-y-5"
          style={{
            background: '#0c0c14 padding-box, linear-gradient(135deg, rgba(245,158,11,0.35) 0%, rgba(236,72,153,0.25) 50%, rgba(168,85,247,0.35) 100%) border-box',
            border: '1.5px solid transparent',
          }}
        >
          <div
            className="space-y-5"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)' }}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 font-[Geist,sans-serif]">
                Payment Integration
              </p>
              <h2 className="mt-2 text-xl font-bold text-white font-[Geist,sans-serif]">
                Connect your Stripe Account
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60 font-[Geist,sans-serif]">
                Accept payments from clients seamlessly. Funds are deposited directly into
                your bank account with full transparency.
              </p>
            </div>

            <div className="space-y-3">
              <BenefitRow
                icon={CreditCard}
                label="No monthly fees"
                sub="Pay only when you get paid"
              />
              <BenefitRow
                icon={Building2}
                label="Direct bank deposits"
                sub="Stripe handles payouts automatically"
              />
              <BenefitRow
                icon={CheckCircle2}
                label="View1 Sort takes 0%"
                sub="Stripe charges 2.9% + $0.30 per transaction"
              />
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 font-[Geist,sans-serif]"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #A855F7 100%)',
              }}
            >
              {connecting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CreditCard size={15} />
              )}
              {connecting ? 'Redirecting to Stripe…' : 'Connect with Stripe'}
              {!connecting && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Pending: incomplete setup warning ── */}
      {status === 'pending' && (
        <div
          className="rounded-3xl p-6 backdrop-blur-2xl"
          style={{
            background: '#0c0c14 padding-box, linear-gradient(135deg, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.3) 100%) border-box',
            border: '1.5px solid transparent',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-yellow-300 font-[Geist,sans-serif]">
                  Setup incomplete
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-yellow-400/70 font-[Geist,sans-serif]">
                  Your Stripe account isn&apos;t fully verified. Complete your setup to start
                  accepting payments from clients.
                </p>
              </div>
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-yellow-400/15 px-4 py-2 text-sm font-semibold text-yellow-300 transition-colors hover:bg-yellow-400/25 disabled:opacity-60 font-[Geist,sans-serif]"
            >
              {connecting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ExternalLink size={13} />
              )}
              Continue Setup
            </button>
          </div>
        </div>
      )}

      {/* ── Connected: account info ── */}
      {(status === 'connected' || status === 'restricted') && (
        <div
          className="rounded-3xl p-6 backdrop-blur-2xl space-y-3"
          style={{
            background: '#0c0c14 padding-box, linear-gradient(135deg, rgba(52,211,153,0.38) 0%, rgba(59,130,246,0.31) 50%, rgba(168,85,247,0.38) 100%) border-box',
            border: '1.5px solid transparent',
          }}
        >
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'restricted' ? (
                <>
                  <AlertCircle size={14} className="text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-400 font-[Geist,sans-serif]">
                    Restricted
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#34d399]" />
                  <span className="text-sm font-semibold text-green-400 font-[Geist,sans-serif]">
                    Connected
                  </span>
                </>
              )}
            </div>

            <button
              onClick={handleManageInStripe}
              className="flex items-center gap-1 text-xs font-medium font-[Geist,sans-serif] hover:opacity-80 transition-opacity"
              style={{
                background: 'linear-gradient(90deg, #3B82F6, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Manage in Stripe
              <ExternalLink
                size={11}
                className="text-blue-400 ml-0.5"
                style={{ WebkitTextFillColor: 'unset' }}
              />
            </button>
          </div>

          {/* Account info */}
          <div className="space-y-1">
            <p className="text-sm text-white/70 font-[Geist,sans-serif]">
              {profile.email || user?.email}
            </p>
            <p className="text-sm text-white/50 font-[Geist,sans-serif]">
              Bank: ••••4829 · Payout: Weekly (Fridays)
            </p>
          </div>

          {/* Disconnect */}
          <div className="pt-1">
            <button
              onClick={handleDisconnect}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors font-[Geist,sans-serif] ${
                confirmDisconnect
                  ? 'text-red-400'
                  : 'text-white/25 hover:text-white/50'
              }`}
            >
              <RefreshCw size={11} />
              {confirmDisconnect ? 'Tap again to confirm disconnect' : 'Disconnect'}
            </button>
          </div>
        </div>
      )}

      {/* ── Payment Methods (connected state only) ── */}
      {status === 'connected' && (
        <div
          className="rounded-3xl p-6 backdrop-blur-2xl space-y-4"
          style={{
            background: '#0c0c14 padding-box, linear-gradient(160deg, rgba(245,158,11,0.38) 0%, rgba(236,72,153,0.31) 50%, rgba(59,130,246,0.38) 100%) border-box',
            border: '1.5px solid transparent',
          }}
        >
          <h3 className="text-base font-semibold text-white font-[Geist,sans-serif]">
            Payment Methods Accepted
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={15} className="text-white/50" />
                <span className="text-sm text-white/70 font-[Geist,sans-serif]">
                  Credit/Debit Cards
                </span>
              </div>
              <ToggleSwitch
                checked={paymentMethods.cards}
                onChange={(v) => setPaymentMethods((p) => ({ ...p, cards: v }))}
                gradient="linear-gradient(90deg, #F59E0B, #EC4899)"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={15} className="text-white/50" />
                <span className="text-sm text-white/70 font-[Geist,sans-serif]">Apple Pay</span>
              </div>
              <ToggleSwitch
                checked={paymentMethods.applePay}
                onChange={(v) => setPaymentMethods((p) => ({ ...p, applePay: v }))}
                gradient="linear-gradient(90deg, #3B82F6, #A855F7)"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 size={15} className="text-white/40" />
                <span className="text-sm text-white/40 font-[Geist,sans-serif]">Bank Transfer</span>
              </div>
              <ToggleSwitch
                checked={paymentMethods.bankTransfer}
                onChange={(v) => setPaymentMethods((p) => ({ ...p, bankTransfer: v }))}
                gradient="linear-gradient(90deg, #3B82F6, #A855F7)"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <p className="text-center text-xs text-white/25 font-[Geist,sans-serif]">
        Stripe takes 2.9% + $0.30 per transaction. View1 Sort takes 0%.
      </p>
    </div>
  )
}
