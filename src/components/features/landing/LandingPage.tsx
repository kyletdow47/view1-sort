'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { VideoBackground } from './VideoBackground'
import { ScrollCard } from './ScrollCard'
import {
  Sparkles, Brain, Layers, Send, Users, BarChart3, CalendarDays,
  FileText, Smartphone, CheckCircle, ArrowRight, Camera,
  FolderOpen, CreditCard, Mail, Bell, Shield,
  Download, Eye, MessageSquare, RefreshCw, Palette, Clock,
  TrendingUp, Package, ChevronDown, Monitor,
  Check, X, Globe, Scissors, Link as LinkIcon, Lock, Heart,
  Target, Zap, PenLine, Home, Plane, Mic, Star,
  ClipboardList, Image, SlidersHorizontal, Cpu, Repeat,
  LayoutGrid, Wallet, MapPin, UserCheck, Wand2,
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] text-white/80">
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
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all appearance-none"
          >
            <option value="">Photography type</option>
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
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={`flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all ${size === 'large' ? 'py-4' : 'py-3'}`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`shrink-0 rounded-xl bg-white px-6 font-semibold text-zinc-900 transition-all hover:bg-zinc-200 shadow-[0_4px_20px_rgba(255,255,255,0.12)] disabled:opacity-60 ${size === 'large' ? 'py-4 text-base' : 'py-3 text-sm'}`}
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
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-1.5 border-b border-white/10 px-3">
        <div className="h-2 w-2 rounded-full bg-white/30" />
        <div className="h-2 w-2 rounded-full bg-white/30" />
        <div className="h-2 w-2 rounded-full bg-white/30" />
        <div className="mx-3 flex-1 rounded-md bg-white/10 h-3.5" />
      </div>
      <div className="absolute inset-0 mt-8 opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 mt-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08] text-white/80 border border-white/15">
          <Monitor size={20} />
        </div>
        <span className="text-xs font-medium text-zinc-500 tracking-wider uppercase">{label}</span>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section label
───────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
      {children}
    </span>
  )
}

/* ─────────────────────────────────────────────
   FAQ
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
    <div className="divide-y divide-white/10">
      {FAQS.map((faq, i) => (
        <div key={i} className="py-5">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 text-left">
            <span className="font-medium text-zinc-100">{faq.q}</span>
            <ChevronDown size={16} className={`shrink-0 text-white/50 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <p className="mt-3 text-sm leading-relaxed text-zinc-400">{faq.a}</p>}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Marquee items
───────────────────────────────────────────── */
const MARQUEE_ITEMS: { icon: React.ElementType; label: string }[] = [
  { icon: Brain, label: 'AI Story Sorting' },
  { icon: Scissors, label: 'Smart Culling' },
  { icon: Wand2, label: 'Vibe Chat Presets' },
  { icon: RefreshCw, label: 'Lightroom Roundtrip' },
  { icon: LinkIcon, label: 'Magic Link Delivery' },
  { icon: ClipboardList, label: 'Client Selection Flow' },
  { icon: FileText, label: 'Contract + Invoice' },
  { icon: BarChart3, label: 'Financial Analytics' },
  { icon: CalendarDays, label: 'Booking Forms' },
  { icon: Smartphone, label: 'Mobile Companion' },
  { icon: Palette, label: 'Watermark Studio' },
  { icon: Download, label: 'ZIP Export by Category' },
  { icon: Cpu, label: 'AI Style Profile' },
  { icon: Bell, label: 'Auto Email + SMS' },
  { icon: CalendarDays, label: 'Calendar Sync' },
]

/* ─────────────────────────────────────────────
   Feature tabs
───────────────────────────────────────────── */
const FEATURE_TABS = [
  { id: 'ai', label: 'AI Sort', icon: Brain },
  { id: 'gallery', label: 'Gallery & Delivery', icon: Image },
  { id: 'business', label: 'Business', icon: Wallet },
  { id: 'mobile', label: 'Mobile & Analytics', icon: Smartphone },
]

