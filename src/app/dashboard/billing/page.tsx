'use client'

import { Check } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying it out',
    features: ['3 active projects', '5 GB storage', '3 gallery themes', 'Basic AI sorting'],
    current: true,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$39',
    period: '/month',
    description: 'For working photographers',
    features: ['Unlimited projects', '100 GB storage', 'All 4 gallery themes', 'Stripe Connect (7% fee)', 'Full-res downloads'],
    current: false,
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$79',
    period: '/month',
    description: 'For studios and agencies',
    features: ['Unlimited projects', '500 GB storage', 'All themes + custom', 'Stripe Connect (5% fee)', 'Priority support', 'Team members (up to 5)'],
    current: false,
    highlight: false,
  },
]

function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
  const percent = Math.min((current / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="text-white">{current} / {max}</span>
      </div>
      <div className="h-2 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="text-muted mt-1">Manage your subscription and payment settings</p>
      </div>

      {/* Current Plan */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Current Plan</h2>
            <p className="text-muted text-sm">Your current subscription</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">Free</div>
            <div className="text-sm text-muted">$0/month</div>
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <UsageBar label="Projects" current={4} max={3} />
          <UsageBar label="Storage (GB)" current={2} max={5} />
        </div>
        <button className="text-sm text-muted hover:text-white border border-view1-border rounded-lg px-4 py-2 hover:bg-white/5 transition-colors">
          Manage Subscription
        </button>
      </section>

      {/* Plan Selection */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 space-y-4 transition-colors ${
                plan.current
                  ? 'border-accent bg-accent/5'
                  : plan.highlight
                    ? 'border-accent/40 bg-surface hover:border-accent'
                    : 'border-view1-border bg-surface hover:border-accent/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  {plan.current && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">Current</span>
                  )}
                  {plan.highlight && !plan.current && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">Popular</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mt-1">
                  {plan.price}<span className="text-sm text-muted font-normal"> {plan.period}</span>
                </p>
                <p className="text-sm text-muted mt-1">{plan.description}</p>
              </div>
              <ul className="space-y-1.5 text-sm text-muted">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="text-accent shrink-0" size={14} />
                    {f}
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button className={`w-full rounded-lg px-4 py-2.5 font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-accent text-black hover:bg-green-300'
                    : 'border border-view1-border text-white hover:border-accent/50'
                }`}>
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stripe Connect */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Photographer Payouts</h2>
          <p className="text-muted text-sm mt-1">Connect your bank account to receive payments from clients.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span className="text-sm text-muted">Not set up yet</span>
        </div>
        <button className="text-sm text-white border border-view1-border rounded-lg px-4 py-2 hover:bg-white/5 hover:border-accent/50 transition-colors">
          Set Up Payouts
        </button>
      </section>
    </div>
  )
}
