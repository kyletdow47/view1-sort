'use client'

import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'

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

/* ── Static mobile hero (no scroll-jacking) ── */
function MobileHero() {
  const geist = { fontFamily: "'Geist', system-ui, sans-serif" } as const
  return (
    <div className="relative z-10 px-5 pt-28 pb-16 flex flex-col items-center gap-12">
      {/* Headline */}
      <h1 className="text-4xl font-bold text-white text-center leading-[1.05] tracking-tight" style={geist}>
        You shoot the photos.<br />We&apos;ll handle the rest.
      </h1>

      {/* List */}
      <div className="space-y-2">
        {LIST_ITEMS.map(item => (
          <div key={item} className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
            <span className="text-xl font-bold text-white/90" style={geist}>{item}</span>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div className="text-center space-y-3">
        <p className="text-2xl font-bold text-white leading-tight" style={geist}>It all lives in one place now.</p>
        <p className="text-lg font-bold text-white/40 leading-tight" style={geist}>Built by a photographer who spent years doing it the hard way.</p>
      </div>

      {/* Mockup */}
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
        <NextImage
          src="/images/dashboard-v2-preview.png"
          alt="View1 Sort Dashboard"
          width={2940}
          height={1842}
          className="w-full h-auto"
          priority
        />
      </div>

    </div>
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

        {/* Scene 3: Mockup — no container, raw image fills screen */}
        <div ref={sMockup} className="absolute inset-0 flex items-center justify-center will-change-[opacity]" style={{ opacity: 0 }}>
          <div ref={sMockupImg} className="will-change-[transform,filter] w-full h-full relative">
            <NextImage
              src="/images/dashboard-v2-preview.png"
              alt="View1 Sort Dashboard"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  )
}
