'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ComingSoonOverlayProps {
  feature: string
  description?: string
  children: ReactNode
}

/**
 * Wraps a page's existing content in a grayscale + blurred preview layer
 * with no interaction, and floats a centered "Coming soon" card with a
 * "Back to dashboard" escape button on top.
 */
export function ComingSoonOverlay({
  feature,
  description,
  children,
}: ComingSoonOverlayProps) {
  return (
    <div className="relative h-full min-h-0 w-full">
      {/* Preview layer — fully disabled, grayscale, blurred */}
      <div
        aria-hidden
        className="pointer-events-none select-none h-full w-full opacity-60 [filter:grayscale(1)_blur(4px)]"
      >
        {children}
      </div>

      {/* Centered card */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-violet-300">
            Coming soon
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">{feature}</h2>
          <p className="mb-6 text-sm text-white/60">
            {description ??
              "We're polishing this area. It'll unlock in a future update — no action required from you."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
