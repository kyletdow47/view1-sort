'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  Camera,
  CreditCard,
  Lock,
  Shield,
  Check,
} from 'lucide-react'

interface CheckoutPageProps {
  params: Promise<{ id: string }>
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = use(params)
  void id

  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const galleryFee = 2400
  const platformFeeRate = 0.07
  const platformFee = Math.round(galleryFee * platformFeeRate)
  const fullTotal = galleryFee + platformFee
  const depositAmount = Math.round(fullTotal / 2)
  const balanceDue = fullTotal - depositAmount

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      {/* ============================================================ */}
      {/*  TOP NAV                                                     */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#534439]/30 bg-[#151312]/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Camera size={15} className="text-[#4e2600]" />
          </div>
          <span className="font-headline font-black text-lg tracking-tighter text-[#ffb780]">
            View1 Sort
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {['Overview', 'Sorting', 'Selection', 'Delivery'].map((tab) => (
            <span
              key={tab}
              className="cursor-default px-3 py-1.5 text-sm font-medium text-[#a18d80]/50"
            >
              {tab}
            </span>
          ))}
        </nav>
        <div className="w-[120px]" />
      </header>

      {/* ============================================================ */}
      {/*  CONTENT                                                     */}
      {/* ============================================================ */}
      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Project header */}
        <div className="mb-8 text-center">
          <h1 className="font-headline text-2xl font-bold text-[#e7e1df]">Johnson Wedding</h1>
          <p className="mt-1 text-sm text-[#a18d80]">by Alex Rivera Photography</p>
        </div>

        {/* Payment type selector */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setPaymentType('full')}
            className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
              paymentType === 'full'
                ? 'border-[#ffb780] bg-[#ffb780]/10 text-[#ffb780]'
                : 'border-[#534439]/50 bg-[#1d1b1a] text-[#a18d80] hover:border-[#534439]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {paymentType === 'full' && <Check size={14} />}
              Full Payment
            </div>
          </button>
          <button
            onClick={() => setPaymentType('deposit')}
            className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
              paymentType === 'deposit'
                ? 'border-[#ffb780] bg-[#ffb780]/10 text-[#ffb780]'
                : 'border-[#534439]/50 bg-[#1d1b1a] text-[#a18d80] hover:border-[#534439]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {paymentType === 'deposit' && <Check size={14} />}
              Deposit (50%)
            </div>
          </button>
        </div>

        {/* Order summary card */}
        <div className="mb-6 rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
          <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-4">
            Order Summary
          </h2>
          <p className="text-sm text-[#d9c2b4] mb-4">
            Full access to the Johnson Wedding gallery — 428 curated photos with download rights and print licensing.
          </p>
          <div className="space-y-3 border-t border-[#534439]/30 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#a18d80]">Gallery Fee</span>
              <span className="text-[#e7e1df]">${galleryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#a18d80]">Platform Fee</span>
              <span className="text-[#e7e1df]">${platformFee}</span>
            </div>
            <div className="border-t border-[#534439]/30 pt-3">
              {paymentType === 'full' ? (
                <div className="flex justify-between text-base font-bold">
                  <span className="text-[#e7e1df]">Total</span>
                  <span className="text-[#ffb780]">${fullTotal.toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-[#e7e1df]">Deposit Due Now</span>
                    <span className="text-[#ffb780]">${depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-[#a18d80]">Balance due on delivery</span>
                    <span className="text-[#a18d80]">${balanceDue.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="mb-6 rounded-xl border border-[#534439]/40 bg-[#1d1b1a] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
              Payment Details
            </h2>
            <div className="flex items-center gap-1.5 text-[#a18d80]/60">
              <Shield size={12} />
              <span className="text-[10px]">Powered by Stripe</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Card number */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
                Card Number
              </label>
              <div className="relative">
                <CreditCard
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a18d80]/50"
                />
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="h-11 w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] pl-10 pr-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20"
                />
              </div>
            </div>

            {/* Expiry + CVC row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="h-11 w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] px-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="h-11 w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] px-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#d9c2b4]">
                Name on Card
              </label>
              <input
                type="text"
                placeholder="Sarah Johnson"
                className="h-11 w-full rounded-lg border border-[#534439]/50 bg-[#211f1e] px-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/50 focus:ring-1 focus:ring-[#ffb780]/20"
              />
            </div>
          </div>
        </div>

        {/* Terms checkbox */}
        <label className="mb-6 flex cursor-pointer items-start gap-3">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-4 w-4 rounded border border-[#534439] bg-[#211f1e] transition-colors peer-checked:border-[#ffb780] peer-checked:bg-[#ffb780]" />
            {termsAccepted && (
              <Check size={10} className="absolute inset-0 m-auto text-[#4e2600]" />
            )}
          </div>
          <span className="text-xs leading-relaxed text-[#a18d80]">
            I agree to the{' '}
            <Link href="#" className="text-[#ffb780] underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-[#ffb780] underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {/* Submit button */}
        <button
          disabled={!termsAccepted}
          className="w-full rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-3.5 font-headline font-bold text-[#4e2600] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Complete Payment{' '}
          {paymentType === 'full'
            ? `— $${fullTotal.toLocaleString()}`
            : `— $${depositAmount.toLocaleString()}`}
        </button>

        {/* Security notice */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[#a18d80]/60">
          <Lock size={12} />
          <span className="text-[11px]">256-bit encryption &middot; Your payment is secure</span>
        </div>
      </main>
    </div>
  )
}
