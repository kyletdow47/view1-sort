'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart,
  ArrowLeft,
  ImageOff,
  X,
  Lock,
  ShieldCheck,
  CreditCard,
  Loader2,
} from 'lucide-react'
import type { Media, Project } from '@/types/supabase'

interface CartViewProps {
  project: Project
  media: Media[]
  projectId: string
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function CartView({ project, media, projectId }: CartViewProps) {
  const router = useRouter()
  const [items, setItems] = useState<Media[]>(media)
  const [email, setEmail] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const pricePerPhoto = project.per_photo_cents ?? 0
  const subtotalCents = items.length * pricePerPhoto

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) {
      setCheckoutError('Please enter a valid email address.')
      return
    }

    setIsCheckingOut(true)
    setCheckoutError(null)

    try {
      const res = await fetch(`/api/gallery/${projectId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          mediaIds: items.map((i) => i.id),
        }),
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? 'Failed to create checkout session.')
        return
      }

      router.push(data.url)
    } catch {
      setCheckoutError('Something went wrong. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Back link */}
        <Link
          href={`/gallery/${projectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#a18d80] hover:text-[#e7e1df] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <ShoppingCart size={20} className="text-[#4e2600]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#e7e1df]">Your Selection</h1>
            <p className="text-sm text-[#a18d80]">
              {items.length} {items.length === 1 ? 'photo' : 'photos'} · {project.name}
            </p>
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
                    className="group relative aspect-square rounded-xl bg-[#1d1b1a] border border-[#534439]/30 flex items-center justify-center overflow-hidden hover:border-[#534439]/60 transition-colors"
                  >
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url}
                        alt={item.filename}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ImageOff size={24} className="text-[#534439]/40" />
                    )}

                    {/* Filename overlay */}
                    <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-[10px] text-[#d9c2b4] truncate">{item.filename}</p>
                      {item.width && item.height && (
                        <p className="text-[9px] text-[#a18d80]">
                          {item.width} x {item.height}
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[#e7e1df]/60 opacity-0 group-hover:opacity-100 hover:bg-[#e7765f]/80 hover:text-white transition-all"
                      aria-label={`Remove ${item.filename}`}
                    >
                      <X size={12} />
                    </button>

                    {/* Price badge */}
                    {pricePerPhoto > 0 && (
                      <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-[#ffb780]">
                        {formatCurrency(pricePerPhoto, project.currency)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#534439]/30 bg-[#1d1b1a] p-16 flex flex-col items-center gap-4">
                <ShoppingCart size={40} className="text-[#534439]/30" />
                <div className="text-center">
                  <p className="font-bold text-[#e7e1df]">Your cart is empty</p>
                  <p className="text-sm text-[#a18d80] mt-1">
                    Go back to the gallery and select photos to purchase
                  </p>
                </div>
                <Link
                  href={`/gallery/${projectId}`}
                  className="rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-6 py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90"
                >
                  Browse Gallery
                </Link>
              </div>
            )}
          </div>

          {/* ====== RIGHT: Order Summary ====== */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Summary card */}
            <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6 space-y-5">
              <h2 className="font-bold text-lg text-[#e7e1df]">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a18d80]">
                    {items.length} {items.length === 1 ? 'photo' : 'photos'} ×{' '}
                    {formatCurrency(pricePerPhoto, project.currency)}
                  </span>
                  <span className="text-sm text-[#e7e1df]">
                    {formatCurrency(subtotalCents, project.currency)}
                  </span>
                </div>
                <div className="border-t border-[#534439]/30 pt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-[#e7e1df]">Subtotal</span>
                  <span className="text-xl font-extrabold text-[#ffb780]">
                    {formatCurrency(subtotalCents, project.currency)}
                  </span>
                </div>
                <p className="text-xs text-[#a18d80]/70">
                  Final total calculated at Stripe checkout.
                </p>
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#a18d80]">Email for receipt</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#534439]/30 bg-[#100e0d] px-4 py-3 text-sm text-[#e7e1df] placeholder-[#534439] outline-none focus:border-[#ffb780]/40"
              />
            </div>

            {checkoutError && (
              <p className="text-xs text-[#e7765f]">{checkoutError}</p>
            )}

            {/* Checkout button */}
            {items.length > 0 ? (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] hover:opacity-90 shadow-lg shadow-[#d48441]/20 transition-opacity disabled:opacity-50"
              >
                <CreditCard size={18} />
                {isCheckingOut ? 'Redirecting to Stripe...' : 'Proceed to Checkout'}
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold bg-[#2c2928] text-[#a18d80]/50 cursor-not-allowed"
              >
                <CreditCard size={18} />
                Proceed to Checkout
              </button>
            )}

            {/* Security notice */}
            <div className="flex items-center justify-center gap-2 py-3">
              <Lock size={12} className="text-[#a18d80]/50" />
              <span className="text-[10px] text-[#a18d80]/50">
                Secure checkout powered by Stripe
              </span>
              <ShieldCheck size={12} className="text-[#a18d80]/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
