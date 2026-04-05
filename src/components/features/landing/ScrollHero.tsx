'use client'

import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import { Brain, Check, CreditCard, FolderOpen } from 'lucide-react'

/* ── Shared glass style for floating product cards ── */
const CARD_GLASS = [
  'rounded-2xl overflow-hidden',
  'bg-gradient-to-b from-white/[0.12] to-white/[0.04]',
  'border border-white/[0.10]',
  'backdrop-blur-[20px]',
  'shadow-[0_8px_24px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.06)]',
].join(' ')

/* ── Helpers ── */
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }
function sp(global: number, start: number, end: number) { return clamp((global - start) / (end - start), 0, 1) }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }

const LIST_ITEMS = ['Sorting', 'Culling', 'Gallery delivery', 'Invoicing', 'Client management']
const TAGLINE_1 = 'It all lives in one place now.'
const TAGLINE_2 = 'We built the tool we wished existed after years of doing it the hard way.'

/*
 * Timeline (275vh runway):
 *
 * Scene 1  0.00–0.14  Headline zoom+disperse
 * Scene 2  0.14–0.63  List accumulates → slides left → taglines on right → fade out
 * Scene 3  0.60–1.00  Mockup zooms in to fullscreen, holds, zooms back out
 */

/* ── Tag2 word layout — each word is a separate animated element ── */
const TAG2_LINES: { text: string; cls: string }[][] = [
  [
    { text: 'We', cls: 'text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold leading-none tracking-tight' },
    { text: 'built', cls: 'text-[16px] sm:text-[22px] lg:text-[28px] font-bold leading-none' },
    { text: 'the', cls: 'text-[16px] sm:text-[22px] lg:text-[28px] font-bold leading-none' },
    { text: 'tool', cls: 'text-[28px] sm:text-[36px] lg:text-[48px] font-extrabold leading-none tracking-tight' },
    { text: 'we', cls: 'text-[16px] sm:text-[22px] lg:text-[28px] font-bold leading-none' },
  ],
  [
    { text: 'wished', cls: 'text-[20px] sm:text-[26px] lg:text-[32px] font-bold leading-none' },
    { text: 'existed', cls: 'text-[32px] sm:text-[42px] lg:text-[56px] font-extrabold leading-none tracking-tight' },
    { text: 'after', cls: 'text-[20px] sm:text-[26px] lg:text-[32px] font-bold leading-none' },
  ],
  [
    { text: 'years', cls: 'text-[28px] sm:text-[36px] lg:text-[48px] font-extrabold leading-none tracking-tight' },
    { text: 'of', cls: 'text-[16px] sm:text-[22px] lg:text-[28px] font-bold leading-none' },
    { text: 'doing', cls: 'text-[16px] sm:text-[22px] lg:text-[28px] font-bold leading-none' },
    { text: 'it', cls: 'text-[28px] sm:text-[36px] lg:text-[48px] font-extrabold leading-none tracking-tight' },
  ],
  [
    { text: 'the', cls: 'text-[16px] sm:text-[22px] lg:text-[28px] font-bold leading-none' },
    { text: 'hard', cls: 'text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold leading-none tracking-tight' },
    { text: 'way.', cls: 'text-[30px] sm:text-[40px] lg:text-[52px] font-extrabold leading-none tracking-tight' },
  ],
]
const TAG2_TOTAL = TAG2_LINES.flat().length // 15 words

