'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Sparkles, Brain, Layers, Send, Users, BarChart3, CalendarDays,
  FileText, Smartphone, CheckCircle, ArrowRight, Star, Zap,
  Camera, Image, FolderOpen, CreditCard, Mail, Bell, Shield,
  Download, Eye, MessageSquare, RefreshCw, Palette, Clock,
  TrendingUp, Package, MapPin, ChevronDown, ChevronRight,
  Monitor, Tablet, Play, Circle, Check, X, Menu, Globe,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Waitlist form
───────────────────────────────────────────── */
function WaitlistForm({ size = 'default' }: { size?: 'default' | 'large' }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, photographer_type: type }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`flex flex-col items-center gap-3 text-center ${size === 'large' ? 'py-6' : 'py-4'}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
          <CheckCircle size={24} />
        </div>
        <p className={`font-semibold text-zinc-100 ${size === 'large' ? 'text-xl' : 'text-base'}`}>
          You&apos;re on the list.
        </p>
        <p className="text-sm text-zinc-400">We&apos;ll email you when access opens. Tell a photographer friend.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 w-full ${size === 'large' ? 'max-w-lg' : 'max-w-md'}`}>
      {size === 'large' && (
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-700/60 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-700/60 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-400 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none"
          >
            <option value="">Type of photography</option>
            <option value="wedding">Wedding</option>
            <option value="real_estate">Real Estate</option>
            <option value="commercial">Commercial</option>
            <option value="fashion">Fashion / Portrait</option>
            <option value="travel">Travel / Influencer</option>
            <option value="event">Event</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
      <div className={`flex gap-2 ${size === 'large' ? '' : ''}`}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={`flex-1 rounded-xl border border-zinc-700/60 bg-zinc-900/80 px-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all ${size === 'large' ? 'py-4' : 'py-3'}`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`shrink-0 rounded-xl bg-indigo-500 px-6 font-semibold text-white transition-all hover:bg-indigo-400 disabled:opacity-60 ${size === 'large' ? 'py-4 text-base' : 'py-3 text-sm'}`}
        >
          {loading ? 'Joining…' : 'Join Waitlist'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-center text-xs text-zinc-500">Free to join. Early access + lifetime discount for waitlist members.</p>
    </form>
  )
}

/* ─────────────────────────────────────────────
   Screenshot placeholder
───────────────────────────────────────────── */
function ScreenPlaceholder({ label, aspect = '16/9', className = '' }: { label: string; aspect?: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900 to-zinc-950 ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(99,102,241,0.05)_0%,transparent_60%)]" />
      {/* Fake browser chrome */}
      <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-1.5 border-b border-zinc-800 px-3">
        <div className="h-2 w-2 rounded-full bg-zinc-700" />
        <div className="h-2 w-2 rounded-full bg-zinc-700" />
        <div className="h-2 w-2 rounded-full bg-zinc-700" />
        <div className="mx-3 flex-1 rounded-md bg-zinc-800 h-3.5" />
      </div>
      {/* Grid texture */}
      <div className="absolute inset-0 mt-8 opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 mt-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Monitor size={20} />
        </div>
        <span className="text-xs font-medium text-zinc-500 tracking-wider uppercase">{label}</span>
      </div>
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section heading
───────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
      {children}
    </span>
  )
}

