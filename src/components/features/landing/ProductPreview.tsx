'use client'

import { useState } from 'react'
import { AnimatedSection } from './animated-section'
import {
  Brain, Globe, CreditCard, BarChart3, ChevronRight,
  Check, Star, Download, MessageSquare, Zap,
} from 'lucide-react'

/* ── Shared glass styles ── */
const glass = [
  'relative rounded-[20px] overflow-hidden',
  'bg-gradient-to-b from-white/[0.10] to-white/[0.02]',
  'border border-white/[0.10]',
  'backdrop-blur-[32px]',
  'shadow-[0_8px_32px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.06)]',
].join(' ')

/* ── Mini badge pill ── */
function Pill({ children, color = 'violet' }: { children: React.ReactNode; color?: 'violet' | 'emerald' | 'amber' | 'blue' | 'pink' }) {
  const colors = {
    violet: 'bg-violet-400/10 border-violet-400/20 text-violet-400',
    emerald: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400',
    amber: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
    blue: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
    pink: 'bg-pink-400/10 border-pink-400/20 text-pink-400',
  }
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  )
}

/* ────────────────────────────────────────────────────
   MOCKUP 1 — AI Sort View
──────────────────────────────────────────────────── */
function AISortMockup() {
  const categories = [
    { label: 'Hero Shots', count: 24, color: 'from-violet-500 to-indigo-500', active: true },
    { label: 'Ceremony', count: 187, color: 'from-pink-500 to-rose-500', active: false },
    { label: 'Portraits', count: 92, color: 'from-blue-500 to-cyan-500', active: false },
    { label: 'Reception', count: 218, color: 'from-amber-500 to-orange-500', active: false },
    { label: 'Details', count: 56, color: 'from-emerald-500 to-teal-500', active: false },
    { label: 'Rejects', count: 31, color: 'from-white/20 to-white/10', active: false },
  ]

  const photos = [
    { w: 'col-span-2', h: 'h-24', opacity: '1', stars: 5 },
    { w: 'col-span-1', h: 'h-24', opacity: '0.8', stars: 4 },
    { w: 'col-span-1', h: 'h-24', opacity: '0.7', stars: 4 },
    { w: 'col-span-1', h: 'h-12', opacity: '0.6', stars: 3 },
    { w: 'col-span-1', h: 'h-12', opacity: '0.5', stars: 3 },
    { w: 'col-span-1', h: 'h-12', opacity: '0.4', stars: null },
  ]

  return (
    <div className="flex flex-col gap-4 h-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/30 mb-1">Golden Hour Beach Wedding · 847 photos</p>
          <div className="h-1.5 w-64 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />
          </div>
          <p className="text-[10px] text-white/25 mt-1">92% sorted · 12 min 4 sec</p>
        </div>
        <Pill color="emerald">Sort complete</Pill>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button
            key={cat.label}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${cat.active ? 'bg-white/[0.12] text-white border border-white/20' : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${cat.color}`} />
            {cat.label}
            <span className="text-white/30">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-1.5 flex-1">
        {photos.map((p, i) => (
          <div
            key={i}
            className={`${p.w} ${p.h} rounded-lg overflow-hidden relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.06]`}
            style={{ opacity: p.opacity }}
          >
            {/* Simulated photo content */}
            <div className="absolute inset-0" style={{
              background: i === 0
                ? 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(168,85,247,0.2) 100%)'
                : i === 1
                ? 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(236,72,153,0.2) 100%)'
                : `linear-gradient(135deg, rgba(${Math.floor(Math.random() * 100 + 100)},${Math.floor(Math.random() * 50 + 80)},200,0.2) 0%, rgba(80,80,${Math.floor(Math.random() * 100 + 100)},0.2) 100%)`
            }} />
            {p.stars && (
              <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5">
                {Array.from({ length: p.stars }).map((_, si) => (
                  <Star key={si} size={7} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
            )}
            {i === 0 && (
              <div className="absolute top-1.5 left-1.5">
                <span className="rounded-sm bg-violet-500/80 px-1 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">Hero</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <p className="text-[11px] text-white/30">24 selected for delivery</p>
        <div className="flex gap-2">
          <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-white/40 bg-white/[0.04] border border-white/[0.08]">Review</button>
          <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500">Send to Gallery →</button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────
   MOCKUP 2 — Client Gallery
──────────────────────────────────────────────────── */
function GalleryMockup() {
  const photos = [
    { span: 'col-span-2 row-span-2', gradient: 'from-amber-500/30 to-pink-500/20' },
    { span: 'col-span-1', gradient: 'from-blue-500/25 to-violet-500/20' },
    { span: 'col-span-1', gradient: 'from-violet-500/25 to-indigo-500/20' },
    { span: 'col-span-1', gradient: 'from-pink-500/25 to-rose-500/20' },
    { span: 'col-span-1', gradient: 'from-emerald-500/25 to-teal-500/20' },
    { span: 'col-span-1', gradient: 'from-amber-500/25 to-orange-500/20' },
    { span: 'col-span-1', gradient: 'from-cyan-500/25 to-blue-500/20' },
  ]

  return (
    <div className="flex flex-col gap-4 h-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Gallery header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Sarah & James — Beach Wedding</h4>
          <p className="text-[11px] text-white/30 mt-0.5">80 photos · Delivered by View1 Sort</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-white/50">
            <MessageSquare size={10} />
            Comment
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-1.5 text-[11px] font-medium text-white">
            <Download size={10} />
            Download All
          </button>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 flex-1">
        {photos.map((p, i) => (
          <div
            key={i}
            className={`${p.span} rounded-lg overflow-hidden relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.06] group cursor-pointer`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
              <div className="rounded-full bg-white/10 border border-white/20 p-1.5">
                <Check size={12} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client watermark bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-indigo-500 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">V1</span>
          </div>
          <p className="text-[10px] text-white/20">gallery.view1sort.com/sarah-james-2026</p>
        </div>
        <Pill color="emerald">Watermark protected</Pill>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────
   MOCKUP 3 — Invoicing
──────────────────────────────────────────────────── */
function InvoiceMockup() {
  return (
    <div className="flex flex-col gap-4 h-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Invoice header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/30">Invoice #1042</p>
          <h4 className="text-sm font-semibold text-white mt-0.5">Sarah & James Wedding</h4>
        </div>
        <Pill color="emerald">Paid</Pill>
      </div>

      {/* Line items */}
      <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-2.5`}>
        {[
          { item: 'Full Day Coverage (8h)', amount: '$2,800' },
          { item: 'Second Shooter', amount: '$600' },
          { item: 'Digital Gallery Delivery', amount: '$0' },
          { item: 'Print Rights License', amount: '$250' },
        ].map(li => (
          <div key={li.item} className="flex items-center justify-between">
            <p className="text-[12px] text-white/50">{li.item}</p>
            <p className="text-[12px] font-medium text-white/70">{li.amount}</p>
          </div>
        ))}
        <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Total</p>
          <p className="text-[13px] font-bold text-white">$3,650</p>
        </div>
      </div>

      {/* Payment timeline */}
      <div className="space-y-2.5">
        {[
          { label: 'Contract signed', date: 'Mar 15', done: true },
          { label: '50% deposit received', date: 'Mar 15', done: true },
          { label: 'Gallery delivered', date: 'Apr 2', done: true },
          { label: 'Final payment received', date: 'Apr 3', done: true },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
              {step.done && <Check size={8} className="text-emerald-400" />}
            </div>
            <p className={`text-[11px] flex-1 ${step.done ? 'text-white/60' : 'text-white/25'}`}>{step.label}</p>
            <p className="text-[10px] text-white/25">{step.date}</p>
          </div>
        ))}
      </div>

      {/* Stripe badge */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <div className="h-5 w-8 rounded bg-[#635BFF] flex items-center justify-center">
          <span className="text-[7px] font-bold text-white tracking-tight">stripe</span>
        </div>
        <p className="text-[10px] text-white/25">Payments powered by Stripe · Instant payout</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────
   MOCKUP 4 — Analytics
──────────────────────────────────────────────────── */
function AnalyticsMockup() {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
  const values = [38, 52, 61, 45, 74, 88, 96]
  const maxVal = Math.max(...values)

  return (
    <div className="flex flex-col gap-4 h-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Revenue MTD', value: '$8,400', change: '+23%', up: true },
          { label: 'Active Clients', value: '14', change: '+4', up: true },
          { label: 'Avg Gallery Views', value: '312', change: '+18%', up: true },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
            <p className="text-[10px] text-white/30 mb-1">{stat.label}</p>
            <p className="text-base font-bold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{stat.value}</p>
            <p className={`text-[10px] mt-0.5 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
        <div className="flex items-end justify-between h-full gap-2 pb-4">
          {months.map((m, i) => (
            <div key={m} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="relative w-full rounded-t-md overflow-hidden" style={{ height: `${(values[i] / maxVal) * 80}px` }}>
                <div
                  className="absolute inset-0 rounded-t-md"
                  style={{
                    background: i === months.length - 1
                      ? 'linear-gradient(to top, rgba(99,91,255,0.8), rgba(168,85,247,0.6))'
                      : 'linear-gradient(to top, rgba(255,255,255,0.08), rgba(255,255,255,0.04))'
                  }}
                />
              </div>
              <p className="text-[9px] text-white/25">{m}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick insights */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { icon: Zap, text: 'Wedding shoots generate 2.4× more revenue per session', color: 'text-amber-400' },
        ].map(ins => (
          <div key={ins.text} className="flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/[0.07] px-3 py-2">
            <ins.icon size={12} className={`${ins.color} shrink-0 mt-0.5`} />
            <p className="text-[10px] text-white/40 leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────
   Feature card definition
──────────────────────────────────────────────────── */
const FEATURE_CARDS = [
  {
    id: 'sort',
    icon: Brain,
    iconColor: 'text-violet-400',
    label: 'AI Sort',
    headline: 'A shoot sorted in under 12 minutes',
    desc: 'Describe the shoot and the AI does the rest — sorted by story, not just sharpness.',
    Mockup: AISortMockup,
  },
  {
    id: 'gallery',
    icon: Globe,
    iconColor: 'text-blue-400',
    label: 'Client Gallery',
    headline: 'Delivery that feels effortless for clients',
    desc: 'One magic link. Works on any device. No account required. Comments on every photo.',
    Mockup: GalleryMockup,
  },
  {
    id: 'invoice',
    icon: CreditCard,
    iconColor: 'text-emerald-400',
    label: 'Invoicing',
    headline: 'Get paid before you leave the venue',
    desc: 'Stripe-powered invoicing, auto-triggered after gallery delivery. No chasing payments.',
    Mockup: InvoiceMockup,
  },
  {
    id: 'analytics',
    icon: BarChart3,
    iconColor: 'text-amber-400',
    label: 'Analytics',
    headline: 'Know your business at a glance',
    desc: 'Revenue by month, client retention, gallery engagement — tied to real Stripe data.',
    Mockup: AnalyticsMockup,
  },
]

/* ────────────────────────────────────────────────────
   Main exported component
──────────────────────────────────────────────────── */
export function ProductPreview() {
  const [active, setActive] = useState<string>('sort')
  const activeCard = FEATURE_CARDS.find(c => c.id === active)!

  return (
    <section id="features" className="py-24 px-6 relative z-10 bg-[#07070f]">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
            Product
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>
            See how it works.
          </h2>
          <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">
            Four views. One workflow. Everything you need from the shoot to the final payment.
          </p>
        </AnimatedSection>

        <AnimatedSection variant="float-in">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">

            {/* ── Left: Feature selector ── */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {FEATURE_CARDS.map(card => {
                const isActive = active === card.id
                return (
                  <button
                    key={card.id}
                    onClick={() => setActive(card.id)}
                    className={`flex-shrink-0 flex items-start gap-3 rounded-2xl p-4 text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-white/[0.10] to-white/[0.02] border border-white/[0.14] shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                        : 'border border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
                      <card.icon size={18} className={isActive ? card.iconColor : 'text-white/30'} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-white/35'}`} style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                        {card.label}
                      </p>
                      <p className={`text-[11px] leading-snug mt-0.5 hidden lg:block transition-colors ${isActive ? 'text-white/40' : 'text-white/20'}`}>
                        {card.desc}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="shrink-0 text-white/30 mt-1 hidden lg:block" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Right: Mockup panel ── */}
            <div
              className={`relative rounded-[24px] overflow-hidden p-[1px]`}
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(59,130,246,0.2) 25%, rgba(168,85,247,0.2) 50%, rgba(236,72,153,0.2) 75%, rgba(245,158,11,0.25) 100%)' }}
            >
              <div className={`relative rounded-[23px] overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[32px] shadow-[0_8px_48px_rgba(0,0,0,0.5)] p-6`}>
                {/* Top highlight line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Panel header */}
                <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-white/[0.08]">
                  {/* macOS-style dots */}
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] border border-white/[0.07] px-3 py-1">
                      <div className="h-2 w-2 rounded-full bg-indigo-400" />
                      <span className="text-[10px] text-white/30">app.view1sort.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <activeCard.icon size={13} className={activeCard.iconColor} />
                    <span className="text-[11px] font-medium text-white/40" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{activeCard.label}</span>
                  </div>
                </div>

                {/* Mockup content — fixed height so panel doesn't jump */}
                <div className="h-[340px] sm:h-[380px]">
                  <activeCard.Mockup />
                </div>
              </div>
            </div>

          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