function Tag2Words({ refs, containerRef, geist }: {
  refs: React.MutableRefObject<(HTMLSpanElement | null)[]>
  containerRef: React.RefObject<HTMLDivElement | null>
  geist: Record<string, string>
}) {
  let idx = 0
  return (
    <div ref={containerRef} className="flex flex-col gap-1" style={{ ...geist, opacity: 0 }}>
      {TAG2_LINES.map((line, li) => (
        <div key={li} className="flex items-baseline justify-between">
          {line.map((w) => {
            const i = idx++
            return (
              <span
                key={i}
                ref={el => { refs.current[i] = el }}
                className={`${w.cls} will-change-[transform,opacity,filter] inline-block`}
                style={{ opacity: 0 }}
              >
                {w.text}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ── Inline waitlist form for mobile (avoids cross-module import issue) ── */
function MobileWaitlistForm({ geist }: { geist: Record<string, string> }) {
  const [email, setEmail] = useState('')
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
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}>
          <Check size={20} className="text-violet-400" />
        </div>
        <p className="font-semibold text-white text-lg" style={geist}>You&apos;re on the list.</p>
        <p className="text-sm text-white/40">We&apos;ll email you when access opens.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="flex gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-4 text-sm text-white placeholder-white/30 outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 px-5 py-4 text-sm font-medium text-white btn-rainbow disabled:opacity-60 transition-all"
        >
          {loading ? 'Joining…' : 'Join'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-center text-xs text-white/30">Free to join · Founding member pricing locked in forever</p>
    </form>
  )
}

/* ── Static mobile hero (no scroll-jacking) ── */
function MobileHero() {
  const geist = { fontFamily: "'Geist', system-ui, sans-serif" } as const
  return (
    <>
      <style>{`
        @keyframes mFloatA {
          0%,100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-10px) rotate(-1.5deg); }
        }
        @keyframes mFloatB {
          0%,100% { transform: translateY(-4px) rotate(2deg); }
          50% { transform: translateY(8px) rotate(2deg); }
        }
        @keyframes mFloatC {
          0%,100% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-13px) rotate(-0.5deg); }
        }
        @keyframes mFloatD {
          0%,100% { transform: translateY(-7px) rotate(1deg); }
          50% { transform: translateY(5px) rotate(1deg); }
        }
        @keyframes mFloatE {
          0%,100% { transform: translateY(0px) rotate(1.5deg); }
          50% { transform: translateY(-9px) rotate(1.5deg); }
        }
        @keyframes mFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mDot {
          0%,100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="relative z-10 px-5 pt-28 pb-20 flex flex-col items-center gap-8">

        {/* Headline */}
        <div className="text-center" style={{ animation: 'mFadeUp 0.7s ease both' }}>
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-tight" style={geist}>
            <span className="text-white">You shoot.<br /></span>
            <span style={{
              background: 'linear-gradient(90deg, #F59E0B 0%, #A855F7 55%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              We handle the rest.
            </span>
          </h1>
          <p className="mt-3 text-[15px] text-white/40 leading-relaxed max-w-[260px] mx-auto">
            AI sorting, delivery, and business ops — one workflow.
          </p>
        </div>

        {/* Floating product UI cards */}
        <div className="relative w-full px-3" style={{ height: 300, animation: 'mFadeUp 0.7s 0.2s ease both', overflow: 'hidden' }}>

          {/* Ambient glow behind the card cluster */}
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position: 'absolute', top: '20%', left: '30%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.13) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }} />
          </div>

          {/* Card 1: AI Sorting progress — top center */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 208, animation: 'mFloatA 4.4s ease-in-out infinite' }}>
            <div className={CARD_GLASS + ' p-3.5'}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-5 w-5 rounded-md bg-violet-400/20 flex items-center justify-center">
                  <Brain size={11} className="text-violet-400" />
                </div>
                <span className="text-[11px] font-semibold text-white/80">AI Sorting</span>
                <span className="ml-auto text-[11px] font-bold text-violet-400">92%</span>
              </div>
              <p className="text-[10px] text-white/35 mb-2">847 photos · beach wedding</p>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '92%', background: 'linear-gradient(90deg, #3B82F6, #A855F7, #EC4899)' }} />
              </div>
            </div>
          </div>

          {/* Card 2: Gallery delivered — left */}
          <div style={{ position: 'absolute', top: 112, left: 0, width: 172, animation: 'mFloatB 5s ease-in-out infinite' }}>
            <div className={CARD_GLASS + ' p-3'}>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <Check size={13} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white leading-tight">Gallery ready</p>
                  <p className="text-[10px] mt-0.5 leading-tight text-white/35">Client link sent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: AI chat bubble — right */}
          <div style={{ position: 'absolute', top: 100, right: 0, width: 168, animation: 'mFloatC 3.9s ease-in-out infinite' }}>
            <div className="rounded-2xl rounded-tr-sm border border-white/10 p-3" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.08))', backdropFilter: 'blur(20px)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400" style={{ animation: 'mDot 2s ease-in-out infinite' }} />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-violet-300/70">AI Workspace</span>
              </div>
              <p className="text-[10px] leading-relaxed text-white/65">Prioritizing emotional candids → ceremony moments ✨</p>
            </div>
          </div>

          {/* Card 4: Invoice paid — bottom right */}
          <div style={{ position: 'absolute', bottom: 18, right: '6%', width: 160, animation: 'mFloatD 4.7s ease-in-out infinite' }}>
            <div className={CARD_GLASS + ' p-3'}>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <CreditCard size={12} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white leading-tight">Invoice paid</p>
                  <p className="text-[10px] mt-0.5 leading-tight text-white/35">$2,400 · Stripe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Categories sorted — bottom left */}
          <div style={{ position: 'absolute', bottom: 10, left: '4%', width: 152, animation: 'mFloatE 3.6s 0.9s ease-in-out infinite' }}>
            <div className={CARD_GLASS + ' p-3'}>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <FolderOpen size={12} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white leading-tight">80 photos sorted</p>
                  <p className="text-[10px] mt-0.5 leading-tight text-white/35">6 categories</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-2.5 w-full max-w-[260px]" style={{ animation: 'mFadeUp 0.6s 0.45s ease both' }}>
          {LIST_ITEMS.map((item, i) => (
            <div key={item} className="flex items-center gap-3" style={{ animation: `mFadeUp 0.5s ${0.5 + i * 0.07}s ease both` }}>
              <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #A855F7, #3B82F6)' }} />
              <span className="text-base font-semibold text-white/85" style={geist}>{item}</span>
            </div>
          ))}
        </div>

        {/* Waitlist CTA */}
        <div className="w-full" style={{ animation: 'mFadeUp 0.7s 0.85s ease both' }}>
          <div className="rounded-[20px] border border-white/[0.12] p-5" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))', backdropFilter: 'blur(32px)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
            <p className="text-xl font-bold text-white text-center mb-1" style={geist}>Join the waitlist</p>
            <p className="text-sm text-white/35 text-center mb-4">Early access + founding member pricing.</p>
            <MobileWaitlistForm geist={geist} />
          </div>
        </div>

      </div>
    </>
  )
}

export function ScrollHero() {
  const [isMobile, setIsMobile] = useState(true)
  const outerRef = useRef<HTMLDivElement>(null)
  const s1 = useRef<HTMLDivElement>(null)
  const s2 = useRef<HTMLDivElement>(null)
  const s2ListContainer = useRef<HTMLDivElement>(null)
  const s2Items = useRef<(HTMLDivElement | null)[]>([])
  const s2Right = useRef<HTMLDivElement>(null)
  const s2Tag1 = useRef<HTMLParagraphElement>(null)
  const s2Tag2 = useRef<HTMLParagraphElement>(null)
  const s2Tag2Words = useRef<(HTMLSpanElement | null)[]>([])
  const sMockup = useRef<HTMLDivElement>(null)
  const sMockupImg = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) return
    function animate() {
      const el = outerRef.current
      if (!el) { raf.current = requestAnimationFrame(animate); return }

      const vh = window.visualViewport?.height ?? window.innerHeight
      const rect = el.getBoundingClientRect()
      const runway = el.offsetHeight - vh
      if (runway <= 0) { raf.current = requestAnimationFrame(animate); return }
      const p = clamp(-rect.top / runway, 0, 1)

      /* ════════ Scene 1: Headline (0.00–0.14) ════════ */
      if (s1.current) {
        const t = sp(p, 0, 0.14)
        s1.current.style.transform = `scale(${1 + t * 1.8})`
        s1.current.style.opacity = `${1 - t}`
        s1.current.style.letterSpacing = `${t * 20}px`
        s1.current.style.filter = `blur(${t * 10}px)`
      }

      /* ════════ Scene 2: List + taglines (0.14–0.44) ════════ */
      if (s2.current) {
        s2.current.style.opacity = (p >= 0.14 && p <= 0.56) ? '1' : '0'
      }

      const listAccum = sp(p, 0.14, 0.26)
      // Scene 2: hold after last word (~0.51), then fade out (0.58–0.63)
      const fadeAll = sp(p, 0.58, 0.63)
      const groupFade = fadeAll > 0 ? 1 - easeOut(fadeAll) : 1

      // The whole s2 container shifts left once taglines start appearing
      // The grid starts shifted right (list centered), then slides to normal when taglines appear
      const slideP = sp(p, 0.26, 0.30)
      // Scene 2 container: slide from center + scroll up at end
      const scrollUpS2 = sp(p, 0.58, 0.63)
      if (s2.current) {
        s2.current.style.opacity = (p >= 0.14 && p <= 0.63) ? '1' : '0'
        const xShift = (1 - easeOut(slideP)) * 25
        const yUp = easeOut(scrollUpS2) * -15
        s2.current.style.transform = `translateX(${xShift}%) translateY(${yUp}vh)`
      }

      if (s2ListContainer.current) {
        s2ListContainer.current.style.opacity = `${groupFade}`
      }

      const n = LIST_ITEMS.length
      s2Items.current.forEach((el, i) => {
        if (!el) return
        const trigger = i / n
        const itemIn = sp(listAccum, trigger, trigger + 0.8 / n)
        const eased = easeOut(clamp(itemIn, 0, 1))
        el.style.opacity = `${eased * groupFade}`
        el.style.transform = `translateX(${(1 - eased) * 30}px)`
        el.style.filter = `blur(${(1 - clamp(itemIn * 2, 0, 1)) * 2}px)`
      })

      if (s2Right.current) {
        const rightIn = sp(p, 0.29, 0.32)
        s2Right.current.style.opacity = `${easeOut(rightIn) * groupFade}`
        s2Right.current.style.transform = `translateX(${(1 - easeOut(rightIn)) * 40}px)`
      }

      // Tagline 1 fades in, stays visible
      if (s2Tag1.current) {
        const tag1In = sp(p, 0.30, 0.32)
        s2Tag1.current.style.opacity = `${easeOut(tag1In)}`
      }

      // Tagline 2 container visible as soon as first word starts
      if (s2Tag2.current) {
        s2Tag2.current.style.opacity = p >= 0.30 ? '1' : '0'
      }

      // Tagline 2 words — strictly sequential, full white when done
      const wordDur = 0.015
      s2Tag2Words.current.forEach((el, i) => {
        if (i >= TAG2_TOTAL) return
        if (!el) return
        const wStart = 0.30 + i * wordDur
        const wEnd = wStart + wordDur
        const wp = easeOut(sp(p, wStart, wEnd))
        // Override to full white once revealed (ignore CSS class opacity)
        const alpha = Math.round(wp * groupFade * 255)
        const hex = alpha.toString(16).padStart(2, '0')
        el.style.color = `#FFFFFF${hex}`
        el.style.opacity = '1' // always 1, color alpha handles visibility
        el.style.transform = `translateY(${(1 - wp) * 20}px)`
        el.style.filter = `blur(${(1 - wp) * 4}px)`
      })

      /* ════════ Scene 3: Mockup fullscreen (0.60–1.0) ════════ */
      if (sMockup.current) {
        const fadeIn = sp(p, 0.60, 0.65)
        const fadeOut = sp(p, 0.88, 0.97)
        if (p < 0.60) {
          sMockup.current.style.opacity = '0'
        } else if (p <= 0.88) {
          sMockup.current.style.opacity = `${clamp(fadeIn * 3, 0, 1)}`
        } else {
          sMockup.current.style.opacity = `${1 - easeOut(fadeOut)}`
        }
      }
      if (sMockupImg.current) {
        const zoomIn = sp(p, 0.60, 0.72)
        const zoomOut = sp(p, 0.88, 0.97)
        if (p <= 0.88 && p >= 0.60) {
          const ez = easeOut(zoomIn)
          const scale = 0.3 + ez * 0.85
          const blur = (1 - ez) * 10
          sMockupImg.current.style.transform = `scale(${scale})`
          sMockupImg.current.style.filter = `blur(${blur}px)`
        } else if (p > 0.88) {
          const ez = easeOut(zoomOut)
          const scale = 1.15 - ez * 0.5
          sMockupImg.current.style.transform = `scale(${scale})`
          sMockupImg.current.style.filter = `blur(${ez * 6}px)`
        }
      }

      raf.current = requestAnimationFrame(animate)
    }

    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [isMobile])

  const geist = { fontFamily: "'Geist', system-ui, sans-serif" } as const

  if (isMobile) return <MobileHero />

  return (
    <div ref={outerRef} style={{ height: '275svh' }} className="relative z-10">
      <div className="sticky top-0 w-full flex items-center justify-center" style={{ height: '100svh', overflow: 'clip' }}>

        {/* Scene 1: Headline */}
        <div ref={s1} className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter]">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[80px] font-bold text-white text-center max-w-4xl px-4 sm:px-6 leading-[1.05] tracking-tight" style={geist}>
            You shoot the photos.
            <br />
            We&apos;ll handle the rest.
          </h1>
        </div>

        {/* Scene 2: List + taglines */}
        <div ref={s2} className="absolute inset-0 flex items-center justify-center will-change-[opacity]" style={{ opacity: 0 }}>
          <div className="w-full max-w-6xl px-6 sm:px-12 grid grid-cols-1 md:grid-cols-2 items-end gap-8 md:gap-16">
            {/* Left: list */}
            <div ref={s2ListContainer} className="will-change-[opacity] flex justify-center md:justify-end">
              <div className="space-y-3 sm:space-y-5">
                {LIST_ITEMS.map((item, i) => (
                  <div key={item} ref={el => { s2Items.current[i] = el }} className="flex items-center gap-3 sm:gap-4 will-change-[transform,opacity,filter]" style={{ opacity: 0 }}>
                    <div className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white/90 leading-tight" style={geist}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: taglines */}
            <div ref={s2Right} className="will-change-[transform,opacity] flex flex-col" style={{ opacity: 0 }}>
              <p ref={s2Tag1} className="text-2xl sm:text-3xl lg:text-[44px] font-bold text-white leading-[1.1]" style={{ ...geist, opacity: 0 }}>
                It all lives in one place now.
              </p>

              <div className="h-4 sm:h-8" />

              <Tag2Words refs={s2Tag2Words} containerRef={s2Tag2} geist={geist} />
            </div>
          </div>
        </div>

        {/* Scene 3: Mockup — floating window frame */}
        <div ref={sMockup} className="absolute inset-0 flex items-center justify-center will-change-[opacity] px-6 lg:px-16" style={{ opacity: 0 }}>
          <div ref={sMockupImg} className="will-change-[transform,filter] w-full max-w-5xl rounded-[20px] overflow-hidden border border-white/[0.15] shadow-[0_48px_120px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)]" style={{ background: '#0c0c10' }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-400/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <NextImage
              src="/images/dashboard-v2-preview.png"
              alt="View1 Sort Dashboard"
              width={2940}
              height={1842}
              className="w-full h-auto block"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  )
}
