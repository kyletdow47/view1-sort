'use client'

import { ImageIcon } from 'lucide-react'
import type { CheckoutOrder, CheckoutPackage, CheckoutPhotoItem } from '@/types/checkout'

interface OrderSummaryProps {
  order: CheckoutOrder
  packages: CheckoutPackage[]
  photos: CheckoutPhotoItem[]
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function OrderSummary({ order, packages, photos }: OrderSummaryProps) {
  const selectedPackage = packages.find((p) => p.id === order.selectedPackageId) ?? null
  const selectedPhotos = photos.filter((p) => order.selectedPhotoIds.includes(p.id))

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 backdrop-blur-md">
      <h3 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-white/40">
        Order Summary
      </h3>

      {/* Gallery name */}
      <div className="mb-4 rounded-xl bg-white/[0.05] px-4 py-3">
        <p className="text-[11px] text-white/35">Gallery</p>
        <p className="mt-0.5 text-[14px] font-semibold text-white/90">
          {order.galleryName}
        </p>
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-2">
        {/* Package line */}
        {selectedPackage && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white/80">
                {selectedPackage.name}
              </p>
              <p className="text-[11px] text-white/35">{selectedPackage.description}</p>
            </div>
            <span className="font-mono text-[13px] font-semibold text-white/70 shrink-0">
              {selectedPackage.priceLabel}
            </span>
          </div>
        )}

        {/* Individual photos */}
        {selectedPhotos.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-white/80">
                Individual Photos ({selectedPhotos.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPhotos.slice(0, 6).map((photo) => (
                <div
                  key={photo.id}
                  className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/[0.06]"
                >
                  {photo.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-white/20" />
                    </div>
                  )}
                </div>
              ))}
              {selectedPhotos.length > 6 && (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] font-medium text-white/40">
                  +{selectedPhotos.length - 6}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedPackage && selectedPhotos.length === 0 && (
          <p className="text-[13px] text-white/30 italic">
            No items selected yet
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-white/10" />

      {/* Totals */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-white/45">Subtotal</span>
          <span className="font-mono text-[12px] text-white/60">
            {formatCents(order.subtotal)}
          </span>
        </div>
        {order.tax > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/45">Tax</span>
            <span className="font-mono text-[12px] text-white/60">
              {formatCents(order.tax)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-white/90">Total</span>
          <span className="font-mono text-[18px] font-bold text-white">
            {formatCents(order.total)}
          </span>
        </div>
      </div>

      {/* Secure badge */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-white/25">
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secured by Stripe
      </div>
    </div>
  )
}
