'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Camera, ArrowRight, Check, CircleCheck,
  Globe, Scissors, RefreshCw, Sparkles,
  Heart, Home, Star, Plane, Zap,
  Download, MousePointer, Send, FileText,
  Monitor, Settings, Wand2, Image as ImageIcon,
  Briefcase, Smartphone, SquareCheck, Link as LinkIcon,
} from 'lucide-react'

/* ─── Design tokens (zinc palette dark) ─────────────────── */
const BG       = '#0D0E14'
const SURF_LOW = '#13141C'
const SURF     = '#1A1B26'
const TEXT     = '#E0E7FF'
const BORDER   = '#2A2A35'
const PRIMARY  = '#4F46E5'
const P10      = '#4F46E51A'
const MUTED    = '#6B7280'
const TEAL     = '#95D1D1'
const GREEN    = '#10B981'
const INDIGO_L = '#818CF8'
const DARK888  = '#888888'

/* ─── Shared styles ─────────────────────────────────────── */
const geist  = { fontFamily: 'Geist, sans-serif' }
const inter  = { fontFamily: 'Inter, sans-serif' }
const card   = { background: P10, border: `1px solid ${BORDER}`, borderRadius: 16 }
const cardSm = { background: P10, border: `1px solid ${BORDER}`, borderRadius: 12 }

