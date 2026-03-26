'use client'

import { CreditCard, ExternalLink, DollarSign, AlertCircle } from 'lucide-react'

export default function StripeConnectPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent" />
          Stripe Connect
        </h1>
        <p className="text-muted-foreground mt-1">Connect your Stripe account to receive client payments</p>
      </div>

      {/* Connection Status */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Connection Status</h2>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-view1-border">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Not Connected</p>
            <p className="text-xs text-muted-foreground">You haven&apos;t connected a Stripe account yet</p>
          </div>
        </div>

        <button
          disabled
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent/10 text-accent text-sm font-medium opacity-60 cursor-not-allowed"
        >
          <ExternalLink className="w-4 h-4" />
          Connect Stripe Account
        </button>
      </section>

      {/* Payout Info */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          Payout Information
        </h2>

        <div className="space-y-3">
          {['Bank Account', 'Payout Schedule', 'Total Earned', 'Pending Balance'].map((label) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-view1-border last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm text-muted-foreground/50">--</span>
            </div>
          ))}
        </div>
      </section>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">How it works</p>
          <p className="mt-1">
            When a client purchases photos from your gallery, the payment goes through Stripe.
            Your earnings (minus platform fees) are deposited directly into your connected bank account.
          </p>
        </div>
      </div>
    </div>
  )
}