/* ─────────────────────────────────────────────
   FAQ accordion
───────────────────────────────────────────── */
const FAQS = [
  { q: 'How is View1 Sort different from Lightroom AI or Imagen?', a: 'Lightroom and Imagen sort by technical quality — sharpness, exposure, blink detection. View1 Sort understands the narrative arc of your shoot. It knows the emotion of a soft first-look image outweighs a technically perfect reception shot. You also describe your shoot before upload, so the AI knows what story it\'s looking for.' },
  { q: 'Does it replace Lightroom?', a: 'No — it works alongside it. After AI sorting, you export to Lightroom for editing. When you reopen View1, the edited files auto-sync back. We\'re the sorting, delivery, and business layer. Lightroom is your editing layer. They\'re better together.' },
  { q: 'Can my clients use it without creating an account?', a: 'Yes. Clients receive a magic link via email and can view the gallery immediately — no account needed. If they want a dashboard to track all their projects with you, they can create an account using the same email in one click.' },
  { q: 'How does the 3-stage delivery work?', a: 'Stage 1: you send a preselection gallery — client views and comments but can\'t download. Stage 2: client selects their favorites and you edit them. Stage 3: you upload finals — client downloads or requests revisions. Each stage, the status badge updates for both of you.' },
  { q: 'What photography niches does the AI support?', a: 'Wedding, Real Estate, Commercial, Fashion/Portrait, Travel/Influencer, and Event — with built-in presets for each. You can also build your own "vibe preset" by chatting with the AI and describing your exact aesthetic and rejection criteria.' },
  { q: 'Is my data secure?', a: 'Yes. All data is isolated with Row Level Security at the database level. Client galleries are private by default — only accessible via your shared link. Watermarks are applied on delivery without modifying stored originals.' },
  { q: 'What does it cost?', a: 'We\'re in early access. Waitlist members get a lifetime discount and first access. Pricing will follow a tiered model: Free (limited projects), Pro (full AI sort + delivery), Business (team accounts + analytics).' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="divide-y divide-zinc-800">
      {FAQS.map((faq, i) => (
        <div key={i} className="py-5">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <span className="font-medium text-zinc-100">{faq.q}</span>
            <ChevronDown size={16} className={`shrink-0 text-zinc-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Marquee
───────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  '🤖 AI Story Sorting', '✂️ Smart Culling', '💬 Vibe Chat Presets', '🔄 Lightroom Roundtrip',
  '🔗 Magic Link Delivery', '📋 Client Selection Flow', '💼 Contract + Invoice', '📊 Financial Analytics',
  '📅 Booking Forms', '📱 Mobile Companion', '🎨 Watermark Studio', '⬇️ ZIP Export by Category',
  '🧠 AI Style Profile', '✉️ Auto Email + SMS', '🗓️ Calendar Sync',
]

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');`}</style>

      {/* ═══════════════════════════════════════
          NAV
      ═══════════════════════════════════════ */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-zinc-800/60 bg-[#09090b]/90 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Camera size={15} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-100">View1 Sort</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'How It Works', 'Use Cases', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 md:block">
              Sign In
            </Link>
            <a href="#waitlist" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-400">
              Get Early Access
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12)_0%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/4 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-violet-500/4 blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(zinc 1px, transparent 1px), linear-gradient(90deg, zinc 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-4 py-1.5 text-sm font-medium text-indigo-300">
            <Sparkles size={13} />
            Now in private early access — join the waitlist
            <ArrowRight size={13} />
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            The AI That Thinks
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Like a Photographer
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            View1 Sort doesn&apos;t just cull blurry photos. It understands the <em className="text-zinc-300 not-italic font-medium">narrative arc</em> of your shoot — sorting by story and emotion, not just sharpness scores. Then delivers, invoices, and runs your entire photography business.
          </p>

          {/* Waitlist form */}
          <div className="mt-10 flex justify-center">
            <WaitlistForm size="default" />
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
            {[
              { n: '40%', label: 'Less time sorting' },
              { n: '3×', label: 'Faster delivery' },
              { n: '100%', label: 'Client workflow covered' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-xl font-bold text-zinc-100">{s.n}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Hero screenshot */}
          <div className="relative mt-16">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-indigo-500/5 to-transparent blur-2xl" />
            <ScreenPlaceholder label="AI Sort Dashboard" aspect="16/9" className="relative shadow-2xl shadow-black/60 ring-1 ring-zinc-700/40" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE
      ═══════════════════════════════════════ */}
      <section className="border-y border-zinc-800/40 bg-zinc-950/50 py-4 overflow-hidden">
        <div className="flex animate-[marquee_30s_linear_infinite] gap-8 whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium text-zinc-500">{item}</span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROBLEM
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              You became a photographer to shoot,<br />not to manage files.
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              After every shoot, the real work begins — and it takes forever.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Clock, title: '6–12 hours', sub: 'Average time spent culling and sorting a single wedding shoot', color: 'text-red-400', bg: 'bg-red-500/8 border-red-500/20' },
              { icon: Mail, title: '20+ emails', sub: 'Back-and-forth with clients before finals are delivered', color: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/20' },
              { icon: Package, title: '4 tools', sub: 'Average number of apps to run one photography project end-to-end', color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/20' },
            ].map(p => (
              <div key={p.title} className={`rounded-2xl border p-6 ${p.bg}`}>
                <p.icon size={24} className={p.color} />
                <p className={`mt-3 text-3xl font-black ${p.color}`}>{p.title}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              '😤 Manually dragging photos into folders named "maybe" and "definitely"',
              '😓 Sending 5GB Dropbox links that expire and confuse clients',
              '📧 Chasing invoice payments through three different apps',
              '🔁 Re-exporting the same gallery three times after revision emails',
              '📋 Building shot lists in Notes.app and losing them on set',
              '🧾 Copy-pasting client details into contracts, invoices, and emails separately',
            ].map(pain => (
              <div key={pain} className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <X size={14} className="mt-0.5 shrink-0 text-red-400" />
                <span className="text-sm text-zinc-400">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE AI DIFFERENCE
      ═══════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><Brain size={12} /> The AI Difference</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Sort by story. Not just sharpness.
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Every other AI tool asks "is this photo technically good?" We ask "does this photo matter?"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Comparison */}
            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Everyone Else</p>
              <div className="space-y-3">
                {[
                  'Reject blurry images', 'Reject closed eyes', 'Reject bad exposure',
                  'Sort by quality score', 'Ignore context and emotion',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                    <X size={14} className="shrink-0 text-red-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-8 ring-1 ring-indigo-500/10">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">View1 Sort</p>
              <div className="space-y-3">
                {[
                  'Smart cull + photographer review before sort',
                  'Sort by narrative arc and emotional weight',
                  'Understand shoot context from your description',
                  'Vibe presets built through natural language chat',
                  'AI Style Profile learns your personal aesthetic',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-100">
                    <Check size={14} className="shrink-0 text-indigo-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ScreenPlaceholder label="AI Sort — Story View" aspect="21/9" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              From memory card to paid invoice<br />in one platform.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01', icon: Brain, title: 'Describe & Upload',
                desc: 'Tell the AI what you shot — vibe, priorities, what to reject. Upload your photos. Smart culling runs first, then AI sorts into story-based categories using your preset.',
                items: ['🎯 Shoot context feeds the AI', '✂️ Smart cull removes obvious rejects', '📂 Sorted into narrative categories'],
              },
              {
                step: '02', icon: Send, title: 'Deliver to Clients',
                desc: 'Send a preselection gallery via magic link. Client selects their favorites and leaves comments. You edit in Lightroom, reopen View1, and finals auto-sync back.',
                items: ['🔗 Magic link — no app needed', '💬 Per-photo comments', '🔄 Lightroom roundtrip sync'],
              },
              {
                step: '03', icon: CreditCard, title: 'Get Paid & Close',
                desc: 'Client downloads their curated ZIP, organized by category. Stripe invoice auto-generated. Contract, payment, and delivery history all in one client profile.',
                items: ['⬇️ ZIP by AI category', '💳 Stripe invoice + receipt', '📋 Full audit trail'],
              },
            ].map(step => (
              <div key={step.step} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-5xl font-black text-zinc-800">{step.step}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-400 border border-indigo-500/20">
                    <step.icon size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{step.desc}</p>
                <ul className="space-y-1.5">
                  {step.items.map(item => (
                    <li key={item} className="text-sm text-zinc-500">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VIBE PRESET BUILDER
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            <div>
              <SectionLabel><Sparkles size={12} /> Vibe Preset Builder</SectionLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
                Build your AI preset<br />by just describing it.
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Chat with the AI to build a sorting preset that matches your exact aesthetic. It asks about your niche, priorities, what mood you&apos;re going for, and what you always reject. The result? A personal preset that sorts like <em className="text-zinc-200 not-italic font-medium">you</em>.
              </p>

              {/* Mock chat */}
              <div className="mt-8 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-5 space-y-3">
                {[
                  { role: 'ai', msg: 'What kind of shoot is this?' },
                  { role: 'user', msg: 'Luxury real estate in Miami. Ocean-facing penthouse, lots of golden hour light.' },
                  { role: 'ai', msg: 'Perfect. What should I prioritize — exterior hero shots, room-by-room interiors, or lifestyle details?' },
                  { role: 'user', msg: 'Exterior heroes first, then rooms by size, then texture and detail shots.' },
                  { role: 'ai', msg: 'What do you always reject immediately?' },
                  { role: 'user', msg: 'Bad window glare, construction mess, anything with a crew member in frame.' },
                  { role: 'ai', msg: '✅ Preset "Miami Luxury RE" created — 6 categories, 4 rejection rules. Apply to project?' },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-zinc-800 text-zinc-200' : 'bg-indigo-500 text-white'}`}>
                      {msg.msg}
                    </div>
                  </div>
                ))}
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  '6 built-in niche presets to start immediately',
                  'Chat to customize or build from scratch',
                  'Inline prompt available on every project',
                  'Presets saved to your library and reusable',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <ScreenPlaceholder label="Presets Library" aspect="3/4" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          GALLERY DELIVERY
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><Image size={12} /> Gallery & Delivery</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Three stages. Zero confusion.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              A structured delivery flow that keeps photographer and client perfectly in sync — from first look to final download.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
            {[
              {
                stage: 'Stage 1', icon: Eye, title: 'Preselection',
                desc: 'After culling and AI sort, share the gallery with your client. They view and comment. You retain control — nothing is downloadable yet.',
                color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5',
                items: ['📷 Full AI-sorted gallery', '💬 Per-photo comments', '🔒 Download locked'],
              },
              {
                stage: 'Stage 2', icon: CheckCircle, title: 'Client Selection',
                desc: 'Client favorites the photos they want. You see exactly what they chose, mark the project as In Editing, and take it to Lightroom.',
                color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/5',
                items: ['❤️ Client favorites', '📋 Selection summary', '🎨 You edit in Lightroom'],
              },
              {
                stage: 'Stage 3', icon: Download, title: 'Finals',
                desc: 'Re-upload edited files. Client downloads their curated ZIP organized by category, or opens a revision thread if needed.',
                color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5',
                items: ['⬇️ ZIP by category', '✏️ Revision requests', '🎉 Or just download'],
              },
            ].map(s => (
              <div key={s.stage} className={`rounded-2xl border p-6 ${s.border} ${s.bg}`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${s.color} mb-3`}>
                  <s.icon size={14} />
                  {s.stage} — {s.title}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.items.map(item => (
                    <li key={item} className="text-xs text-zinc-500">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <ScreenPlaceholder label="Client Gallery — Stage 2 Selection" aspect="21/9" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FULL FEATURE GRID
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel>Every Feature</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              One platform. Every tool<br />a photographer needs.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Brain, title: 'AI Story Sorting', desc: 'Sorts by narrative arc and emotion, not just technical quality. Understands the context of your shoot.', tag: 'Core' },
              { icon: Sparkles, title: 'Smart Culling', desc: 'Auto-flags blurry, duplicate, closed-eye, and blown exposure shots before sorting begins.', tag: 'Core' },
              { icon: MessageSquare, title: 'Vibe Chat Presets', desc: 'Describe your aesthetic in plain language. AI builds a reusable sorting preset from your conversation.', tag: 'Core' },
              { icon: RefreshCw, title: 'Lightroom Roundtrip', desc: 'Edit in Lightroom, reopen View1, and edited files auto-sync back. Original always preserved.', tag: 'Workflow' },
              { icon: Send, title: 'Magic Link Delivery', desc: 'Clients view galleries via email link — no account required. Beautiful, branded experience.', tag: 'Delivery' },
              { icon: Users, title: 'Client Dashboard', desc: 'Clients get their own space to track all projects, select photos, and track delivery status.', tag: 'Clients' },
              { icon: FileText, title: 'Contract + Invoice', desc: 'Send contract, collect signature, auto-generate Stripe invoice — all in one thread.', tag: 'Business' },
              { icon: Package, title: 'Package Builder', desc: 'Create reusable packages and products. Attach to booking forms and auto-populate invoices.', tag: 'Business' },
              { icon: CalendarDays, title: 'Smart Calendar', desc: 'Drag-to-move events, Google + Apple sync. Shoots auto-created from booking form submissions.', tag: 'Workflow' },
              { icon: BarChart3, title: 'Business Analytics', desc: 'Revenue by period, client acquisition rate, package performance, repeat client rate.', tag: 'Analytics' },
              { icon: Palette, title: 'Watermark Studio', desc: 'Upload your logo. Configure placement, size, and opacity. Applied on delivery, not on stored files.', tag: 'Delivery' },
              { icon: Smartphone, title: 'Mobile Companion', desc: 'Shot list, notes, client info on set. Auto-syncs to project when you reopen after the shoot.', tag: 'Mobile' },
              { icon: Bell, title: 'Auto Notifications', desc: 'Email + SMS triggers at every workflow milestone. Fully customizable per photographer.', tag: 'Business' },
              { icon: Download, title: 'Organized ZIP Export', desc: 'Client downloads are sorted by AI category folders — not a flat dump of 1,400 JPEGs.', tag: 'Delivery' },
              { icon: Brain, title: 'AI Style Profile', desc: 'Learns your personal aesthetic across projects. After 5 shoots, it sorts like you, not like everyone.', tag: 'AI' },
            ].map(f => (
              <div key={f.title} className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-all group-hover:bg-indigo-500/15">
                    <f.icon size={16} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{f.tag}</span>
                </div>
                <h3 className="font-semibold text-zinc-100 mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          USE CASES
      ═══════════════════════════════════════ */}
      <section id="use-cases" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel>Use Cases</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Built for every photographer<br />who shoots at volume.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                emoji: '💍', type: 'Wedding Photographers',
                headline: '1,200 photos. 6 hours of footage. One deadline.',
                pain: 'You shoot 8-hour days and come home to days of sorting. Clients wait weeks.',
                wins: ['AI sorts entire wedding by narrative: ceremony → portraits → reception', 'Preselection gallery live within hours of the shoot', 'Client selects favorites; you only edit what matters', 'Magic link delivery — no file transfer apps'],
              },
              {
                emoji: '🏠', type: 'Real Estate Photographers',
                headline: 'Three properties a day. Delivered by 5pm.',
                pain: 'Turnaround is everything. Manual sorting and emailing kills your margin.',
                wins: ['Real estate preset: exterior → rooms by size → detail shots', 'Auto-delivery to agent or homeowner after sort', 'Watermarked previews unlock on payment', 'Invoice auto-sent after gallery delivered'],
              },
              {
                emoji: '🎨', type: 'Commercial Photographers',
                headline: 'Brand clients who need revisions. And licensing agreements.',
                pain: 'Multiple revision rounds, licensing terms, agency delivery chains.',
                wins: ['Commercial preset: hero → lifestyle → product detail', '3-stage delivery with revision thread built in', 'Contract with licensing terms before project begins', 'Organized delivery by category for art directors'],
              },
              {
                emoji: '👗', type: 'Fashion & Portrait',
                headline: 'Editorial sorting. Every look, every angle.',
                pain: 'Mood and aesthetic matter more than sharpness. Generic AI misses it.',
                wins: ['Fashion preset: editorial → lifestyle → detail → movement', 'Vibe chat builds a preset matching your exact aesthetic', 'AI Style Profile learns your personal selects over time', 'Lookbook delivery with branded gallery'],
              },
              {
                emoji: '✈️', type: 'Travel & Influencers',
                headline: 'Hundreds of photos every day. Multiple clients. Constant content.',
                pain: 'Volume sorting, content categorization, and social delivery all at once.',
                wins: ['Travel preset: landscape → street → food → architecture → portrait', 'Social export formatted for Instagram, Pinterest', 'AI caption suggestions based on shoot tags', 'Batch deliver to multiple brand clients'],
              },
              {
                emoji: '🎤', type: 'Event Photographers',
                headline: 'Fast turnaround. Lots of faces. Demanding organizers.',
                pain: 'Event organizers want quick delivery, selects, and proper categorization.',
                wins: ['Event preset: keynote → networking → crowd → awards', 'Client delivery within 24 hours of upload', 'AI sorts by venue, speaker, and activity type', 'Attendee face grouping (coming soon)'],
              },
            ].map(uc => (
              <div key={uc.type} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
                <div className="mb-4">
                  <span className="text-3xl">{uc.emoji}</span>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-500">{uc.type}</p>
                  <h3 className="mt-1 text-lg font-bold text-zinc-100 leading-snug">{uc.headline}</h3>
                  <p className="mt-2 text-sm text-zinc-500 italic">&ldquo;{uc.pain}&rdquo;</p>
                </div>
                <ul className="space-y-2 border-t border-zinc-800 pt-4">
                  {uc.wins.map(w => (
                    <li key={w} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check size={13} className="mt-0.5 shrink-0 text-indigo-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CLIENT EXPERIENCE
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            <ScreenPlaceholder label="Client Dashboard — Mobile View" aspect="9/16" className="mx-auto max-w-xs lg:max-w-none" />
            <div>
              <SectionLabel><Users size={12} /> Client Experience</SectionLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
                Your clients get<br />a beautiful home too.
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Send a magic link and your client is viewing their gallery in seconds — no download, no account, no friction. When they want a dashboard to track all their projects with you, one click creates their account.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Globe, title: 'Magic link gallery', desc: 'One email, instant access. Works on any device.' },
                  { icon: CheckCircle, title: 'Selection flow', desc: 'Tap to favorite. Clear status at every stage.' },
                  { icon: MessageSquare, title: 'Photo comments', desc: 'Leave notes on specific shots. Threaded replies from you.' },
                  { icon: Download, title: 'Organized downloads', desc: 'Curated ZIP with AI category folders, not a flat dump.' },
                  { icon: Bell, title: 'Status notifications', desc: 'Email + SMS updates at every milestone.' },
                  { icon: Smartphone, title: 'Full mobile experience', desc: 'Complete gallery, selection, and download on mobile.' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-indigo-400">
                      <f.icon size={15} />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{f.title}</p>
                      <p className="text-sm text-zinc-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BUSINESS WORKFLOW
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><CreditCard size={12} /> Business Workflow</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Contract to delivery.<br />Zero tab-switching.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Replace your patchwork of DocuSign, QuickBooks, Stripe, and email chains with one unified flow tied to every client profile.
            </p>
          </div>

          <div className="relative">
            {/* Flow */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5 items-center">
              {[
                { icon: FileText, label: 'Send Contract', sub: 'Template-based, customizable' },
                { icon: Check, label: 'Client Signs', sub: 'Digital signature in browser' },
                { icon: CreditCard, label: 'Invoice Sent', sub: 'Auto-generated from contract' },
                { icon: Zap, label: 'Payment Collected', sub: 'Stripe, instant' },
                { icon: FolderOpen, label: 'Project Unlocks', sub: 'Workflow begins' },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col items-center text-center gap-2 relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700 text-indigo-400">
                    <step.icon size={18} />
                  </div>
                  <p className="text-sm font-semibold text-zinc-100">{step.label}</p>
                  <p className="text-xs text-zinc-500">{step.sub}</p>
                  {i < 4 && <ChevronRight size={14} className="absolute -right-2 top-3 text-zinc-700 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Package, title: 'Package Builder', desc: 'Create session packages with photos included, extras pricing, print options, and licensing terms. One click to apply to any booking.' },
              { icon: Bell, title: 'Auto Email + SMS', desc: 'Trigger emails and texts at every milestone — invoice sent, contract signed, gallery ready, finals delivered. Fully customizable.' },
              { icon: CalendarDays, title: 'Booking Forms', desc: 'Tailored forms for every niche — Wedding, Real Estate, Commercial, Portrait. Submissions create client profiles automatically.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-indigo-400 mb-4">
                  <f.icon size={18} />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ANALYTICS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            <div>
              <SectionLabel><BarChart3 size={12} /> Analytics</SectionLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
                Know your business<br />like you know your shots.
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Track revenue, understand which packages sell, and see your client relationships grow — all tied to real Stripe data, not estimates.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { metric: 'Revenue by period', icon: TrendingUp },
                  { metric: 'Active project pipeline', icon: FolderOpen },
                  { metric: 'Client acquisition rate', icon: Users },
                  { metric: 'Package performance', icon: Package },
                  { metric: 'Gallery-to-download rate', icon: Download },
                  { metric: 'Repeat client tracking', icon: RefreshCw },
                ].map(m => (
                  <div key={m.metric} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <m.icon size={14} className="shrink-0 text-indigo-400" />
                    {m.metric}
                  </div>
                ))}
              </div>
            </div>
            <ScreenPlaceholder label="Analytics Dashboard" aspect="4/3" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Simple pricing.<br />No surprises.
            </h2>
            <p className="mt-3 text-zinc-400">Waitlist members get early access + a lifetime discount on any plan.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: 'Free', price: '$0', period: 'forever',
                desc: 'Get started and experience the AI.',
                features: ['3 projects/month', 'AI Sort (basic presets)', 'Magic link delivery', 'Client gallery view', '5 GB storage'],
                cta: 'Start Free', highlight: false,
              },
              {
                name: 'Pro', price: '$29', period: 'per month',
                desc: 'Everything a working photographer needs.',
                features: ['Unlimited projects', 'AI Sort + Vibe Chat presets', 'AI Style Profile', 'Lightroom roundtrip', '3-stage delivery flow', 'Contract + invoice', 'Booking forms', 'Analytics dashboard', '100 GB storage'],
                cta: 'Join Waitlist', highlight: true,
              },
              {
                name: 'Business', price: '$79', period: 'per month',
                desc: 'For studios and high-volume shooters.',
                features: ['Everything in Pro', 'Team accounts (5 seats)', 'Custom branding on galleries', 'Priority AI processing', 'Twilio SMS notifications', 'Advanced analytics', 'Unlimited storage', 'Dedicated support'],
                cta: 'Join Waitlist', highlight: false,
              },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl border p-7 flex flex-col ${plan.highlight ? 'border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/10 relative' : 'border-zinc-800 bg-zinc-900/40'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{plan.name}</p>
                  <div className="mt-2 flex items-end gap-1.5">
                    <span className="text-4xl font-black text-zinc-50">{plan.price}</span>
                    <span className="text-sm text-zinc-500 mb-1">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{plan.desc}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <Check size={14} className="mt-0.5 shrink-0 text-indigo-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#waitlist"
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all ${plan.highlight ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100'}`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            All plans include a 14-day free trial. No credit card required to start. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BIG WAITLIST CTA
      ═══════════════════════════════════════ */}
      <section id="waitlist" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-5xl mb-6">📸</p>
          <h2 className="text-5xl font-extrabold tracking-tight text-zinc-50 lg:text-6xl">
            Stop sorting.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Start shooting.
            </span>
          </h2>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            Join the waitlist for early access. Waitlist members get a <strong className="text-zinc-200 font-semibold">lifetime discount</strong> and are first to try every new feature.
          </p>
          <div className="mt-10 flex justify-center">
            <WaitlistForm size="large" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-950/40">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">Common questions</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-zinc-800/60 py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                  <Camera size={13} className="text-white" />
                </div>
                <span className="font-black tracking-tight text-zinc-100">View1 Sort</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">The AI-powered photographer OS. Sort by story. Deliver beautifully. Run your business.</p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'How It Works', 'Pricing', 'Changelog'] },
              { heading: 'Use Cases', links: ['Wedding', 'Real Estate', 'Commercial', 'Fashion', 'Travel'] },
              { heading: 'Company', links: ['About', 'Blog', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.heading}>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{col.heading}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800/60 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-zinc-600">© 2026 View1 Sort. All rights reserved.</p>
            <p className="text-xs text-zinc-600">Built for photographers who take their work seriously.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
