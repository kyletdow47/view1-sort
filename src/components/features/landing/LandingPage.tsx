'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatedSection } from './animated-section'
import { AnimatedCounter } from './animated-counter'
import { TextColor } from '@/components/ui/text-color'
import { ScrollHero } from './ScrollHero'
import { ScrollHowItWorks } from './ScrollHowItWorks'
import { WaitlistForm } from './WaitlistForm'
import { ProductPreview } from './ProductPreview'
import {
  Brain, Camera, FolderOpen, Zap, Check, ChevronDown,
  CreditCard, BarChart3, Globe, MessageSquare, Download,
  Heart, FileText, Smartphone, Bell, Menu, X,
} from 'lucide-react'

/* Normal glass card — subtle white/glass border like dashboard interior cards */
const glass = [
  'relative rounded-[20px] overflow-hidden',
  'bg-gradient-to-b from-white/[0.10] to-white/[0.02]',
  'border border-white/[0.10]',
  'backdrop-blur-[32px]',
  'shadow-[0_8px_32px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.06)]',
].join(' ')

const glassHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none'

const glassHover = 'transition-all hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.1)]'

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
      {children}
    </span>
  )
}

/* ── FAQ ── */
const FAQS = [
  { q: 'How is View1 Sort different from Lightroom AI or Imagen?', a: 'Lightroom and Imagen sort by technical quality — sharpness, exposure, blink detection. View1 Sort understands the narrative arc of your shoot.' },
  { q: 'Does it replace Lightroom?', a: 'No — it works alongside it. After AI sorting, you export to Lightroom for editing. When you reopen View1, the edited files auto-sync back.' },
  { q: 'Can my clients use it without creating an account?', a: 'Yes. Clients receive a magic link via email and can view the gallery immediately — no account needed.' },
  { q: 'What does it cost?', a: 'We\'re in early access. Waitlist members get founding member pricing locked in forever — and first access.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="divide-y divide-white/10">
      {FAQS.map((faq, i) => (
        <div key={i} className="py-5">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 text-left">
            <span className="font-medium text-white/90">{faq.q}</span>
            <ChevronDown size={16} className={`shrink-0 text-white/30 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <p className="mt-3 text-sm leading-relaxed text-white/50">{faq.a}</p>}
        </div>
      ))}
    </div>
  )
}

/* ── Platform feature tabs — micro-UI previews ── */

/* No container — elements float directly on the card glass */
function MicroEmbed({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 pt-4 border-t border-white/[0.07]">
      {children}
    </div>
  )
}

/* AI Sorting — 1: Preset tabs */
function PreviewAIProfiles() {
  const presets = ['Wedding', 'Real Estate', 'Commercial', 'Portrait', 'Event']
  return (
    <div className="w-full space-y-2.5">
      <p className="text-[11px] text-white/50 uppercase tracking-widest">Sorting Preset</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {presets.map((p, i) => (
          <span key={p} className={`text-[14px] font-semibold ${i === 0 ? 'text-violet-300' : 'text-white/40'}`}>{p}</span>
        ))}
      </div>
    </div>
  )
}

/* AI Sorting — 2: Category chips */
function PreviewCategoryFolders() {
  const cats = [
    { label: 'Bridal', color: 'bg-pink-500' },
    { label: 'Groom', color: 'bg-blue-500' },
    { label: 'Ceremony', color: 'bg-violet-500' },
    { label: 'Reception', color: 'bg-amber-500' },
    { label: 'Portraits', color: 'bg-emerald-500' },
    { label: 'Details', color: 'bg-indigo-400' },
  ]
  return (
    <div className="w-full space-y-2">
      <p className="text-[11px] text-white/50 uppercase tracking-widest">Category Configuration</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {cats.map(c => (
          <span key={c.label} className="flex items-center gap-2 text-[13px] font-medium text-white/70">
            <span className={`h-2 w-2 rounded-full ${c.color}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* AI Sorting — 3: Progress bar */
function PreviewBatchProcessing() {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-white/65">Processing 847 photos</span>
        <span className="text-[15px] font-bold text-violet-300">92%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '92%', background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)' }} />
      </div>
      <div className="flex justify-between text-[11px] text-white/40 mt-1.5">
        <span>780 sorted</span>
        <span>67 remaining</span>
      </div>
    </div>
  )
}

/* Client Delivery — 1: Magic link bar */
function PreviewMagicLink() {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <span className="text-[12px] text-white/60 truncate flex-1">view1.app/g/autumn-wed-2024</span>
        <span className="shrink-0 rounded-md px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}>Copy</span>
      </div>
      <div className="flex gap-3 text-[11px] text-white/40 px-1">
        <span>🔗 No login required</span>
        <span>·</span>
        <span>Any device</span>
      </div>
    </div>
  )
}

/* Client Delivery — 2: Comment thread */
function PreviewPhotoComments() {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[10px] rounded-br-[3px] px-3 py-2 text-[12px] text-white leading-relaxed" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          Love this one! Can we get a closer crop?
        </div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="h-6 w-6 rounded-full bg-violet-500/25 border border-violet-500/40 shrink-0" />
        <div className="max-w-[80%] rounded-[10px] rounded-bl-[3px] bg-white/[0.08] border border-white/[0.10] px-3 py-2 text-[12px] text-white/70 leading-relaxed">
          On it — cropped version added ✓
        </div>
      </div>
    </div>
  )
}

/* Client Delivery — 3: Folder tree */
function PreviewOrganizedDownloads() {
  const folders = [
    { name: 'Ceremony', count: 48, indent: false },
    { name: 'Portraits', count: 32, indent: false },
    { name: 'Reception', count: 61, indent: false },
  ]
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-semibold text-white/70 uppercase tracking-widest">📁 AI Sort</span>
        <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[10px] text-violet-300">ZIP</span>
      </div>
      {folders.map(f => (
        <div key={f.name} className="flex items-center justify-between pl-3 py-1">
          <span className="text-[12px] text-white/60">📂 {f.name}</span>
          <span className="text-[11px] text-white/40">{f.count} photos</span>
        </div>
      ))}
    </div>
  )
}

/* Billing — 1: Signature field + button */
function PreviewESign() {
  return (
    <div className="w-full space-y-3">
      <div className="px-1">
        <p className="text-[11px] text-white/45 mb-2">Client Signature</p>
        <p className="text-[15px] text-white/30 italic mb-2" style={{ fontFamily: 'Georgia, serif' }}>Sign here</p>
        <div className="h-px bg-white/[0.15]" />
      </div>
      <button className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white" style={{ background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }}>
        ✍ Sign Contract
      </button>
    </div>
  )
}

/* Billing — 2: Invoice total + send button */
function PreviewInvoicing() {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1 py-1">
        <span className="text-[13px] text-white/55 font-medium">Total</span>
        <span className="text-[26px] font-bold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>$4,374</span>
      </div>
      <button className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white" style={{ background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }}>
        Send Invoice →
      </button>
    </div>
  )
}