const FEATURES_BY_TAB: Record<string, { icon: React.ElementType; title: string; desc: string }[]> = {
  ai: [
    { icon: Brain, title: 'AI Story Sorting', desc: 'Sorts by narrative arc and emotional weight. Understands the context of your shoot, not just pixel quality.' },
    { icon: Scissors, title: 'Smart Culling', desc: 'Auto-flags blurry, duplicate, closed-eye, and blown exposure shots before sorting begins. You review, you decide.' },
    { icon: Wand2, title: 'Vibe Chat Presets', desc: 'Describe your aesthetic in plain language. The AI builds a reusable sorting preset from your conversation.' },
    { icon: RefreshCw, title: 'Lightroom Roundtrip', desc: 'Edit in Lightroom, reopen View1, and edited files auto-sync back. Original always preserved and accessible.' },
    { icon: Cpu, title: 'AI Style Profile', desc: 'Learns your personal aesthetic across projects. After 5 shoots, it starts sorting like you — not like everyone.' },
  ],
  gallery: [
    { icon: LinkIcon, title: 'Magic Link Delivery', desc: 'Clients view galleries via email link — no account required. Beautiful, branded, instant.' },
    { icon: ClipboardList, title: '3-Stage Delivery', desc: 'Preselection → client selection → finals. A structured flow that keeps both parties perfectly in sync.' },
    { icon: MessageSquare, title: 'Photo Comments', desc: 'Clients and photographers leave threaded comments on individual photos, with revision request categories.' },
    { icon: Palette, title: 'Watermark Studio', desc: 'Upload your logo, configure placement, size, and opacity. Applied on delivery — never burns into stored files.' },
    { icon: Download, title: 'ZIP Export by Category', desc: 'Client downloads are organized by AI category folders — not a flat dump of 1,400 JPEGs.' },
  ],
  business: [
    { icon: FileText, title: 'Contract + Invoice', desc: 'Send contract, collect signature, auto-generate a Stripe invoice — all in one thread per client.' },
    { icon: Package, title: 'Package Builder', desc: 'Create reusable packages with pricing, photo counts, extras, and licensing. Auto-populates invoices.' },
    { icon: ClipboardList, title: 'Booking Forms', desc: 'Tailored forms for every niche. Submissions create client profiles and draft projects automatically.' },
    { icon: Bell, title: 'Auto Email + SMS', desc: 'Trigger emails and texts at every milestone — signed, paid, gallery ready, finals delivered.' },
    { icon: BarChart3, title: 'Business Analytics', desc: 'Revenue by period, client acquisition, package performance, repeat client rate — all from real Stripe data.' },
  ],
  mobile: [
    { icon: Smartphone, title: 'On-Set Mobile Companion', desc: 'Shot list, notes, client info on set. Auto-syncs everything to the project when you reopen after the shoot.' },
    { icon: Bell, title: 'Client Push Notifications', desc: 'PWA push notifications for clients when gallery is ready, selection is needed, or finals are delivered.' },
    { icon: CalendarDays, title: 'Smart Calendar', desc: 'Drag-to-move events, Google + Apple sync. Shoots auto-created from booking form submissions.' },
    { icon: TrendingUp, title: 'Revenue Dashboard', desc: 'Track earnings, active projects, and client pipeline from anywhere — fully mobile-optimized.' },
  ],
}

