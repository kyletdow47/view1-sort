'use client'

import { CheckCircle2, Download, ExternalLink } from 'lucide-react'
import type { DownloadLink } from '@/types/checkout'
import type { PhotographerBrand } from '@/types/client-portal'

interface CheckoutSuccessProps {
  paymentIntentId: string
  galleryName: string
  brand: PhotographerBrand
  downloadLinks: DownloadLink[]
}

export function CheckoutSuccess({
  paymentIntentId,
  galleryName,
  brand,
  downloadLinks,
}: CheckoutSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[26px] font-bold text-white">
          Payment successful!
        </h2>
        <p className="text-[14px] text-white/50">
          Thank you for your purchase. Your files are ready to download.
        </p>
        <p className="font-mono text-[11px] text-white/25">
          Order ID: {paymentIntentId}
        </p>
      </div>

      {/* Gallery name */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-4">
        <p className="text-[11px] uppercase tracking-wider text-white/35">Gallery</p>
        <p className="mt-1 text-[16px] font-semibold text-white/90">{galleryName}</p>
      </div>

      {/* Download links */}
      {downloadLinks.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-3">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Your Downloads
          </h3>
          {downloadLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5749F4]/20">
                  <Download className="h-4 w-4 text-[#5749F4]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white/90">
                    {link.label}
                  </p>
                  <p className="text-[11px] text-white/35">
                    Expires {link.expiresAt}
                  </p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/30" />
            </a>
          ))}
        </div>
      )}

      {/* No downloads yet (async) */}
      {downloadLinks.length === 0 && (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
          <p className="text-[13px] text-white/50">
            Your download link will be emailed to you shortly.
          </p>
          <p className="mt-1 text-[11px] text-white/30">
            {/* TODO: trigger email via Resend after payment confirmation */}
            Usually takes less than a minute.
          </p>
        </div>
      )}

      {/* Contact photographer */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[12px] text-white/35">
          Questions? Contact {brand.name}
        </p>
        {brand.contactEmail && (
          <a
            href={`mailto:${brand.contactEmail}`}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/[0.10]"
          >
            {brand.contactEmail}
          </a>
        )}
      </div>
    </div>
  )
}
