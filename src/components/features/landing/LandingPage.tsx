'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatedSection } from './animated-section'
import { AnimatedCounter } from './animated-counter'
import { TextColor } from '@/components/ui/text-color'
import { ScrollHero } from './ScrollHero'
import { WaitlistForm } from './WaitlistForm'
import {
  Brain, Camera, FolderOpen, Zap, Check, ChevronDown,
  CreditCard, BarChart3, Globe, MessageSquare, Download,
  Heart, FileText, Smartphone, Bell,
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
  { q: 'What does it cost?', a: 'We\'re in early access. Waitlist members get a lifetime discount and first access.' },
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

/* ── Platform feature tabs ── */
const PLATFORM_TABS: Record<string, { icon: React.ElementType; title: string; desc: string }[]> = {
  'AI Sorting': [
    { icon: Brain, title: 'Custom AI Profiles', desc: 'Train the AI on your personal shooting style and aesthetic preferences.' },
    { icon: FolderOpen, title: 'Category Folders', desc: 'Auto-organized by shot type, emotion, and scene — not random file names.' },
    { icon: Zap, title: 'Batch Processing', desc: 'Sort thousands of photos in minutes, not hours of manual work.' },
  ],
  'Client Delivery': [
    { icon: Globe, title: 'Magic Link Gallery', desc: 'One link, instant access. Works on any device, no account required.' },
    { icon: MessageSquare, title: 'Photo Comments', desc: 'Clients leave notes on specific shots. Threaded replies from you.' },
    { icon: Download, title: 'Organized Downloads', desc: 'Curated ZIP with AI category folders — not a flat dump of files.' },
  ],
  'Billing': [
    { icon: FileText, title: 'Contracts & E-Sign', desc: 'Template-based contracts with digital signatures before the shoot.' },
    { icon: CreditCard, title: 'Stripe Invoicing', desc: 'Auto-generated invoices. Instant payouts. Payment tracking built in.' },
    { icon: Bell, title: 'Auto Notifications', desc: 'Email + SMS at every milestone — invoice sent, gallery ready, finals delivered.' },
  ],
  'Analytics': [
    { icon: BarChart3, title: 'Revenue Tracking', desc: 'Track revenue by period, client, and package — tied to real Stripe data.' },
    { icon: Heart, title: 'Client Insights', desc: 'Repeat client tracking, acquisition rate, and gallery engagement stats.' },
    { icon: Smartphone, title: 'Gallery Metrics', desc: 'See which photos get downloaded most, time spent, and conversion rates.' },
  ],
}

function PlatformTabs() {
  const tabs = Object.keys(PLATFORM_TABS)
  const [active, setActive] = useState(tabs[0])
  const features = PLATFORM_TABS[active]
  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-sm">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActive(tab)} className={`rounded-xl px-4 py-2 text-[13px] font-medium transition-all ${active === tab ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/35 hover:text-white/60'}`}>{tab}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map(f => (
          <div key={f.title} className={`p-7 ${glass} ${glassHighlight} ${glassHover}`}>
            <f.icon size={24} className="text-violet-400 mb-3" />
            <h3 className="font-semibold text-white mb-1.5" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{f.title}</h3>
            <p className="text-[13px] text-white/35 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
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
        <div className="inline-flex gap-1 rounded-2xl bg-white/[0.04] border border-white/10 p-1.5 backdrop-blur-sm">
          {tabs.map(t => (
            <button key={t} onClick={() => setActive(t)} className={`rounded-xl px-5 py-2 text-[13px] font-medium transition-all ${active === t ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/35 hover:text-white/60'}`}>{t}</button>
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
            {['Capabilities', 'Integrations', 'Pricing', 'Blog'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/40 transition-colors hover:text-white">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm text-white/40 transition-colors hover:text-white md:block">Sign In</Link>
            <a href="#waitlist" className="rounded-lg btn-rainbow px-5 py-2 text-sm transition-all">Get Early Access</a>
          </div>
        </div>
      </nav>

      {/* ── SCROLL-JACKED HERO ── */}
      <ScrollHero />

      {/* ── PROBLEM ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>The part nobody talks about.</h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">You come home from a shoot with a thousand photos and a to-do list that has nothing to do with photography.</p>
          </AnimatedSection>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {[
              { target: 12, prefix: '6–', suffix: ' hours', sub: 'spent sorting and culling after a single shoot' },
              { target: 20, prefix: '', suffix: '+ emails', sub: 'back and forth before finals actually get delivered' },
              { target: 4, prefix: '', suffix: '+ apps', sub: 'just to manage one project from shoot to payment' },
            ].map((s, i) => (
              <AnimatedSection key={s.suffix} delay={i * 150} variant="float-in">
                <div className={`w-[280px] p-8 ${glass} ${glassHighlight}`}>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}><AnimatedCounter target={s.target} prefix={s.prefix} suffix={s.suffix} duration={1800} /></p>
                  <p className="mt-2 text-sm text-white/35 leading-relaxed">{s.sub}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI DIFFERENCE ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>The AI Difference</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-[56px] text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>Most AI sorts by sharpness.<br />That&apos;s not how photographers think.</h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">A soft, emotional first-look photo matters more than a perfectly lit detail shot. We built the AI to understand that.</p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className={`p-8 ${glass} ${glassHighlight}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400/80 mb-5">Everyone Else</p>
                <p className="text-sm text-white/40 leading-relaxed">Flag blurry and duplicate images. Score photos by technical quality. Sort by sharpness and exposure. Treat every shoot the same way. Miss the photos that actually matter.</p>
              </div>
              <div className="p-[1px] rounded-[20px]" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(59,130,246,0.4) 25%, rgba(168,85,247,0.4) 50%, rgba(236,72,153,0.4) 75%, rgba(245,158,11,0.5) 100%)' }}>
                <div className="relative rounded-[19px] overflow-hidden bg-gradient-to-b from-white/[0.12] to-white/[0.03] backdrop-blur-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-400 mb-5">View1 Sort</p>
                  <p className="text-sm text-white/50 leading-relaxed">You describe the shoot — the AI sorts with that context. Sorts by story and emotional weight, not just pixels. Smart culling flags the obvious misses — you make the final call. Build sorting presets by just talking to the AI. Over time, it starts to sort the way you would.</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <div className="mt-4"><TextColor words={['Upload.', 'Sort.', 'Deliver.', 'Get paid.']} /></div>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">Three steps. No app-switching. No export-import chains. No &ldquo;where did I save that gallery?&rdquo;</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { step: '01', title: 'Upload & Describe', desc: 'Upload your photos and tell the AI about the shoot — what you were going for, what matters most, what to skip.' },
              { step: '02', title: 'Share with Your Client', desc: 'Send a single link. Your client sees the gallery instantly — no app to download, no account to create.' },
              { step: '03', title: 'Get Paid, Move On', desc: 'Finals go out as an organized download — not a flat dump. Invoice is handled. Everything lives in one place.' },
            ].map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 150} variant="float-in">
                <div className={`p-8 ${glass} ${glassHighlight} ${glassHover}`}>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white"><span className="text-sm font-bold" style={{ fontFamily: "'Geist Mono', monospace" }}>{step.step}</span></div>
                  <h3 className="text-[22px] font-bold text-white mb-3" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{step.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI MOMENT ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 items-center">
            <AnimatedSection>
              <div>
                <SectionLabel>AI-Powered Presets</SectionLabel>
                <h2 className="mt-4 text-[40px] font-bold tracking-tight leading-[1.15] text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>Tell the AI how you see. It learns.</h2>
                <p className="mt-4 text-[15px] text-white/40 leading-relaxed max-w-md">No menus. No sliders. Just describe what you shoot, what you look for, and what you always reject. The AI builds a reusable sorting preset from the conversation.</p>
                <ul className="mt-8 space-y-3">
                  {['Zero manual tagging required', 'Understands light, emotion, and context', 'Runs in the browser — your photos never leave your device', 'Learns your style over time'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/40"><Check size={16} className="shrink-0 text-violet-400" />{item}</li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            <AnimatedSection variant="float-in" delay={200}>
              <div className={`p-6 ${glass} ${glassHighlight}`}>
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
                  <div className="h-2 w-2 rounded-full bg-violet-400" />
                  <span className="text-[13px] font-semibold text-white/70">AI Workspace</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-end"><div className="max-w-[300px] rounded-[14px] rounded-br-[4px] bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-[13px] text-white leading-relaxed">It&apos;s a golden hour beach wedding, very emotional ceremony, lots of candid family moments</div></div>
                  <div className="flex gap-2.5 items-end"><div className="h-7 w-7 shrink-0 rounded-full border border-violet-400/25 bg-violet-400/10" /><div className="rounded-[14px] rounded-bl-[4px] border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/70 leading-relaxed">Got it — running AI sort for golden hour beach wedding. Prioritizing: emotional candids → ceremony moments → family groups → detail shots. Hero shot candidates flagged ✨</div></div>
                  <div className="flex justify-end"><div className="max-w-[240px] rounded-[14px] rounded-br-[4px] bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-[13px] text-white leading-relaxed">Looks great! Deliver the top 80 to the client gallery</div></div>
                </div>
                <div className="mt-4 pt-3">
                  <p className="text-[11px] text-white/25 mb-1.5">Processing 847 photos · 92% complete</p>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" /></div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-14">
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>The shoot doesn&apos;t end<br />when you put the camera down.</h2>
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
            <h2 className="text-4xl font-bold tracking-tight lg:text-5xl text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>Everything in one place. Finally.</h2>
            <p className="mt-4 text-base text-white/40 max-w-xl mx-auto leading-relaxed">Gallery hosting. Client proofing. Invoicing. Contracts. AI editing. You&apos;re using five apps for what should be one workflow. We fixed that.</p>
          </AnimatedSection>
          <PlatformTabs />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="waitlist" className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight lg:text-[56px] text-white" style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}>We&apos;re building this for you.<br />Come be part of it.</h2>
          </AnimatedSection>
          <UseCaseTabs />
          <div className="mt-16" />
          <AnimatedSection variant="float-in">
            <div className="mx-auto max-w-[960px] p-[2px] rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.6) 0%, rgba(59,130,246,0.5) 20%, rgba(168,85,247,0.5) 40%, rgba(236,72,153,0.5) 60%, rgba(59,130,246,0.5) 80%, rgba(245,158,11,0.6) 100%)' }}>
              <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-b from-white/[0.12] to-white/[0.03] backdrop-blur-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-10">
                    <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>The View1 Workflow</h3>
                    <p className="text-sm text-white/35 leading-relaxed mb-6 max-w-md">Join the waitlist for early access and founding member pricing. You&apos;ll be first to try new features — and your feedback shapes what we build next.</p>
                    <ul className="space-y-2.5">
                      {['AI sorts your entire shoot in under 12 minutes', 'Watermarked gallery delivered same day', 'Invoice sent and paid before you leave the venue'].map(item => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-white/50"><Check size={16} className="shrink-0 text-emerald-400" />{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/[0.03] p-10 flex flex-col justify-center border-l border-white/10">
                    <div className="mb-3">
                      <div className="inline-flex rounded-full bg-violet-400/10 border border-violet-400/20 px-3 py-1 mb-4"><span className="text-[11px] font-medium text-violet-400">Early Access — Limited Spots</span></div>
                      <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>Free to start</p>
                      <p className="text-[13px] text-white/30 mb-5">No credit card required. Cancel anytime.</p>
                    </div>
                    <WaitlistForm />
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

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