function FeatureTabs() {
  const [active, setActive] = useState('ai')
  const features = FEATURES_BY_TAB[active] ?? []

  return (
    <div>
      {/* Tab bar */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex gap-1 rounded-2xl border border-white/15 bg-white/[0.04] p-1.5">
          {FEATURE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                active === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const rotations = [-3, 2.5, -4, 3.5, -2]
          const depths = [1.2, 1.5, 1, 1.3, 1.6]
          return (
            <ScrollCard key={f.title} rotation={rotations[i % rotations.length]} depth={depths[i % depths.length]}>
              <div className="group rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:border-white/30 hover:bg-white/[0.12] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-all group-hover:bg-white/15">
                  <f.icon size={18} />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            </ScrollCard>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Use case tabs
───────────────────────────────────────────── */
const USE_CASES = [
  {
    id: 'wedding', label: 'Wedding', icon: Heart,
    headline: '1,200 photos. 6 hours. One deadline.',
    subhead: 'You shoot 8-hour days and come home to days of sorting. Clients wait weeks.',
    screenshot: 'Wedding Gallery Delivery',
    wins: [
      { icon: Brain, text: 'AI sorts entire wedding by narrative arc: ceremony → portraits → reception' },
      { icon: Send, text: 'Preselection gallery live within hours of the shoot' },
      { icon: ClipboardList, text: 'Client selects favorites — you only edit what matters' },
      { icon: LinkIcon, text: 'Magic link delivery — no file transfer apps or Dropbox' },
      { icon: FileText, text: 'Contract signed and deposit collected before you show up' },
    ],
  },
  {
    id: 'realestate', label: 'Real Estate', icon: Home,
    headline: 'Three properties a day. Delivered by 5pm.',
    subhead: 'Turnaround is everything. Manual sorting and emailing kills your margin.',
    screenshot: 'Real Estate Sort View',
    wins: [
      { icon: LayoutGrid, text: 'Preset: exterior hero → rooms by size → detail textures' },
      { icon: Send, text: 'Auto-delivery to agent or homeowner after sort is complete' },
      { icon: Palette, text: 'Watermarked previews unlock on payment — automatic' },
      { icon: CreditCard, text: 'Invoice auto-sent after gallery delivered, Stripe handles the rest' },
      { icon: MapPin, text: 'Location-tagged projects for real estate portfolio tracking' },
    ],
  },
  {
    id: 'commercial', label: 'Commercial', icon: Star,
    headline: 'Brand clients, revision rounds, licensing.',
    subhead: 'Multiple revision rounds, licensing terms, agency delivery chains.',
    screenshot: 'Commercial Project View',
    wins: [
      { icon: LayoutGrid, text: 'Preset: hero shots → lifestyle → product detail → rejects' },
      { icon: MessageSquare, text: '3-stage delivery with revision thread built in' },
      { icon: FileText, text: 'Contract with licensing terms before project begins' },
      { icon: Download, text: 'Organized ZIP by category for art directors' },
      { icon: BarChart3, text: 'Per-project analytics — which assets got downloaded most' },
    ],
  },
  {
    id: 'fashion', label: 'Fashion', icon: Wand2,
    headline: 'Editorial sorting. Every look, every angle.',
    subhead: 'Mood and aesthetic matter more than sharpness. Generic AI misses it.',
    screenshot: 'Fashion Sort by Vibe',
    wins: [
      { icon: LayoutGrid, text: 'Preset: editorial → lifestyle → detail → movement' },
      { icon: Wand2, text: 'Vibe chat builds a preset matching your exact aesthetic' },
      { icon: Cpu, text: 'AI Style Profile learns your personal selects over time' },
      { icon: LinkIcon, text: 'Lookbook-style gallery delivery for clients' },
      { icon: Layers, text: 'Category tags editable after sort — fine-tune every folder' },
    ],
  },
  {
    id: 'travel', label: 'Travel', icon: Plane,
    headline: 'Hundreds of photos. Multiple clients. Daily.',
    subhead: 'Volume sorting, content categorization, and social delivery all at once.',
    screenshot: 'Travel Content Sort',
    wins: [
      { icon: LayoutGrid, text: 'Preset: landscape → street → food → architecture → portrait' },
      { icon: Sparkles, text: 'AI caption suggestions based on shoot tags and location' },
      { icon: Send, text: 'Batch deliver to multiple brand clients simultaneously' },
      { icon: Smartphone, text: 'Mobile-first workflow — sort and deliver from anywhere' },
      { icon: Download, text: 'Social export formatted for Instagram, Pinterest, and more' },
    ],
  },
  {
    id: 'events', label: 'Events', icon: Mic,
    headline: 'Fast turnaround. Lots of faces. Demanding organizers.',
    subhead: 'Event organizers want quick delivery, selects, and proper categorization.',
    screenshot: 'Event Gallery View',
    wins: [
      { icon: LayoutGrid, text: 'Preset: keynote → networking → crowd → speakers → awards' },
      { icon: Send, text: 'Client delivery within 24 hours of upload' },
      { icon: Brain, text: 'AI sorts by venue, speaker, and activity type automatically' },
      { icon: Users, text: 'Attendee face grouping and tagging (coming soon)' },
      { icon: FileText, text: 'Invoice and contract templates built for event photography' },
    ],
  },
]

function UseCaseTabs() {
  const [active, setActive] = useState('wedding')
  const uc = USE_CASES.find(u => u.id === active) ?? USE_CASES[0]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex gap-1 rounded-2xl border border-white/15 bg-white/[0.04] p-1.5 flex-wrap justify-center">
          {USE_CASES.map(u => (
            <button
              key={u.id}
              onClick={() => setActive(u.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active === u.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:text-zinc-300'
              }`}
            >
              <u.icon size={13} />
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        {/* Left — details */}
        <div className="rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/80 border border-white/15">
              <uc.icon size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{uc.label} Photography</p>
              <h3 className="text-lg font-bold text-zinc-100 leading-snug">{uc.headline}</h3>
            </div>
          </div>
          <p className="text-sm text-zinc-500 italic border-l-2 border-white/15 pl-3 mb-6">&ldquo;{uc.subhead}&rdquo;</p>
          <ul className="space-y-3">
            {uc.wins.map((w, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white/80 mt-0.5">
                  <w.icon size={13} />
                </div>
                <span className="text-sm text-zinc-300 leading-relaxed">{w.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — screenshot */}
        <ScreenPlaceholder label={uc.screenshot} aspect="4/3" className="h-full" />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen text-zinc-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');`}</style>
      <VideoBackground />

      <div className="relative z-10">
      {/* ── NAV ── */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-black/40 backdrop-blur-xl' : ''}`}>
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
            <Link href="/auth/login" className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 md:block">Sign In</Link>
            <a href="https://photo-sorter-theta.vercel.app/dashboard" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.04] backdrop-blur-xl px-4 py-2 text-sm font-medium text-white/80 transition-all hover:border-white/30 hover:bg-white/[0.06] md:flex">
              Open App <ArrowRight size={13} />
            </a>
            <a href="#waitlist" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-200 shadow-[0_4px_20px_rgba(255,255,255,0.12)]">Get Early Access</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-sm font-medium text-white/80">
            <Sparkles size={13} />
            Now in private early access — join the waitlist
            <ArrowRight size={13} />
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            The AI That Thinks
            <br />
            <span className="text-white">
              Like a Photographer
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            View1 Sort doesn&apos;t just cull blurry photos. It understands the <em className="text-zinc-300 not-italic font-medium">narrative arc</em> of your shoot — sorting by story and emotion, not just sharpness scores. Then delivers, invoices, and runs your entire photography business.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <WaitlistForm size="default" />
            <a
              href="https://photo-sorter-theta.vercel.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <Monitor size={14} />
              Already have access? Open the app
              <ArrowRight size={13} />
            </a>
          </div>

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

          <div className="relative mt-16">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <ScreenPlaceholder label="AI Sort Dashboard" aspect="16/9" className="relative shadow-2xl shadow-black/60 ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="border-y border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] py-4 overflow-hidden">
        <div className="flex gap-3 whitespace-nowrap" style={{ animation: 'marquee 35s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-400"
            >
              <item.icon size={11} className="text-white/80" />
              {item.label}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              You became a photographer to shoot,<br />not to manage files.
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">After every shoot, the real work begins — and it takes forever.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Clock, title: '6–12 hours', sub: 'Average time spent culling and sorting a single wedding shoot', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
              { icon: Mail, title: '20+ emails', sub: 'Back-and-forth with clients before finals are delivered', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
              { icon: Package, title: '4 tools', sub: 'Average number of apps to run one photography project end-to-end', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
            ].map(p => (
              <div key={p.title} className={`rounded-2xl border p-6 ${p.border} ${p.bg}`}>
                <p.icon size={24} className={p.color} />
                <p className={`mt-3 text-3xl font-black ${p.color}`}>{p.title}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { icon: FolderOpen, text: 'Manually dragging photos into folders named "maybe" and "definitely"' },
              { icon: LinkIcon, text: 'Sending 5GB Dropbox links that expire and confuse clients' },
              { icon: CreditCard, text: 'Chasing invoice payments through three different apps' },
              { icon: RefreshCw, text: 'Re-exporting the same gallery three times after revision emails' },
              { icon: ClipboardList, text: 'Building shot lists in Notes.app and losing them on set' },
              { icon: FileText, text: 'Copy-pasting client details into contracts, invoices, and emails separately' },
            ].map(pain => (
              <div key={pain.text} className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 mt-0.5">
                  <pain.icon size={13} />
                </div>
                <span className="text-sm text-zinc-400">{pain.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI DIFFERENCE ── */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><Brain size={12} /> The AI Difference</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">Sort by story. Not just sharpness.</h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">Every other AI tool asks "is this photo technically good?" We ask "does this photo matter?"</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Everyone Else</p>
              <div className="space-y-3">
                {['Reject blurry images', 'Reject closed eyes', 'Reject bad exposure', 'Sort by quality score', 'Ignore context and emotion'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                      <X size={11} className="text-red-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/[0.1] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80 mb-4">View1 Sort</p>
              <div className="space-y-3">
                {[
                  'Smart cull + photographer review before sort',
                  'Sort by narrative arc and emotional weight',
                  'Understand shoot context from your description',
                  'Vibe presets built through natural language chat',
                  'AI Style Profile learns your personal aesthetic',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-100">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                      <Check size={11} className="text-white/80" />
                    </div>
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

      {/* ── HOW IT WORKS ── */}
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
                desc: 'Tell the AI what you shot — vibe, priorities, what to reject. Upload your photos. Smart culling runs first, then AI sorts into story-based categories.',
                items: [
                  { icon: Target, text: 'Shoot context feeds the AI' },
                  { icon: Scissors, text: 'Smart cull removes obvious rejects' },
                  { icon: FolderOpen, text: 'Sorted into narrative categories' },
                ],
              },
              {
                step: '02', icon: Send, title: 'Deliver to Clients',
                desc: 'Send a preselection gallery via magic link. Client selects favorites and comments. You edit in Lightroom, reopen View1, and finals auto-sync.',
                items: [
                  { icon: LinkIcon, text: 'Magic link — no app needed' },
                  { icon: MessageSquare, text: 'Per-photo comments' },
                  { icon: RefreshCw, text: 'Lightroom roundtrip sync' },
                ],
              },
              {
                step: '03', icon: CreditCard, title: 'Get Paid & Close',
                desc: 'Client downloads their curated ZIP organized by category. Stripe invoice auto-generated. Contract, payment, and delivery history all in one profile.',
                items: [
                  { icon: Download, text: 'ZIP by AI category' },
                  { icon: CreditCard, text: 'Stripe invoice + receipt' },
                  { icon: Shield, text: 'Full audit trail' },
                ],
              },
            ].map(step => (
              <div key={step.step} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-5xl font-black text-zinc-800">{step.step}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/80 border border-white/15">
                    <step.icon size={18} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{step.desc}</p>
                <ul className="space-y-2">
                  {step.items.map(item => (
                    <li key={item.text} className="flex items-center gap-2.5 text-sm text-zinc-500">
                      <item.icon size={13} className="shrink-0 text-white/80" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIBE PRESET BUILDER ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            <div>
              <SectionLabel><Wand2 size={12} /> Vibe Preset Builder</SectionLabel>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
                Build your AI preset<br />by just describing it.
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Chat with the AI to build a sorting preset that matches your exact aesthetic. It asks about your niche, priorities, what mood you&apos;re going for, and what you always reject. The result? A personal preset that sorts like <em className="text-zinc-200 not-italic font-medium">you</em>.
              </p>

              <div className="mt-8 rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-5 space-y-3">
                {[
                  { role: 'ai', msg: 'What kind of shoot is this?' },
                  { role: 'user', msg: 'Luxury real estate in Miami. Ocean-facing penthouse, lots of golden hour light.' },
                  { role: 'ai', msg: 'Perfect. What should I prioritize — exterior hero shots, room-by-room interiors, or lifestyle details?' },
                  { role: 'user', msg: 'Exterior heroes first, then rooms by size, then texture and detail shots.' },
                  { role: 'ai', msg: 'What do you always reject immediately?' },
                  { role: 'user', msg: 'Bad window glare, construction mess, anything with a crew member in frame.' },
                  { role: 'ai', msg: 'Preset "Miami Luxury RE" created — 6 categories, 4 rejection rules. Apply to project?' },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-white/[0.08] text-zinc-200' : 'bg-white text-zinc-900'}`}>
                      {msg.msg}
                    </div>
                  </div>
                ))}
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  { icon: LayoutGrid, text: '6 built-in niche presets to start immediately' },
                  { icon: Wand2, text: 'Chat to customize or build a preset from scratch' },
                  { icon: Zap, text: 'Inline prompt available on every project' },
                  { icon: FolderOpen, text: 'Presets saved to your library and fully reusable' },
                ].map(f => (
                  <li key={f.text} className="flex items-center gap-3 text-sm text-zinc-300">
                    <f.icon size={14} className="shrink-0 text-white/80" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <ScreenPlaceholder label="Presets Library" aspect="3/4" />
          </div>
        </div>
      </section>

      {/* ── GALLERY DELIVERY ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><Image size={12} /> Gallery & Delivery</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">Three stages. Zero confusion.</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">A structured delivery flow that keeps photographer and client perfectly in sync — from first look to final download.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
            {[
              {
                icon: Eye, stage: 'Stage 1', title: 'Preselection',
                desc: 'After culling and AI sort, share the gallery. Client views and comments. Nothing is downloadable yet.',
                color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5',
                items: [{ icon: Camera, text: 'Full AI-sorted gallery' }, { icon: MessageSquare, text: 'Per-photo comments' }, { icon: Lock, text: 'Download locked' }],
              },
              {
                icon: CheckCircle, stage: 'Stage 2', title: 'Client Selection',
                desc: 'Client favorites the photos they want. You see exactly what they chose and take it to Lightroom.',
                color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/5',
                items: [{ icon: Heart, text: 'Client favorites' }, { icon: ClipboardList, text: 'Selection summary' }, { icon: Palette, text: 'You edit in Lightroom' }],
              },
              {
                icon: Download, stage: 'Stage 3', title: 'Finals',
                desc: 'Re-upload edited files. Client downloads ZIP by category, or opens a revision thread.',
                color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5',
                items: [{ icon: Download, text: 'ZIP by category' }, { icon: PenLine, text: 'Revision requests' }, { icon: CheckCircle, text: 'Or just download' }],
              },
            ].map(s => (
              <div key={s.stage} className={`rounded-2xl border p-6 ${s.border} ${s.bg}`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${s.color} mb-3`}>
                  <s.icon size={14} />
                  {s.stage} — {s.title}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2">
                  {s.items.map(item => (
                    <li key={item.text} className="flex items-center gap-2 text-xs text-zinc-500">
                      <item.icon size={12} className="shrink-0 text-zinc-600" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <ScreenPlaceholder label="Client Gallery — Stage 2 Selection" aspect="21/9" />
        </div>
      </section>

      {/* ── FEATURES (TABBED) ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <SectionLabel>Every Feature</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              One platform. Every tool<br />a photographer needs.
            </h2>
          </div>
          <FeatureTabs />
        </div>
      </section>

      {/* ── USE CASES (TABBED) ── */}
      <section id="use-cases" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <SectionLabel>Use Cases</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Built for every photographer<br />who shoots at volume.
            </h2>
          </div>
          <UseCaseTabs />
        </div>
      </section>

      {/* ── CLIENT EXPERIENCE ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><Users size={12} /> Client Experience</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Your clients get<br />a beautiful home too.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Send a magic link and your client is viewing their gallery in seconds. No download, no account, no friction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <ScreenPlaceholder label="Client Dashboard — Desktop" aspect="4/3" />
            <ScreenPlaceholder label="Client Gallery — Mobile View" aspect="4/3" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Globe, title: 'Magic link gallery', desc: 'One email, instant access. Works on any device, no account required.' },
              { icon: CheckCircle, title: 'Selection flow', desc: 'Tap to favorite. Clear status at every stage of delivery.' },
              { icon: MessageSquare, title: 'Photo comments', desc: 'Leave notes on specific shots. Threaded replies from the photographer.' },
              { icon: Download, title: 'Organized downloads', desc: 'Curated ZIP with AI category folders — not a flat dump of files.' },
              { icon: Bell, title: 'Status notifications', desc: 'Email + SMS updates at every milestone automatically.' },
              { icon: Smartphone, title: 'Full mobile experience', desc: 'Complete gallery, selection, comments, and download on mobile.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white/80">
                  <f.icon size={16} />
                </div>
                <div>
                  <p className="font-medium text-zinc-100 mb-0.5">{f.title}</p>
                  <p className="text-sm text-zinc-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUSINESS WORKFLOW ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionLabel><CreditCard size={12} /> Business Workflow</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
              Contract to delivery.<br />Zero tab-switching.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Replace DocuSign, QuickBooks, Stripe, and email chains with one unified flow tied to every client profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 items-center mb-12">
            {[
              { icon: FileText, label: 'Send Contract', sub: 'Template-based' },
              { icon: UserCheck, label: 'Client Signs', sub: 'Digital signature' },
              { icon: CreditCard, label: 'Invoice Sent', sub: 'Auto-generated' },
              { icon: Zap, label: 'Payment Collected', sub: 'Stripe, instant' },
              { icon: FolderOpen, label: 'Project Unlocks', sub: 'Workflow begins' },
            ].map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] border border-white/15 text-white/80">
                  <step.icon size={18} />
                </div>
                <p className="text-sm font-semibold text-zinc-100">{step.label}</p>
                <p className="text-xs text-zinc-500">{step.sub}</p>
                {i < 4 && <ArrowRight size={14} className="absolute -right-2 top-3 text-white/30 hidden md:block" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Package, title: 'Package Builder', desc: 'Create session packages with photos included, extras pricing, print options, and licensing terms.', rot: -4, dep: 1.2 },
              { icon: Bell, title: 'Auto Email + SMS', desc: 'Trigger emails and texts at every milestone — invoice sent, contract signed, gallery ready, finals delivered.', rot: 2.5, dep: 1.5 },
              { icon: ClipboardList, title: 'Booking Forms', desc: 'Tailored forms for every niche. Submissions create client profiles and draft projects automatically.', rot: -3, dep: 1 },
            ].map(f => (
              <ScrollCard key={f.title} rotation={f.rot} depth={f.dep}>
                <div className="rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 mb-4">
                    <f.icon size={18} />
                  </div>
                  <h3 className="font-semibold text-zinc-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ── */}
      <section className="py-24 px-6">
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
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: TrendingUp, text: 'Revenue by period' },
                  { icon: FolderOpen, text: 'Active project pipeline' },
                  { icon: Users, text: 'Client acquisition rate' },
                  { icon: Package, text: 'Package performance' },
                  { icon: Download, text: 'Gallery-to-download rate' },
                  { icon: RefreshCw, text: 'Repeat client tracking' },
                ].map(m => (
                  <div key={m.text} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <m.icon size={14} className="shrink-0 text-white/80" />
                    {m.text}
                  </div>
                ))}
              </div>
            </div>
            <ScreenPlaceholder label="Analytics Dashboard" aspect="4/3" />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">Simple pricing.<br />No surprises.</h2>
            <p className="mt-3 text-zinc-400">Waitlist members get early access + a lifetime discount on any plan.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: 'Free', price: '$0', period: 'forever',
                desc: 'Get started and experience the AI.',
                features: ['3 projects/month', 'AI Sort (basic presets)', 'Magic link delivery', 'Client gallery view', '5 GB storage'],
                cta: 'Start Free', highlight: false, rot: 3, dep: 1.2,
              },
              {
                name: 'Pro', price: '$29', period: 'per month',
                desc: 'Everything a working photographer needs.',
                features: ['Unlimited projects', 'AI Sort + Vibe Chat presets', 'AI Style Profile', 'Lightroom roundtrip', '3-stage delivery flow', 'Contract + invoice', 'Booking forms', 'Analytics dashboard', '100 GB storage'],
                cta: 'Join Waitlist', highlight: true, rot: -2, dep: 1.8,
              },
              {
                name: 'Business', price: '$79', period: 'per month',
                desc: 'For studios and high-volume shooters.',
                features: ['Everything in Pro', 'Team accounts (5 seats)', 'Custom gallery branding', 'Priority AI processing', 'SMS notifications', 'Advanced analytics', 'Unlimited storage', 'Dedicated support'],
                cta: 'Join Waitlist', highlight: false, rot: -4, dep: 1,
              },
            ].map(plan => (
              <ScrollCard key={plan.name} rotation={plan.rot} depth={plan.dep}>
                <div className={`rounded-2xl border p-7 flex flex-col relative backdrop-blur-2xl ${plan.highlight ? 'border-white/30 bg-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]' : 'border-white/20 bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]'}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-xs font-bold text-zinc-900">Most Popular</div>
                  )}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{plan.name}</p>
                    <div className="mt-2 flex items-end gap-1.5">
                      <span className="text-4xl font-black text-zinc-50">{plan.price}</span>
                      <span className="text-sm text-zinc-500 mb-1">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{plan.desc}</p>
                  </div>
                  <ul className="flex-1 space-y-2.5 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <Check size={14} className="mt-0.5 shrink-0 text-white/60" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#waitlist" className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all ${plan.highlight ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'border border-white/20 text-zinc-300 hover:border-white/40 hover:text-zinc-100'}`}>
                    {plan.cta}
                  </a>
                </div>
              </ScrollCard>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-zinc-500">All plans include a 14-day free trial. No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ── WAITLIST CTA ── */}
      <section id="waitlist" className="py-32 px-6 relative overflow-hidden">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.08] text-white/80 border border-white/15">
              <Camera size={28} />
            </div>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight text-zinc-50 lg:text-6xl">
            Stop sorting.
            <br />
            <span className="text-white">Start shooting.</span>
          </h2>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            Join the waitlist for early access. Waitlist members get a <strong className="text-zinc-200 font-semibold">lifetime discount</strong> and are first to try every new feature.
          </p>
          <div className="mt-10 flex justify-center">
            <WaitlistForm size="large" />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">Common questions</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-12 px-6">
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
          <div className="border-t border-white/10 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-zinc-600">© 2026 View1 Sort. All rights reserved.</p>
            <p className="text-xs text-zinc-600">Built for photographers who take their work seriously.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
