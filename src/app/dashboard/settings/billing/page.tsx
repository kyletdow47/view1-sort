'use client'

import { useState } from 'react'
import {
  Check,
  X,
  ExternalLink,
  Zap,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { PLANS } from '@/lib/stripe/plans'
import type { PlanTier } from '@/lib/stripe/plans'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type ConnectStatus = 'connected' | 'not_connected' | 'onboarding' | 'error'
type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible'

interface BillingInvoice {
  id: string
  date: string
  amount: string
  status: InvoiceStatus
  pdfUrl: string | null
}

/* ─── Mock data ─────────────────────────────────────────────────────────────
 * TODO(stripe): Replace with real data fetched server-side from Stripe
 * and passed via Server Component → Client Component props pattern.
 * ─────────────────────────────────────────────────────────────────────────── */

const MOCK_PLAN: PlanTier = 'pro'
const MOCK_PROJECTS_USED: number = 2
const MOCK_STORAGE_USED_GB: number = 1.2
const MOCK_CONNECT_STATUS: ConnectStatus = 'connected'
const MOCK_CONNECT_EMAIL = 'sarah@studio.com'

const MOCK_INVOICES: BillingInvoice[] = [
  { id: 'INV-2026-003', date: 'Mar 1, 2026', amount: '$39.00', status: 'paid', pdfUrl: null },
  { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '$39.00', status: 'paid', pdfUrl: null },
  { id: 'INV-2026-001', date: 'Jan 1, 2026', amount: '$39.00', status: 'paid', pdfUrl: null },
]

/* ─── Plan feature matrix ───────────────────────────────────────────────────
 * Matches the PLANS config in src/lib/stripe/plans.ts
 * ─────────────────────────────────────────────────────────────────────────── */

interface FeatureRow {
  label: string
  free: string | boolean
  pro: string | boolean
  business: string | boolean
}

const FEATURES: FeatureRow[] = [
  { label: 'Projects',           free: '3 projects',  pro: 'Unlimited',  business: 'Unlimited' },
  { label: 'Storage',            free: '500 MB',      pro: '50 GB',      business: '500 GB' },
  { label: 'Gallery themes',     free: '3 themes',    pro: '4 themes',   business: '4 themes' },
  { label: 'Full-res downloads', free: false,          pro: true,         business: true },
  { label: 'Custom branding',    free: false,          pro: true,         business: true },
  { label: 'Watermark removal',  free: false,          pro: true,         business: true },
  { label: 'Team members',       free: '1 member',    pro: '1 member',   business: 'Unlimited' },
  { label: 'Priority support',   free: false,          pro: false,        business: true },
  { label: 'API access',         free: false,          pro: false,        business: true },
]

/* ─── Status badge styles ─────────────────────────────────────────────────── */

const INVOICE_STATUS_BADGE: Record<InvoiceStatus, string> = {
  paid:          'bg-emerald-400/10 text-emerald-400',
  open:          'bg-amber-400/10 text-amber-400',
  void:          'bg-white/10 text-white/40',
  uncollectible: 'bg-red-400/10 text-red-400',
}

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid:          'Paid',
  open:          'Open',
  void:          'Void',
  uncollectible: 'Failed',
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check size={14} className="text-emerald-400 mx-auto" aria-label="Included" />
  }
  if (value === false) {
    return <X size={14} className="text-white/25 mx-auto" aria-label="Not included" />
  }
  return <span className="text-white/70 text-xs font-medium">{value}</span>
}