/* ─── App mockup placeholder ────────────────────────────── */
function Mockup({ label, height = 280, radius = 12 }: { label: string; height?: number; radius?: number }) {
  return (
    <div style={{ height, borderRadius: radius, border: `1px solid ${BORDER}`, background: P10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}
      className="w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3" style={{ opacity: 0.35 }}>
        <Monitor size={36} color={TEXT} />
        <span style={{ ...geist, color: TEXT, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
      </div>
    </div>
  )
}

/* ─── Icon box ───────────────────────────────────────────── */
function IconBox({ icon: Icon, size = 22, color = PRIMARY }: { icon: React.ElementType; size?: number; color?: string }) {
  return (
    <div style={{ width: 48, height: 48, borderRadius: 12, background: P10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={size} color={color} />
    </div>
  )
}

/* ─── Section badge ──────────────────────────────────────── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', background: P10, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '8px 20px' }}>
      <span style={{ ...geist, color: TEXT, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>{children}</span>
    </div>
  )
}

/* ─── Feature Tabs ───────────────────────────────────────── */
const TABS = [
  { id: 'ai',       label: 'AI Sort',             icon: Globe },
  { id: 'gallery',  label: 'Gallery & Delivery',   icon: ImageIcon },
  { id: 'business', label: 'Business',             icon: Briefcase },
  { id: 'mobile',   label: 'Mobile & Analytics',   icon: Smartphone },
]

type FeatureCard = { icon: React.ElementType; title: string; desc: string }

const FEATURE_CARDS: Record<string, FeatureCard[]> = {
  ai: [
    { icon: Settings,  title: 'AI Story Sorting',      desc: 'Sorts by narrative arc and emotional weight. Understands the context of your shoot, not just pixel quality.' },
    { icon: Scissors,  title: 'Smart Culling',          desc: 'Auto-flags blurry, duplicate, closed-eye, and blown exposure shots before sorting begins. You review, you decide.' },
    { icon: Wand2,     title: 'Vibe Chat Presets',      desc: 'Describe your aesthetic in plain language. The AI builds a reusable sorting preset from your conversation.' },
    { icon: RefreshCw, title: 'Lightroom Roundtrip',    desc: 'Edit in Lightroom, reopen View1, and edited files auto-sync back. Original always preserved and accessible.' },
    { icon: Sparkles,  title: 'AI Style Profile',       desc: 'Learns your personal aesthetic across projects. After 5 shoots, it starts sorting like you — not like everyone.' },
  ],
  gallery: [
    { icon: LinkIcon,     title: 'Magic Link Delivery',  desc: 'Clients view galleries via email link — no account required. Beautiful, branded, instant.' },
    { icon: SquareCheck,  title: '3-Stage Delivery',     desc: 'Preselection → client selection → finals. A structured flow that keeps both parties perfectly in sync.' },
    { icon: Download,     title: 'ZIP Export by Category', desc: 'Client downloads are organized by AI category folders — not a flat dump of 1,400 JPEGs.' },
    { icon: ImageIcon,    title: 'Watermark Studio',     desc: 'Upload your logo, configure placement, size, and opacity. Applied on delivery — never burns into stored files.' },
    { icon: Globe,        title: 'Branded Galleries',    desc: 'Custom colors, logo, and domain. Every gallery feels like your brand, not a generic platform.' },
  ],
  business: [
    { icon: FileText,  title: 'Contract + Invoice',   desc: 'Send contract, collect signature, auto-generate a Stripe invoice — all in one thread per client.' },
    { icon: Briefcase, title: 'Package Builder',       desc: 'Create reusable packages with pricing, photo counts, extras, and licensing. Auto-populates invoices.' },
    { icon: Send,      title: 'Booking Forms',         desc: 'Tailored forms for every niche. Submissions create client profiles and draft projects automatically.' },
    { icon: Zap,       title: 'Auto Email + SMS',      desc: 'Trigger emails and texts at every milestone — signed, paid, gallery ready, finals delivered.' },
    { icon: Settings,  title: 'Business Analytics',   desc: 'Revenue by period, client acquisition, package performance, repeat client rate — all from real Stripe data.' },
  ],
  mobile: [
    { icon: Smartphone, title: 'On-Set Mobile',          desc: 'Shot list, notes, client info on set. Auto-syncs everything to the project when you reopen after the shoot.' },
    { icon: Zap,        title: 'Push Notifications',     desc: 'PWA push notifications for clients when gallery is ready, selection is needed, or finals are delivered.' },
    { icon: RefreshCw,  title: 'Smart Calendar',         desc: 'Drag-to-move events, Google + Apple sync. Shoots auto-created from booking form submissions.' },
    { icon: Settings,   title: 'Revenue Dashboard',      desc: 'Track earnings, active projects, and client pipeline from anywhere — fully mobile-optimized.' },
  ],
}

function FeatureTabs() {
  const [active, setActive] = useState('ai')
  const cards = FEATURE_CARDS[active] ?? []
  const row1 = cards.slice(0, 3)
  const row2 = cards.slice(3)

  return (
    <div className="flex flex-col gap-14">
      {/* Tab bar */}
      <div className="flex justify-center">
        <div style={{ background: SURF_LOW, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 4, display: 'inline-flex', gap: 0 }}>
          {TABS.map(tab => {
            const on = active === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderRadius: 36, padding: '12px 24px',
                  background: on ? PRIMARY : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <tab.icon size={16} color={on ? SURF : MUTED} />
                <span style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 500 }}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {row1.map(c => <FeatureCard key={c.title} {...c} />)}
        </div>
        {row2.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {row2.map(c => <FeatureCard key={c.title} {...c} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: FeatureCard) {
  return (
    <div style={{ ...card, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <IconBox icon={Icon} />
      <p style={{ ...geist, color: TEXT, fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</p>
      <p style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 400, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

/* ─── Use Case Tabs ──────────────────────────────────────── */
type UseCase = {
  id: string; label: string; icon: React.ElementType
  category: string; headline: string; quote: string
  features: { icon: React.ElementType; text: string }[]
}

const USE_CASES: UseCase[] = [
  {
    id: 'wedding', label: 'Wedding', icon: Heart,
    category: 'WEDDING PHOTOGRAPHY',
    headline: '1,200 photos. 6 hours.\nOne deadline.',
    quote: '"You shoot 8–hour days and come home to days of sorting. Clients wait weeks."',
    features: [
      { icon: Settings,    text: 'AI sorts entire wedding by narrative arc: ceremony → portraits → reception' },
      { icon: Send,        text: 'Preselection gallery live within hours of the shoot' },
      { icon: SquareCheck, text: 'Client selects favorites — you only edit what matters' },
      { icon: LinkIcon,    text: 'Magic link delivery — no file transfer apps or Dropbox' },
      { icon: FileText,    text: 'Contract signed and deposit collected before you show up' },
    ],
  },
  {
    id: 'realestate', label: 'Real Estate', icon: Home,
    category: 'REAL ESTATE PHOTOGRAPHY',
    headline: 'Three properties a day.\nDelivered by 5pm.',
    quote: '"Turnaround is everything. Manual sorting and emailing kills your margin."',
    features: [
      { icon: Settings,    text: 'Preset: exterior hero → rooms by size → detail textures' },
      { icon: Send,        text: 'Auto-delivery to agent or homeowner after sort is complete' },
      { icon: ImageIcon,   text: 'Watermarked previews unlock on payment — automatic' },
      { icon: FileText,    text: 'Invoice auto-sent after gallery delivered, Stripe handles the rest' },
      { icon: Globe,       text: 'Location-tagged projects for real estate portfolio tracking' },
    ],
  },
  {
    id: 'commercial', label: 'Commercial', icon: Star,
    category: 'COMMERCIAL PHOTOGRAPHY',
    headline: 'Brand clients, revision rounds,\nlicensing.',
    quote: '"Multiple revision rounds, licensing terms, agency delivery chains."',
    features: [
      { icon: Settings,    text: 'Preset: hero shots → lifestyle → product detail → rejects' },
      { icon: SquareCheck, text: '3-stage delivery with revision thread built in' },
      { icon: FileText,    text: 'Contract with licensing terms before project begins' },
      { icon: Download,    text: 'Organized ZIP by category for art directors' },
      { icon: Settings,    text: 'Per-project analytics — which assets got downloaded most' },
    ],
  },
  {
    id: 'fashion', label: 'Fashion', icon: Sparkles,
    category: 'FASHION PHOTOGRAPHY',
    headline: 'Editorial sorting.\nEvery look, every angle.',
    quote: '"Mood and aesthetic matter more than sharpness. Generic AI misses it."',
    features: [
      { icon: Settings,    text: 'Preset: editorial → lifestyle → detail → movement' },
      { icon: Wand2,       text: 'Vibe chat builds a preset matching your exact aesthetic' },
      { icon: Sparkles,    text: 'AI Style Profile learns your personal selects over time' },
      { icon: LinkIcon,    text: 'Lookbook-style gallery delivery for clients' },
      { icon: Settings,    text: 'Category tags editable after sort — fine-tune every folder' },
    ],
  },
  {
    id: 'travel', label: 'Travel', icon: Plane,
    category: 'TRAVEL PHOTOGRAPHY',
    headline: 'Hundreds of photos.\nMultiple clients. Daily.',
    quote: '"Volume sorting, content categorization, and social delivery all at once."',
    features: [
      { icon: Settings,    text: 'Preset: landscape → street → food → architecture → portrait' },
      { icon: Sparkles,    text: 'AI caption suggestions based on shoot tags and location' },
      { icon: Send,        text: 'Batch deliver to multiple brand clients simultaneously' },
      { icon: Smartphone,  text: 'Mobile-first workflow — sort and deliver from anywhere' },
      { icon: Download,    text: 'Social export formatted for Instagram, Pinterest, and more' },
    ],
  },
  {
    id: 'events', label: 'Events', icon: Zap,
    category: 'EVENT PHOTOGRAPHY',
    headline: 'Fast turnaround. Lots of faces.\nDemanding organizers.',
    quote: '"Event organizers want quick delivery, selects, and proper categorization."',
    features: [
      { icon: Settings,    text: 'Preset: keynote → networking → crowd → speakers → awards' },
      { icon: Send,        text: 'Client delivery within 24 hours of upload' },
      { icon: Settings,    text: 'AI sorts by venue, speaker, and activity type automatically' },
      { icon: Globe,       text: 'Attendee face grouping and tagging (coming soon)' },
      { icon: FileText,    text: 'Invoice and contract templates built for event photography' },
    ],
  },
]

function UseCaseTabs() {
  const [active, setActive] = useState('wedding')
  const uc = USE_CASES.find(u => u.id === active) ?? USE_CASES[0]

  return (
    <div className="flex flex-col gap-14">
      {/* Tab bar */}
      <div className="flex justify-center">
        <div style={{ background: SURF_LOW, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 4, display: 'inline-flex', flexWrap: 'wrap', gap: 0 }}>
          {USE_CASES.map(u => {
            const on = active === u.id
            return (
              <button
                key={u.id}
                onClick={() => setActive(u.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderRadius: 36, padding: '12px 24px',
                  background: on ? PRIMARY : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <u.icon size={16} color={on ? SURF : MUTED} />
                <span style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 500 }}>{u.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Details */}
        <div style={{ ...card, padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <div className="flex items-center gap-4">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: P10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <uc.icon size={20} color={PRIMARY} />
            </div>
            <span style={{ ...geist, color: TEXT, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>{uc.category}</span>
          </div>

          {/* Headline */}
          <p style={{ ...geist, color: TEXT, fontSize: 28, fontWeight: 700, lineHeight: 1.3, margin: 0, whiteSpace: 'pre-line' }}>{uc.headline}</p>

          {/* Quote */}
          <div style={{ borderLeft: `3px solid ${BORDER}`, paddingLeft: 16 }}>
            <p style={{ ...geist, color: TEXT, fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{uc.quote}</p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {uc.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <f.icon size={18} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ ...geist, color: DARK888, fontSize: 14, lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div style={{ ...card, overflow: 'hidden', minHeight: 400 }}>
          {/* Browser bar */}
          <div style={{ background: P10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ flex: 1, maxWidth: 200, height: 8, borderRadius: 4, background: P10 }} />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center justify-center gap-4" style={{ flex: 1, minHeight: 350, opacity: 0.4 }}>
            <Monitor size={48} color={PRIMARY} style={{ opacity: 0.5 }} />
            <span style={{ ...geist, color: TEXT, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
              {uc.label} Gallery Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export function LandingPage() {
  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Geist:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{ background: BG, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={22} color={TEXT} />
            <span style={{ ...geist, color: TEXT, fontSize: 18, fontWeight: 700 }}>View1 Sort</span>
          </div>
          {/* Center */}
          <div className="hidden md:flex items-center" style={{ gap: 32 }}>
            {['Features', 'How It Works', 'Use Cases', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ ...geist, color: TEXT, fontSize: 14, textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
          {/* Right */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <Link href="/auth/login" className="hidden md:block"
              style={{ ...geist, color: TEXT, fontSize: 14, textDecoration: 'none' }}>Sign In</Link>
            <a href="https://photo-sorter-theta.vercel.app/dashboard" target="_blank" rel="noopener noreferrer"
              style={{ ...geist, color: TEXT, fontSize: 14, padding: '8px 16px', border: `1px solid ${BORDER}`, borderRadius: 6, textDecoration: 'none', display: 'none' }}
              className="md:inline-block">Open App →</a>
            <a href="#cta"
              style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 600, padding: '8px 16px', background: P10, border: `1px solid ${BORDER}`, borderRadius: 6, textDecoration: 'none' }}>
              Get Early Access
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ background: BG, padding: '100px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <h1 style={{ ...inter, color: TEXT, fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.05, textAlign: 'center', maxWidth: 960 }}>
          The AI That Thinks Like a Photographer
        </h1>
        <p style={{ ...geist, color: TEXT, fontSize: 18, lineHeight: 1.7, textAlign: 'center', maxWidth: 700 }}>
          Automatically sort, rate, and organize your photos using AI that understands composition, lighting, emotion, and technical quality — just like you would.
        </p>
        <div className="flex items-center flex-wrap justify-center" style={{ gap: 16 }}>
          <a href="#cta"
            style={{ ...geist, color: TEXT, fontSize: 16, fontWeight: 600, padding: '14px 28px', background: P10, borderRadius: 8, textDecoration: 'none', border: `1px solid ${BORDER}` }}>
            Get Early Access
          </a>
          <a href="#how-it-works"
            style={{ ...geist, color: TEXT, fontSize: 16, fontWeight: 500, padding: '14px 28px', border: `1px solid ${BORDER}`, borderRadius: 8, textDecoration: 'none' }}>
            See How It Works
          </a>
        </div>
        <p style={{ ...geist, color: TEXT, fontSize: 13, textAlign: 'center', opacity: 0.6 }}>
          Trusted by 2,000+ photographers worldwide
        </p>
        <Mockup label="AI Sort Dashboard" height={620} radius={20} />
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section style={{ background: SURF_LOW, padding: '96px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center', maxWidth: 800 }}>
          You shoot photography, not file folders, not to manage files
        </h2>
        <div className="grid grid-cols-1 gap-8 w-full md:grid-cols-3">
          {[
            { line: P10,   num: '4-12 mins',  label: 'Average time to sort',  desc: 'What used to take hours now takes minutes. AI handles the heavy lifting while you focus on the creative work.' },
            { line: PRIMARY, num: '25+ credits', label: 'Included free',        desc: 'Start sorting immediately with generous free credits. No credit card required, no hidden limits.' },
            { line: TEAL,  num: '6 tools',    label: 'In one platform',       desc: 'Sort, rate, cull, tag, export, and share — all from a single unified workspace built for photographers.' },
          ].map(s => (
            <div key={s.num} style={{ ...cardSm, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 40, height: 3, borderRadius: 2, background: s.line }} />
              <p style={{ ...geist, color: TEXT, fontSize: 32, fontWeight: 700 }}>{s.num}</p>
              <p style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 600 }}>{s.label}</p>
              <p style={{ ...geist, color: TEXT, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: BG, padding: '96px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2 }}>
            Sort by step. Tuned to your needs.
          </h2>
          <p style={{ ...geist, color: TEXT, fontSize: 17, lineHeight: 1.7, maxWidth: 640, opacity: 0.8 }}>
            Three simple steps to go from a chaotic memory card to a perfectly organized gallery — powered by AI that learns your style.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 w-full md:grid-cols-3">
          {[
            { num: '01', title: 'Import your shoot',  desc: 'Drag and drop or connect your memory card. View1 Sort ingests RAW, JPEG, and HEIF files instantly.' },
            { num: '02', title: 'AI sorts & rates',   desc: 'Our AI analyzes composition, sharpness, exposure, and emotion to rate and categorize every shot.' },
            { num: '03', title: 'Export & deliver',   desc: 'Export your curated selections in any format. Share galleries, deliver to clients, or sync with Lightroom.' },
          ].map(step => (
            <div key={step.num} className="flex flex-col gap-4">
              <Mockup label={`Step ${step.num}`} height={280} />
              <p style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 700 }}>{step.num}</p>
              <p style={{ ...geist, color: TEXT, fontSize: 18, fontWeight: 600 }}>{step.title}</p>
              <p style={{ ...geist, color: TEXT, fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE SHOWCASE ────────────────────────────────── */}
      <section style={{ background: BG, padding: '96px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center', maxWidth: 800 }}>
          From Memory Card to pixel-perfect gallery workflow
        </h2>

        {/* Row 1: image left, text right */}
        <div className="grid grid-cols-1 gap-8 w-full items-center lg:grid-cols-2">
          <Mockup label="Smart Culling" height={380} />
          <div className="flex flex-col gap-4" style={{ padding: '0 16px' }}>
            <p style={{ ...geist, color: TEXT, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>SMART CULLING</p>
            <h3 style={{ ...geist, color: TEXT, fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>Eliminate duplicates and blurry shots instantly</h3>
            <p style={{ ...geist, color: TEXT, fontSize: 15, lineHeight: 1.7, opacity: 0.8 }}>
              AI detects near-duplicates, closed eyes, motion blur, and poor exposure — flagging them for review so you never accidentally delete a keeper.
            </p>
          </div>
        </div>

        {/* Row 2: text left, image right */}
        <div className="grid grid-cols-1 gap-8 w-full items-center lg:grid-cols-2">
          <div className="flex flex-col gap-4" style={{ padding: '0 16px' }}>
            <p style={{ ...geist, color: INDIGO_L, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>STYLE MATCHING</p>
            <h3 style={{ ...geist, color: TEXT, fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>Organize by mood, color palette, and visual style</h3>
            <p style={{ ...geist, color: TEXT, fontSize: 15, lineHeight: 1.7, opacity: 0.8 }}>
              Group photos by visual similarity, color temperature, and emotional tone. Perfect for building cohesive galleries and social media feeds.
            </p>
          </div>
          <Mockup label="Style Matching" height={380} />
        </div>
      </section>

      {/* ── AI MOMENT ───────────────────────────────────────── */}
      <section style={{ background: BG, padding: '96px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center', maxWidth: 700 }}>
          Build your AI Moment by just a simple text
        </h2>
        <div className="grid grid-cols-1 gap-10 w-full items-center lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p style={{ ...geist, color: TEXT, fontSize: 16, lineHeight: 1.7, opacity: 0.85 }}>
              Describe what you are looking for in plain language and let AI do the rest. No complex filters, no manual tagging — just tell it what you need.
            </p>
            <div className="flex flex-col gap-4">
              {[
                'Natural language photo search across your entire library',
                'Auto-generate collections based on themes and events',
                'Smart suggestions that improve with every session',
                'Context-aware sorting that understands photographer intent',
              ].map(text => (
                <div key={text} className="flex items-center gap-3">
                  <CircleCheck size={20} color={GREEN} style={{ flexShrink: 0 }} />
                  <span style={{ ...geist, color: TEXT, fontSize: 15 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <Mockup label="AI Chat Interface" height={420} />
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" style={{ background: BG, padding: '96px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2 }}>
            Free as in go. Zero confusion.
          </h2>
          <p style={{ ...geist, color: TEXT, fontSize: 17, lineHeight: 1.7, maxWidth: 580, opacity: 0.8 }}>
            No complicated tiers. No hidden fees. Start free and upgrade only when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full md:grid-cols-3">
          {/* Free */}
          <div style={{ ...cardSm, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ ...geist, color: GREEN, fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>Free</p>
            <p style={{ ...geist, color: TEXT, fontSize: 40, fontWeight: 700 }}>$0</p>
            <p style={{ ...geist, color: TEXT, fontSize: 14, opacity: 0.7 }}>forever</p>
            <div style={{ height: 1, background: P10 }} />
            {['25 sort credits / month', 'Basic AI sorting', 'Export to JPEG'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <Check size={16} color={MUTED} style={{ flexShrink: 0 }} />
                <span style={{ ...geist, color: TEXT, fontSize: 14 }}>{f}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 600, padding: '12px 0', border: `1px solid ${BORDER}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', width: '100%' }}>
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div style={{ background: P10, border: `2px solid ${BORDER}`, borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>Pro</p>
            <p style={{ ...geist, color: TEXT, fontSize: 40, fontWeight: 700 }}>$19</p>
            <p style={{ ...geist, color: TEXT, fontSize: 14, opacity: 0.7 }}>per month</p>
            <div style={{ height: 1, background: P10 }} />
            {['Unlimited sort credits', 'Advanced AI + style matching', 'RAW + Lightroom export', 'Priority processing'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <Check size={16} color={P10} style={{ flexShrink: 0 }} />
                <span style={{ ...geist, color: TEXT, fontSize: 14 }}>{f}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 600, padding: '12px 0', background: P10, border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' }}>
              Get Early Access
            </button>
          </div>

          {/* Team */}
          <div style={{ ...cardSm, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ ...geist, color: INDIGO_L, fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>Team</p>
            <p style={{ ...geist, color: TEXT, fontSize: 40, fontWeight: 700 }}>$49</p>
            <p style={{ ...geist, color: TEXT, fontSize: 14, opacity: 0.7 }}>per month</p>
            <div style={{ height: 1, background: P10 }} />
            {['Everything in Pro', '5 team members', 'Shared libraries & presets', 'Client gallery delivery'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <Check size={16} color={PRIMARY} style={{ flexShrink: 0 }} />
                <span style={{ ...geist, color: TEXT, fontSize: 14 }}>{f}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ ...geist, color: TEXT, fontSize: 14, fontWeight: 600, padding: '12px 0', border: `1px solid ${BORDER}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', width: '100%' }}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ── EVERY FEATURE ───────────────────────────────────── */}
      <section id="features" style={{ background: BG, padding: '100px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge>Every Feature</Badge>
          <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, maxWidth: 900, whiteSpace: 'pre-line' }}>
            {'One platform. Every tool\na photographer needs.'}
          </h2>
        </div>
        <FeatureTabs />
      </section>

      {/* ── USE CASES ───────────────────────────────────────── */}
      <section id="use-cases" style={{ background: SURF_LOW, padding: '100px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge>Use Cases</Badge>
          <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, maxWidth: 900, whiteSpace: 'pre-line' }}>
            {'Built for every photographer\nwho shoots at volume.'}
          </h2>
        </div>
        <UseCaseTabs />
      </section>

      {/* ── CLIENT EXPERIENCE ───────────────────────────────── */}
      <section style={{ background: SURF, padding: '100px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge>Client Experience</Badge>
          <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.1, maxWidth: 800, whiteSpace: 'pre-line' }}>
            {'Your clients see magic.\nYou see efficiency.'}
          </h2>
          <p style={{ ...geist, color: TEXT, fontSize: 18, lineHeight: 1.7, maxWidth: 650, opacity: 0.8 }}>
            Beautiful, branded galleries that feel premium. Behind the scenes, everything is automated.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 w-full md:grid-cols-3">
          {[
            { icon: ImageIcon,    title: 'Branded Galleries',  desc: 'Custom colors, logo, domain. Every gallery feels like your brand, not a generic platform.' },
            { icon: MousePointer, title: 'Client Selection',   desc: 'Clients pick favorites from a beautiful interface. No more email chains with screenshot references.' },
            { icon: Download,     title: 'Smart Downloads',    desc: 'AI-organized ZIP exports by category. No flat dump of 1,400 JPEGs — everything sorted and labeled.' },
          ].map(c => (
            <div key={c.title} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <IconBox icon={c.icon} />
              <p style={{ ...geist, color: TEXT, fontSize: 20, fontWeight: 600 }}>{c.title}</p>
              <p style={{ ...geist, color: TEXT, fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section id="cta" style={{ background: SURF, padding: '100px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <h2 style={{ ...inter, color: TEXT, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
          Ready to sort smarter?
        </h2>
        <p style={{ ...geist, color: TEXT, fontSize: 18, lineHeight: 1.7, textAlign: 'center', maxWidth: 600, opacity: 0.8 }}>
          Join hundreds of photographers who are saving hours every week with AI-powered sorting.
        </p>
        <div className="flex items-center flex-wrap justify-center" style={{ gap: 16 }}>
          <a href="/auth/signup"
            style={{ ...geist, color: TEXT, fontSize: 16, fontWeight: 600, padding: '16px 32px', background: PRIMARY, borderRadius: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            Get Early Access <ArrowRight size={18} color={SURF} />
          </a>
          <a href="https://photo-sorter-theta.vercel.app/dashboard" target="_blank" rel="noopener noreferrer"
            style={{ ...geist, color: DARK888, fontSize: 16, fontWeight: 500, padding: '16px 32px', border: `1px solid ${BORDER}`, borderRadius: 12, textDecoration: 'none' }}>
            Watch Demo
          </a>
        </div>
        <p style={{ ...geist, color: TEXT, fontSize: 12, letterSpacing: 1, opacity: 0.5 }}>
          Free during beta • No credit card required • Cancel anytime
        </p>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div style={{ height: 1, background: BORDER }} />
      <footer style={{ background: SURF, padding: '24px 120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ ...geist, color: TEXT, fontSize: 13, opacity: 0.7 }}>© 2026 View1 Sort. All rights reserved.</p>
        <div className="flex items-center" style={{ gap: 24 }}>
          {['Privacy', 'Terms', 'Contact', 'Twitter'].map(l => (
            <a key={l} href="#" style={{ ...geist, color: TEXT, fontSize: 13, textDecoration: 'none', opacity: 0.7 }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
