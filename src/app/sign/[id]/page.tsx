'use client'

import { useState } from 'react'
import { CheckCircle2, PenLine, ChevronDown, ChevronUp } from 'lucide-react'

/* ─── Mock contract data ─────────────────────────────────────────────────── */

const CONTRACT = {
  title: 'Photography Services Agreement',
  parties: 'Between Kyle Dow Photography and Sarah & Tom Smith',
  photographerName: 'Kyle Dow',
  photographerSigned: true,
  sections: [
    {
      heading: '1. Services',
      body: 'Photographer will provide full-day wedding photography coverage (8 hours) for the event on June 14, 2026. Coverage includes two photographers and delivery of 800+ fully edited digital images via an online gallery.',
    },
    {
      heading: '2. Payment',
      body: 'Total fee: $3,200. A 50% retainer of $1,600 is due upon signing. The remaining balance is due 14 days before the event date. All payments are non-refundable.',
    },
    {
      heading: '3. Deliverables',
      body: 'Photographer will deliver the completed online gallery within 6 weeks of the event date. Client will receive full-resolution digital files with a perpetual personal-use license.',
    },
    {
      heading: '4. Cancellation Policy',
      body: 'Cancellations made fewer than 30 days before the event forfeit the retainer. Cancellations made more than 30 days in advance may receive a credit toward a future booking.',
    },
    {
      heading: '5. Copyright',
      body: 'Photographer retains copyright of all images. Client receives a personal-use license. Commercial usage requires a separate written agreement.',
    },
  ],
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function SignContractPage() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [signed, setSigned] = useState(false)
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)

  const canSign = agreed && name.trim().length > 1

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background: 'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
      }}
    >
      {/* Radial highlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 10%, rgba(255,255,255,0.07) 0%, transparent 100%)' }}
      />

      {/* Nav */}
      <div className="relative z-10 flex h-14 items-center justify-between border-b border-white/[0.09] bg-white/[0.04] px-6 backdrop-blur-sm">
        <span className="font-headline text-[15px] font-bold text-white">Kyle Dow Photography</span>
        <span className="text-sm text-white/50">Contract Signing</span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
        {/* Header card */}
        <div
          className="mb-6 rounded-3xl p-6 backdrop-blur-[32px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          }}
        >
          <h1 className="font-headline text-xl font-bold text-white">{CONTRACT.title}</h1>
          <p className="mt-1 text-sm text-white/60">{CONTRACT.parties}</p>
          <div className="mt-4 h-px bg-gradient-to-r from-indigo-400/50 via-violet-400/50 to-transparent" />
        </div>

        {/* Contract sections */}
        <div className="mb-6 space-y-2">
          {CONTRACT.sections.map((sec, i) => (
            <div
              key={i}
              className="rounded-2xl backdrop-blur-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left"
              >
                <span className="text-sm font-semibold text-white">{sec.heading}</span>
                {expanded === i
                  ? <ChevronUp className="h-4 w-4 text-white/40" />
                  : <ChevronDown className="h-4 w-4 text-white/40" />
                }
              </button>
              {expanded === i && (
                <div className="border-t border-white/[0.08] px-5 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-white/70">{sec.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Signatures */}
        <div
          className="mb-6 rounded-3xl p-6 backdrop-blur-[32px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <h2 className="mb-4 text-sm font-semibold text-white/80">Signatures</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Photographer signature */}
            <div className="rounded-xl border border-white/[0.1] bg-white/[0.05] p-4">
              <p className="mb-1 text-xs text-white/40">Photographer</p>
              <p className="font-headline text-lg italic text-white">{CONTRACT.photographerName}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">Signed</span>
              </div>
            </div>

            {/* Client signature */}
            <div className={`rounded-xl border p-4 transition-colors ${
              signed ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-white/[0.1] bg-white/[0.05]'
            }`}>
              <p className="mb-1 text-xs text-white/40">Client</p>
              {signed ? (
                <>
                  <p className="font-headline text-lg italic text-white">{name}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Signed</span>
                  </div>
                </>
              ) : (
                <>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Type your full name"
                    className="w-full bg-transparent font-headline text-lg italic text-white placeholder-white/20 outline-none"
                  />
                  <p className="mt-2 text-xs text-white/30">Sign here</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Agreement + CTA */}
        {!signed && (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  agreed ? 'border-indigo-400 bg-indigo-500' : 'border-white/30 bg-white/[0.05]'
                }`}
              >
                {agreed && <CheckCircle2 className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm text-white/60">
                I have read and agree to the Photography Services Agreement and understand all terms and conditions.
              </span>
            </label>

            <button
              onClick={() => { if (canSign) setSigned(true) }}
              disabled={!canSign}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSign
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)'
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              <PenLine className="h-4 w-4" />
              Sign Contract
            </button>
          </div>
        )}

        {signed && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
            <p className="font-semibold text-white">Contract signed successfully</p>
            <p className="mt-1 text-sm text-white/50">A copy has been sent to your email address.</p>
          </div>
        )}
      </div>
    </div>
  )
}