/* Billing — 3: Notification rows */
function PreviewNotifications() {
  const notifs = [
    { dot: 'bg-emerald-400', label: 'Payment received', meta: '$1,200 from James Wilson' },
    { dot: 'bg-violet-400', label: 'Gallery ready', meta: 'Autumn Wedding delivered' },
    { dot: 'bg-blue-400', label: 'Contract signed', meta: 'Torres Portrait Session' },
  ]
  return (
    <div className="w-full space-y-1.5">
      {notifs.map(n => (
        <div key={n.label} className="flex items-center gap-2.5 px-1 py-1">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${n.dot}`} />
          <div className="min-w-0">
            <p className="text-[13px] text-white/75 font-medium truncate">{n.label}</p>
            <p className="text-[11px] text-white/45 truncate">{n.meta}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* Analytics — 1: Revenue stat */
function PreviewRevenue() {
  return (
    <div className="w-full space-y-1.5">
      <p className="text-[11px] text-white/50 uppercase tracking-widest">Revenue · This Month</p>
      <p className="text-[36px] font-bold text-white leading-none mt-1" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>$12,400</p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[13px] font-semibold text-emerald-400">↑ +18%</span>
        <span className="text-[12px] text-white/40">vs. last month</span>
      </div>
    </div>
  )
}

/* Analytics — 2: Client insight stats */
function PreviewClientInsights() {
  return (
    <div className="w-full grid grid-cols-2 gap-2">
      <div className="p-1 space-y-1">
        <p className="text-[11px] text-white/50 uppercase tracking-wider">Repeat Rate</p>
        <p className="text-[28px] font-bold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>64%</p>
        <p className="text-[12px] text-emerald-400 font-medium">↑ +8%</p>
      </div>
      <div className="p-1 space-y-1">
        <p className="text-[11px] text-white/50 uppercase tracking-wider">Avg Rating</p>
        <p className="text-[28px] font-bold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>4.9</p>
        <p className="text-[12px] text-amber-400">★ ★ ★ ★ ★</p>
      </div>
    </div>
  )
}

/* Analytics — 3: Mini bar chart */
function PreviewGalleryMetrics() {
  const bars = [
    { label: 'Dec', v: 42 },
    { label: 'Jan', v: 58 },
    { label: 'Feb', v: 51 },
    { label: 'Mar', v: 73 },
    { label: 'Apr', v: 91, active: true },
  ]
  const max = 91
  return (
    <div className="w-full space-y-2">
      <p className="text-[11px] text-white/50 uppercase tracking-widest">Gallery Downloads</p>
      <div className="flex items-end gap-2 h-14 mt-1">
        {bars.map(b => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full rounded"
              style={{
                height: `${(b.v / max) * 52}px`,
                background: b.active
                  ? 'linear-gradient(to top, #6366f1, #a855f7)'
                  : 'rgba(255,255,255,0.10)',
              }}
            />
            <span className={`text-[10px] font-medium ${b.active ? 'text-violet-300' : 'text-white/35'}`}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type PlatformFeature = { icon: React.ElementType; title: string; desc: string; Preview: React.FC }

const PLATFORM_TABS: Record<string, PlatformFeature[]> = {
  'AI Sorting': [
    { icon: Brain, title: 'Custom AI Profiles', desc: 'Train the AI on your personal shooting style and aesthetic preferences.', Preview: PreviewAIProfiles },
    { icon: FolderOpen, title: 'Category Folders', desc: 'Auto-organized by shot type, emotion, and scene — not random file names.', Preview: PreviewCategoryFolders },
    { icon: Zap, title: 'Batch Processing', desc: 'Sort thousands of photos in minutes, not hours of manual work.', Preview: PreviewBatchProcessing },
  ],
  'Client Delivery': [
    { icon: Globe, title: 'Magic Link Gallery', desc: 'One link, instant access. Works on any device, no account required.', Preview: PreviewMagicLink },
    { icon: MessageSquare, title: 'Photo Comments', desc: 'Clients leave notes on specific shots. Threaded replies from you.', Preview: PreviewPhotoComments },
    { icon: Download, title: 'Organized Downloads', desc: 'Curated ZIP with AI category folders — not a flat dump of files.', Preview: PreviewOrganizedDownloads },
  ],
  'Billing': [
    { icon: FileText, title: 'Contracts & E-Sign', desc: 'Template-based contracts with digital signatures before the shoot.', Preview: PreviewESign },
    { icon: CreditCard, title: 'Stripe Invoicing', desc: 'Auto-generated invoices. Instant payouts. Payment tracking built in.', Preview: PreviewInvoicing },
    { icon: Bell, title: 'Auto Notifications', desc: 'Email + SMS at every milestone — invoice sent, gallery ready, finals delivered.', Preview: PreviewNotifications },
  ],
  'Analytics': [
    { icon: BarChart3, title: 'Revenue Tracking', desc: 'Track revenue by period, client, and package — tied to real Stripe data.', Preview: PreviewRevenue },
    { icon: Heart, title: 'Client Insights', desc: 'Repeat client tracking, acquisition rate, and gallery engagement stats.', Preview: PreviewClientInsights },
    { icon: Smartphone, title: 'Gallery Metrics', desc: 'See which photos get downloaded most, time spent, and conversion rates.', Preview: PreviewGalleryMetrics },
  ],
}

function PlatformTabs() {
  const tabs = Object.keys(PLATFORM_TABS)
  const [active, setActive] = useState(tabs[0])
  const features = PLATFORM_TABS[active]
  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-sm">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActive(tab)} className={`rounded-xl px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-medium transition-all ${active === tab ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/35 hover:text-white/60'}`}>{tab}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map(f => (
          <div key={f.title} className={`p-7 ${glass} ${glassHighlight} ${glassHover}`}>
            <f.icon size={24} className="text-violet-400 mb-3" />
            <h3 className="font-semibold text-white mb-1.5" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{f.title}</h3>
            <p className="text-[13px] text-white/35 leading-relaxed">{f.desc}</p>
            <MicroEmbed><f.Preview /></MicroEmbed>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Waitlist hero section ── */
const WAITLIST_BENEFITS = [
  {
    title: 'Founding member pricing, locked forever',
    desc: 'The price you join at is the price you pay — always. When we raise it for everyone else, yours stays the same.',
  },
  {
    title: 'First access before public launch',
    desc: "You'll be using View1 Sort while thousands of other photographers are still on the waitlist.",
  },
  {
    title: 'Your feedback shapes the roadmap',
    desc: 'Direct line to the team. Features that matter to you get built first — not features for some hypothetical user.',
  },
  {
    title: 'Priority onboarding support',
    desc: "We personally help you configure your AI presets and nail your first client delivery from day one.",
  },
]

function WaitlistSection() {
  return (
    <section id="waitlist" className="py-20 px-6 relative z-10">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection>
          {/* Rainbow border */}
          <div className="p-[1.5px] rounded-[28px]" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.7) 0%, rgba(59,130,246,0.6) 20%, rgba(168,85,247,0.6) 40%, rgba(236,72,153,0.6) 60%, rgba(59,130,246,0.6) 80%, rgba(245,158,11,0.7) 100%)' }}>
            <div className="relative rounded-[27px] overflow-hidden bg-gradient-to-b from-white/[0.11] to-white/[0.03] backdrop-blur-[40px] px-8 py-12 sm:px-12 sm:py-16 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
              {/* Top highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              {/* Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[12px] font-semibold tracking-wider text-violet-300 uppercase">Founding Member Pricing · Limited Spots</span>
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-center text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08]" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                Join the waitlist.<br />Lock in your price.<br className="sm:hidden" />{' '}
                <span style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forever.</span>
              </h2>

              {/* Subtext */}
              <p className="mt-6 text-center text-[16px] sm:text-[17px] text-white/50 leading-relaxed max-w-xl mx-auto">
                We&apos;re building View1 Sort for photographers who are done doing the admin work that has nothing to do with photography. Founding members get the lowest price we&apos;ll ever offer — locked in permanently the moment they join.
              </p>

              {/* Divider */}
              <div className="my-10 h-px bg-white/[0.08]" />

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {WAITLIST_BENEFITS.map(b => (
                  <div key={b.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <Check size={11} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white leading-snug">{b.title}</p>
                      <p className="mt-0.5 text-[13px] text-white/40 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <WaitlistForm size="large" />

              {/* Social proof */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="flex -space-x-1.5">
                  {['bg-violet-500', 'bg-blue-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'].map((c, i) => (
                    <div key={i} className={`h-6 w-6 rounded-full border-2 border-white/10 ${c} opacity-80`} />
                  ))}
                </div>
                <p className="text-[13px] text-white/35">847 photographers already on the waitlist</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ── Waitlist mid (after Platform) ── */
function WaitlistMid() {
  return (
    <section className="py-16 px-6 relative z-10">
      <div className="mx-auto max-w-2xl">
        <AnimatedSection>
          <div className="p-[1.5px] rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.5) 0%, rgba(59,130,246,0.4) 50%, rgba(236,72,153,0.5) 100%)' }}>
            <div className="relative rounded-[15px] bg-gradient-to-b from-white/[0.09] to-white/[0.02] backdrop-blur-[32px] px-8 py-10 text-center shadow-[0_12px_48px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wider text-violet-300 uppercase">Limited Early Access</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                Ready to stop doing it the hard way?
              </h3>
              <p className="text-[15px] text-white/45 mb-8 max-w-md mx-auto leading-relaxed">
                Founding member pricing is locked in at signup — it never goes up. Join before we open to the public.
              </p>
              <WaitlistForm size="large" />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ── Waitlist end (before FAQ) ── */
function WaitlistEnd() {
  return (
    <section className="py-16 px-6 relative z-10">
      <div className="mx-auto max-w-xl text-center">
        <AnimatedSection>
          <SectionLabel>One more thing</SectionLabel>
          <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>
            Your founding member price<br />is waiting.
          </h3>
          <p className="text-[15px] text-white/40 mb-8 leading-relaxed">
            The moment we launch publicly, this price goes away. Waitlist members keep it forever — no matter what.
          </p>
          <WaitlistForm size="large" />
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ── Use case tabs ── */
const USE_CASES: Record<string, { headline: string; wins: string[] }> = {
  'Wedding': { headline: '1,200 photos. 6 hours. One deadline.', wins: ['AI sorts entire wedding by narrative arc: ceremony → portraits → reception', 'Preselection gallery live within hours of the shoot', 'Client selects favorites — you only edit what matters', 'Magic link delivery — no file transfer apps or Dropbox'] },
  'Real Estate': { headline: 'Three properties a day. Delivered by 5pm.', wins: ['Preset: exterior hero → rooms by size → detail textures', 'Auto-delivery to agent or homeowner after sort is complete', 'Watermarked previews unlock on payment — automatic', 'Invoice auto-sent after gallery delivered, Stripe handles the rest'] },
  'Commercial': { headline: 'Brand clients, revision rounds, licensing.', wins: ['Preset: hero shots → lifestyle → product detail → rejects', '3-stage delivery with revision thread built in', 'Contract with licensing terms before project begins', 'Organized ZIP by category for art directors'] },
  'Events': { headline: 'Fast turnaround. Lots of faces. Demanding organizers.', wins: ['Preset: keynote → networking → crowd → speakers → awards', 'Client delivery within 24 hours of upload', 'AI sorts by venue, speaker, and activity type automatically', 'Invoice and contract templates built for event photography'] },
}

function UseCaseTabs() {
  const tabs = Object.keys(USE_CASES)
  const [active, setActive] = useState(tabs[0])
  const uc = USE_CASES[active]
  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl bg-white/[0.04] border border-white/10 p-1.5 backdrop-blur-sm">
          {tabs.map(t => (
            <button key={t} onClick={() => setActive(t)} className={`rounded-xl px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-medium transition-all ${active === t ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/35 hover:text-white/60'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className={`mx-auto max-w-2xl p-8 ${glass} ${glassHighlight}`}>
        <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{uc.headline}</h3>
        <ul className="space-y-3">
          {uc.wins.map(w => (
            <li key={w} className="flex items-start gap-3 text-sm text-white/50">
              <Check size={16} className="shrink-0 text-emerald-400 mt-0.5" />
              {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main — Metallic Rainbow Dark (matching Dashboard V2)
───────────────────────────────────────────── */
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen text-white relative" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#030305', overflowX: 'clip' }}>

      {/* ── Background layers ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(3,3,5,0.5) 0%, rgba(8,8,16,0.56) 30%, rgba(6,6,9,0.56) 60%, rgba(3,3,5,0.5) 100%)' }} />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-35" style={{ background: ['radial-gradient(ellipse 40% 35% at 10% 15%, rgba(245,158,11,0.5) 0%, transparent 70%)','radial-gradient(ellipse 45% 40% at 50% 10%, rgba(59,130,246,0.6) 0%, transparent 70%)','radial-gradient(ellipse 35% 30% at 85% 20%, rgba(168,85,247,0.5) 0%, transparent 70%)','radial-gradient(ellipse 30% 35% at 25% 55%, rgba(236,72,153,0.4) 0%, transparent 70%)','radial-gradient(ellipse 40% 30% at 70% 50%, rgba(245,158,11,0.5) 0%, transparent 70%)','radial-gradient(ellipse 35% 35% at 40% 85%, rgba(59,130,246,0.5) 0%, transparent 70%)','radial-gradient(ellipse 30% 30% at 80% 80%, rgba(168,85,247,0.5) 0%, transparent 70%)','radial-gradient(ellipse 35% 25% at 15% 90%, rgba(236,72,153,0.4) 0%, transparent 70%)'].join(', ') }} />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%, rgba(255,255,255,0.04) 100%)' }} />

      {/* ── NAV ── */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-black/50 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-20 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500"><Camera size={13} className="text-white" /></div>
            <span className="text-base font-semibold tracking-tight text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>View1 Sort</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'Integrations', 'Pricing', 'Blog'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/40 transition-colors hover:text-white">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm text-white/40 transition-colors hover:text-white md:block">Sign In</Link>
            <a href="#waitlist" className="rounded-lg btn-rainbow px-5 py-2 text-sm transition-all hidden md:inline-flex">Get Early Access</a>
            <button
              className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-black/80 backdrop-blur-xl px-6 py-5">
            <div className="flex flex-col gap-5">
              {['Features', 'Integrations', 'Pricing', 'Blog'].map(item => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                <Link href="/auth/login" className="text-sm text-white/40 transition-colors hover:text-white" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <a href="#waitlist" className="rounded-lg btn-rainbow px-5 py-2.5 text-sm text-center transition-all" onClick={() => setMobileMenuOpen(false)}>Get Early Access</a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── SCROLL-JACKED HERO ── */}
      <ScrollHero />

      {/* ── WAITLIST (prominent, right after hero) ── */}
      <WaitlistSection />

      {/* ── HOW IT WORKS (scroll-jacked) ── */}
      <ScrollHowItWorks />

      {/* ── PRODUCT PREVIEW ── */}
      <ProductPreview />

      {/* ── PROBLEM ── */}
      <section className="pt-6 pb-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>The part nobody talks about.</h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">You come home from a shoot with a thousand photos and a to-do list that has nothing to do with photography.</p>
          </AnimatedSection>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            {[
              { target: 12, prefix: '6–', suffix: ' hours', sub: 'spent sorting and culling after a single shoot' },
              { target: 20, prefix: '', suffix: '+ emails', sub: 'back and forth before finals actually get delivered' },
              { target: 4, prefix: '', suffix: '+ apps', sub: 'just to manage one project from shoot to payment' },
            ].map((s, i) => (
              <AnimatedSection key={s.suffix} delay={i * 150} variant="float-in">
                <div className={`w-full sm:w-[280px] p-6 sm:p-8 ${glass} ${glassHighlight}`}>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}><AnimatedCounter target={s.target} prefix={s.prefix} suffix={s.suffix} duration={1800} /></p>
                  <p className="mt-2 text-sm text-white/35 leading-relaxed">{s.sub}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI DIFFERENCE ── */}
      <section className="pt-24 pb-2 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>The AI Difference</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight lg:text-[56px] text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>Most AI sorts by sharpness.<br />That&apos;s not how photographers think.</h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">A soft, emotional first-look photo matters more than a perfectly lit detail shot. We built the AI to understand that.</p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 max-w-4xl mx-auto">

              <div className="px-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400/70 mb-7">Everyone Else</p>
                <ul className="space-y-5">
                  {[
                    'Flags blurry + duplicate images',
                    'Scores by sharpness and exposure',
                    'Treats every shoot identically',
                    'Misses emotionally important shots',
                    'No context about your shoot',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-4">
                      <span className="text-[15px] font-bold text-red-400/60 shrink-0 leading-none">✕</span>
                      <span className="text-[16px] font-semibold text-white/30 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-400 mb-7">View1 Sort</p>
                <ul className="space-y-5">
                  {[
                    'Sorts by story and emotional weight',
                    'You describe the shoot — AI uses that context',
                    'Flags obvious misses, you make the final call',
                    'Build presets just by talking to the AI',
                    'Learns your style over time',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-4">
                      <span className="text-[15px] font-bold text-emerald-400 shrink-0 leading-none">✓</span>
                      <span className="text-[16px] font-semibold text-white/80 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── AI MOMENT ── */}
      <section className="pt-12 pb-24 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20 items-center">
            <AnimatedSection>
              <div>
                <SectionLabel>AI-Powered Presets</SectionLabel>
                <h2 className="mt-4 text-3xl sm:text-[40px] font-bold tracking-tight leading-[1.15] text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>Tell the AI how you see. It learns.</h2>
                <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-md">No menus. No sliders. Just describe what you shoot, what you look for, and what you always reject. The AI builds a reusable sorting preset from the conversation.</p>
                <ul className="mt-8 space-y-3">
                  {['Zero manual tagging required', 'Understands light, emotion, and context', 'AI sorting runs entirely in your browser — no upload needed to cull', 'Learns your style over time'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/40"><Check size={16} className="shrink-0 text-violet-400" />{item}</li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            <AnimatedSection variant="float-in" delay={200}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-400/70 mb-3">Prompt to sort</p>
              <div className={`p-6 ${glass} ${glassHighlight}`}>
                <div className="space-y-3">
                  <div className="flex justify-end"><div className="max-w-[300px] rounded-[14px] rounded-br-[4px] bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-[13px] text-white leading-relaxed">It&apos;s a golden hour beach wedding, very emotional ceremony, lots of candid family moments</div></div>
                  <div className="flex gap-2.5 items-end"><div className="h-7 w-7 shrink-0 rounded-full border border-violet-400/25 bg-violet-400/10" /><div className="rounded-[14px] rounded-bl-[4px] border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/70 leading-relaxed">Got it — running AI sort for golden hour beach wedding. Prioritizing: emotional candids → ceremony moments → family groups → detail shots. Hero shot candidates flagged ✨</div></div>
                  <div className="flex justify-end"><div className="max-w-[240px] rounded-[14px] rounded-br-[4px] bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-[13px] text-white leading-relaxed">Looks great! Deliver the top 80 to the client gallery</div></div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.07]">
                  <p className="text-[11px] text-white/25 mb-1.5">Processing 847 photos · 92% complete</p>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" /></div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── WAITLIST MID ── */}
      <WaitlistMid />

      {/* ── WORKFLOW ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>The shoot doesn&apos;t end<br />when you put the camera down.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { tag: 'STAGE 1 · INGEST', title: 'Upload & Ingest', desc: 'Drag-drop from Finder, import from Lightroom, or sync from cloud. All formats supported.' },
              { tag: 'STAGE 2 · PRODUCTION', title: 'AI Sort & Curation', desc: 'AI categorizes every photo, scores hero shots, and builds a curated delivery set — in minutes.' },
              { tag: 'STAGE 3 · FINISH', title: 'Deliver & Get Paid', desc: 'Watermarked gallery link, client selection, Stripe invoice — all automated after the sort.' },
            ].map((wf, i) => (
              <AnimatedSection key={wf.tag} delay={i * 120} variant="float-in">
                <div className={`p-7 ${glass} ${glassHighlight} ${glassHover}`}>
                  <div className="inline-flex rounded-md bg-violet-400/10 border border-violet-400/20 px-2.5 py-1 mb-4"><span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">{wf.tag}</span></div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{wf.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{wf.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>Everything in one place. Finally.</h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">Gallery hosting. Client proofing. Invoicing. Contracts. AI editing. You&apos;re using five apps for what should be one workflow. We fixed that.</p>
          </AnimatedSection>
          <PlatformTabs />
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-10">
            <SectionLabel>Built for every shoot</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight lg:text-[48px] text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>We&apos;re building this for you.<br />Come be part of it.</h2>
          </AnimatedSection>
          <UseCaseTabs />
        </div>
      </section>

      {/* ── WAITLIST END ── */}
      <WaitlistEnd />

      {/* ── FAQ ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>Common questions</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-10 px-6 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500"><Camera size={10} className="text-white" /></div>
            <span className="text-[13px] font-semibold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>View1 Sort</span>
          </div>
          <p className="text-xs text-white/20">© 2026 View1 Sort. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