function UsageMeter({
  label,
  used,
  total,
  unit,
  color,
}: {
  label: string
  used: number
  total: number | null
  unit: string
  color: string
}) {
  const pct = total !== null ? Math.min((used / total) * 100, 100) : 0
  const usedLabel = used % 1 === 0 ? `${used}` : used.toFixed(1)
  const totalLabel = total !== null ? (total % 1 === 0 ? `${total}` : total.toFixed(0)) : '∞'

  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
      <p className="text-xs text-white/40 font-[Inter,sans-serif]">{label}</p>
      <p className="text-base font-semibold font-[Geist,sans-serif] text-white mt-0.5">
        {usedLabel} {unit}
        <span className="text-white/40 font-normal"> / {totalLabel} {total !== null ? unit : ''}</span>
      </p>
      <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
        {/* dynamic width requires inline style — no Tailwind equivalent for runtime percentages */}
        <div
          className={`h-1 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────────────
 *
 * Pencil reference: frame 9QzY0 "Dashboard — Billing"
 * Route: /dashboard/settings/billing
 * Settings layout wraps content in max-w-2xl automatically.
 * ─────────────────────────────────────────────────────────────────────────── */

export default function SettingsBillingPage() {
  // TODO(db): fetch currentTier from profile.tier via useAuth or server props
  const currentTier: PlanTier = MOCK_PLAN
  const connectStatus: ConnectStatus = MOCK_CONNECT_STATUS
  const connectEmail: string = MOCK_CONNECT_EMAIL
  const invoices: BillingInvoice[] = MOCK_INVOICES

  const currentPlan = PLANS[currentTier]

  const [upgradingTo, setUpgradingTo] = useState<PlanTier | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [portalError, setPortalError] = useState(false)

  /* Upgrade → Stripe Checkout */
  async function handleUpgrade(tier: PlanTier) {
    if (tier === currentTier || upgradingTo) return
    setUpgradingTo(tier)
    try {
      // TODO(stripe): POST /api/billing/checkout with { tier } → Stripe Checkout session
      await new Promise<void>((resolve) => setTimeout(resolve, 1200))
    } finally {
      setUpgradingTo(null)
    }
  }

  /* Manage billing → Stripe Customer Portal */
  async function handleManageBilling() {
    if (openingPortal) return
    setOpeningPortal(true)
    setPortalError(false)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Portal request failed')
      const data = await res.json() as { url?: string; error?: string }
      if (!data.url) throw new Error('No portal URL returned')
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setPortalError(true)
      setTimeout(() => setPortalError(false), 3000)
    } finally {
      setOpeningPortal(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-[Geist,sans-serif] text-white">
            Billing &amp; Plan
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
            Manage your subscription and payment details.
          </p>
        </div>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors flex-shrink-0 mt-1"
        >
          <ExternalLink size={12} />
          Stripe Dashboard
        </a>
      </div>

      {/* ── Current Plan Card ──────────────────────────────────────────────── */}
      <section className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium font-[Inter,sans-serif]">
              Current plan
            </p>
            <p className="text-2xl font-bold font-[Geist,sans-serif] text-white mt-1">
              {currentPlan.name}
            </p>
            <p className="text-sm text-white/50 mt-0.5">
              {currentPlan.priceMonthly !== null
                ? `$${(currentPlan.priceMonthly / 100).toFixed(0)}/month · renews automatically`
                : 'Free forever'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <button
              onClick={handleManageBilling}
              disabled={openingPortal || currentTier === 'free'}
              className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {openingPortal && <Loader2 size={13} className="animate-spin" />}
              Manage Billing
            </button>
            {portalError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={11} />
                Could not open portal
              </p>
            )}
          </div>
        </div>

        {/* Usage meters — matching Pencil stat-card style */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <UsageMeter
            label="Projects used"
            used={MOCK_PROJECTS_USED}
            total={currentPlan.limits.maxProjects}
            unit={MOCK_PROJECTS_USED === 1 ? 'project' : 'projects'}
            color="bg-indigo-500"
          />
          <UsageMeter
            label="Storage used"
            used={MOCK_STORAGE_USED_GB}
            total={
              currentPlan.limits.storageBytes >= 1073741824
                ? currentPlan.limits.storageBytes / 1073741824
                : currentPlan.limits.storageBytes / 1048576
            }
            unit={currentPlan.limits.storageBytes >= 1073741824 ? 'GB' : 'MB'}
            color="bg-emerald-500"
          />
        </div>
      </section>

      {/* ── Plan Comparison Table ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3 font-[Inter,sans-serif]">
          Available Plans
        </h2>

        <div className="rounded-xl border border-white/[0.08] overflow-hidden">

          {/* Plan column headers */}
          <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/[0.08]">
            <div className="p-4" />
            {(['free', 'pro', 'business'] as const).map((tier) => {
              const plan = PLANS[tier]
              const isCurrent = tier === currentTier
              return (
                <div
                  key={tier}
                  className={`p-4 text-center border-l border-white/[0.06] ${isCurrent ? 'bg-indigo-500/10' : ''}`}
                >
                  {isCurrent && (
                    <span className="inline-block text-[10px] font-semibold text-indigo-300 bg-indigo-400/10 rounded-full px-2 py-0.5 mb-1.5">
                      Current
                    </span>
                  )}
                  <p className="text-sm font-bold font-[Geist,sans-serif] text-white">
                    {plan.name}
                  </p>
                  <p className="text-xs text-white/45 mt-0.5 font-[Inter,sans-serif]">
                    {plan.priceMonthly !== null
                      ? `$${(plan.priceMonthly / 100).toFixed(0)}/mo`
                      : 'Free'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Feature rows */}
          {FEATURES.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-4 border-t border-white/[0.05] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
            >
              <div className="px-4 py-3 text-xs text-white/55 font-[Inter,sans-serif]">
                {row.label}
              </div>
              {(['free', 'pro', 'business'] as const).map((tier) => (
                <div
                  key={tier}
                  className={`px-4 py-3 flex items-center justify-center border-l border-white/[0.05] ${tier === currentTier ? 'bg-indigo-500/5' : ''}`}
                >
                  <FeatureCell value={row[tier]} />
                </div>
              ))}
            </div>
          ))}

          {/* Upgrade action row */}
          <div className="grid grid-cols-4 border-t border-white/[0.08] bg-white/[0.02]">
            <div className="p-4" />
            {(['free', 'pro', 'business'] as const).map((tier) => {
              const isCurrent = tier === currentTier
              const isDowngrade = tier === 'free' && currentTier !== 'free'
              const isUpLoading = upgradingTo === tier

              return (
                <div
                  key={tier}
                  className={`p-3 border-l border-white/[0.06] ${isCurrent ? 'bg-indigo-500/5' : ''}`}
                >
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 font-semibold py-1.5">
                      <Check size={12} />
                      Active
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tier)}
                      disabled={!!upgradingTo}
                      className={[
                        'w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                        isDowngrade
                          ? 'bg-white/[0.04] border border-white/[0.08] text-white/45 hover:text-white/65 hover:bg-white/[0.06]'
                          : tier === 'business'
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25',
                      ].join(' ')}
                    >
                      {isUpLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : isDowngrade ? (
                        'Downgrade'
                      ) : (
                        <>
                          {tier === 'business' ? (
                            <Building2 size={11} />
                          ) : (
                            <Zap size={11} />
                          )}
                          Upgrade
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stripe Connect Status ──────────────────────────────────────────── */}
      {/* Matches Pencil node XCU7W — Stripe Connect banner */}
      <section className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-5">
        <div className="flex items-center gap-3">
          {/* Stripe "S" logomark — matches Pencil l6OS2 fill #635BFF */}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#635BFF]">
            <span className="text-white font-bold text-base font-[Geist,sans-serif] leading-none">
              S
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white font-[Geist,sans-serif]">
              Stripe Connect
            </p>
            {connectStatus === 'connected' && (
              <p className="text-xs text-emerald-400 mt-0.5">
                Connected · Payouts enabled · {connectEmail}
              </p>
            )}
            {connectStatus === 'onboarding' && (
              <p className="text-xs text-amber-400 mt-0.5">
                Onboarding in progress — complete setup to enable payouts
              </p>
            )}
            {connectStatus === 'error' && (
              <p className="text-xs text-red-400 mt-0.5">
                Connection error — please reconnect your account
              </p>
            )}
            {connectStatus === 'not_connected' && (
              <p className="text-xs text-white/40 mt-0.5">
                Not connected — required to accept client payments
              </p>
            )}
          </div>

          {connectStatus !== 'connected' && (
            <a
              href="/dashboard/settings/connect"
              className="flex-shrink-0 rounded-lg bg-[#635BFF]/15 border border-[#635BFF]/25 px-3 py-1.5 text-xs font-semibold text-[#9B94FF] hover:bg-[#635BFF]/25 transition-colors"
            >
              {connectStatus === 'onboarding' ? 'Continue Setup' : 'Connect Stripe'}
            </a>
          )}
        </div>
      </section>

      {/* ── Billing History ───────────────────────────────────────────────── */}
      {/* Matches Pencil transactions table Wo7pX */}
      <section>
        <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3 font-[Inter,sans-serif]">
          Billing History
        </h2>

        {invoices.length === 0 ? (
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-8 text-center">
            <p className="text-sm text-white/35">No invoices yet.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wide font-[Inter,sans-serif]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wide font-[Inter,sans-serif]">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wide font-[Inter,sans-serif]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wide font-[Inter,sans-serif]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-white/40 uppercase tracking-wide font-[Inter,sans-serif]">
                    PDF
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`border-t border-white/[0.04] ${i % 2 !== 0 ? 'bg-white/[0.01]' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-white/70 font-[Inter,sans-serif]">
                      {inv.date}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 font-[Geist,sans-serif]">
                      {inv.id}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white font-[Geist,sans-serif]">
                      {inv.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${INVOICE_STATUS_BADGE[inv.status]}`}
                      >
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.pdfUrl !== null ? (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
