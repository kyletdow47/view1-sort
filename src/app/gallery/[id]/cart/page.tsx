'use client'

import { useState } from 'react'
import {
  ShoppingCart,
  ArrowLeft,
  ImageIcon,
  X,
  Tag,
  Lock,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

interface CartItem {
  id: string
  filename: string
  dimensions: string
}

const initialItems: CartItem[] = [
  { id: 'img-001', filename: 'IMG_4201.jpg', dimensions: '6000 x 4000' },
  { id: 'img-002', filename: 'IMG_4215.jpg', dimensions: '6000 x 4000' },
  { id: 'img-003', filename: 'IMG_4220.jpg', dimensions: '6000 x 4000' },
  { id: 'img-004', filename: 'IMG_4233.jpg', dimensions: '6000 x 4000' },
  { id: 'img-005', filename: 'IMG_4240.jpg', dimensions: '6000 x 4000' },
  { id: 'img-006', filename: 'IMG_4255.jpg', dimensions: '6000 x 4000' },
]

const PRICE_PER_FILE = 12
const PLATFORM_FEE_PCT = 0.05

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CartPage() {
  const params = useParams()
  const galleryId = params.id as string
  const [items, setItems] = useState(initialItems)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const subtotal = items.length * PRICE_PER_FILE
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT * 100) / 100
  const discount = promoApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0
  const total = subtotal + platformFee - discount

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setPromoApplied(true)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Back link */}
        <Link
          href={`/gallery/${galleryId}`}
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <ShoppingCart size={20} className="text-on-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">Your Selection</h1>
            <p className="text-sm text-on-surface-variant">{items.length} photos selected</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* ====== LEFT: Photo Grid ====== */}
          <div className="col-span-12 lg:col-span-8">
            {items.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-xl bg-surface border border-outline-variant/30 flex items-center justify-center overflow-hidden hover:border-outline-variant/60 transition-colors"
                  >
                    <ImageIcon size={24} className="text-[#534439]/40" />

                    {/* Filename overlay */}
                    <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-[10px] text-on-surface-variant truncate">{item.filename}</p>
                      <p className="text-[9px] text-on-surface-variant">{item.dimensions}</p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-on-surface/60 opacity-0 group-hover:opacity-100 hover:bg-[#e7765f]/80 hover:text-white transition-all"
                    >
                      <X size={12} />
                    </button>

                    {/* Price badge */}
                    <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-primary">
                      ${PRICE_PER_FILE}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface p-16 flex flex-col items-center gap-4">
                <ShoppingCart size={40} className="text-[#534439]/30" />
                <div className="text-center">
                  <p className="font-bold text-on-surface">Your cart is empty</p>
                  <p className="text-sm text-on-surface-variant mt-1">Go back to the gallery and select photos to purchase</p>
                </div>
                <Link
                  href={`/gallery/${galleryId}`}
                  className="rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-6 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
                >
                  Browse Gallery
                </Link>
              </div>
            )}
          </div>

          {/* ====== RIGHT: Order Summary ====== */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Summary card */}
            <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 space-y-5">
              <h2 className="font-bold text-lg text-on-surface">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">{items.length} photos x ${PRICE_PER_FILE}</span>
                  <span className="text-sm text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Platform fee (5%)</span>
                  <span className="text-sm text-on-surface">${platformFee.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-400">Promo discount (10%)</span>
                    <span className="text-sm text-emerald-400">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-on-surface">Total</span>
                  <span className="text-xl font-extrabold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Promo code */}
            <div className="rounded-2xl border border-outline-variant/30 bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-on-surface-variant" />
                <span className="text-sm font-medium text-on-surface">Promo Code</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface placeholder-[#a18d80]/50 outline-none border border-outline-variant/30 focus:border-primary/50"
                />
                <button
                  onClick={applyPromo}
                  className="rounded-lg bg-surface-container px-4 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant/30 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs text-emerald-400 mt-2">Code &ldquo;SAVE10&rdquo; applied - 10% off!</p>
              )}
            </div>

            {/* Checkout button */}
            <button
              disabled={items.length === 0}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
                items.length > 0
                  ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary hover:opacity-90 shadow-lg shadow-[#d48441]/20'
                  : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
              }`}
            >
              <CreditCard size={18} />
              Proceed to Checkout
            </button>

            {/* Security notice */}
            <div className="flex items-center justify-center gap-2 py-3">
              <Lock size={12} className="text-on-surface-variant/50" />
              <span className="text-[10px] text-on-surface-variant/50">Secure checkout powered by Stripe</span>
              <ShieldCheck size={12} className="text-on-surface-variant/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
