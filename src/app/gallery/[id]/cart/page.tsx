'use client'

import { ShoppingCart, ArrowLeft, ImageIcon, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CartPage() {
  const params = useParams()
  const galleryId = params.id as string

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Phase 2 Banner */}
      <div className="px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
        Phase 2 -- This feature is planned for the next release
      </div>

      <Link
        href={`/gallery/${galleryId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-accent" />
          Your Cart
        </h1>
        <p className="text-muted-foreground mt-1">Review your selected photos before checkout</p>
      </div>

      {/* Selected Photos Grid */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Selected Photos</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-background border border-dashed border-view1-border flex items-center justify-center"
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
            </div>
          ))}
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No photos selected</p>
        </div>
      </section>

      {/* Price Summary */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-view1-border">
            <span className="text-sm text-muted-foreground">Photos (0)</span>
            <span className="text-sm text-muted-foreground/50">$0.00</span>
          </div>
          <div className="flex justify-between py-2 border-b border-view1-border">
            <span className="text-sm text-muted-foreground">Processing fee</span>
            <span className="text-sm text-muted-foreground/50">$0.00</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-sm font-semibold text-foreground">$0.00</span>
          </div>
        </div>
      </section>

      {/* Checkout Button */}
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent/20 text-accent font-semibold text-base opacity-50 cursor-not-allowed"
      >
        <CreditCard className="w-5 h-5" />
        Proceed to Checkout
      </button>
    </div>
  )
}
