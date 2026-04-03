'use client'

import { useEffect, useRef } from 'react'
import NextImage from 'next/image'
import { WaitlistForm } from './WaitlistForm'

/* ── Helpers ── */
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }
function sp(global: number, start: number, end: number) { return clamp((global - start) / (end - start), 0, 1) }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }

const LIST_ITEMS = ['Sorting', 'Culling', 'Gallery delivery', 'Invoicing', 'Client management']
const TAGLINE_1 = 'It all lives in one place now.'
const TAGLINE_2 = 'We built the tool we wished existed after years of doing it the hard way.'

/*
 * Timeline (225vh runway):
 *
 * Scene 1  0.00–0.14  Headline zoom+disperse
 * Scene 2  0.14–0.44  List accumulates → slides left → taglines on right → fade out
 * Scene 3  0.44–0.70  Mockup zooms in from tiny to FULLSCREEN, then zooms back out
 * Scene 4  0.70–0.90  Waitlist form fades in, holds, fades out
 * 0.90–1.0  Buffer to next section
 */

export function ScrollHero() {
  const outerRef = useRef<HTMLDivElement>(null)
  const s1 = useRef<HTMLDivElement>(null)
  const s2 = useRef<HTMLDivElement>(null)
  const s2ListContainer = useRef<HTMLDivElement>(null)
  const s2Items = useRef<(HTMLDivElement | null)[]>([])
  const s2Right = useRef<HTMLDivElement>(null)
  const s2Tag1 = useRef<HTMLParagraphElement>(null)
  const s2Tag2 = useRef<HTMLParagraphElement>(null)
  const sMockup = useRef<HTMLDivElement>(null)
  const sMockupImg = useRef<HTMLDivElement>(null)
  const sForm = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  useEffect(() => {
    function animate() {
      const el = outerRef.current
      if (!el) { raf.current = requestAnimationFrame(animate); return }

      const rect = el.getBoundingClientRect()
      const runway = el.offsetHeight - window.innerHeight
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
        s2.current.style.opacity = (p >= 0.14 && p <= 0.44) ? '1' : '0'
      }

      const listAccum = sp(p, 0.14, 0.26)
      const fadeAll = sp(p, 0.42, 0.44)
      const groupFade = fadeAll > 0 ? 1 - easeOut(fadeAll) : 1

      // The whole s2 container shifts left once taglines start appearing
      // The grid starts shifted right (list centered), then slides to normal when taglines appear
      const slideP = sp(p, 0.26, 0.30)
      if (s2.current) {
        const vis = p >= 0.14 && p <= 0.44
        s2.current.style.opacity = vis ? '1' : '0'
        // Shift: starts at +25% (list looks centered), eases to 0 (two-column)
        const xShift = (1 - easeOut(slideP)) * 25
        s2.current.style.transform = `translateX(${xShift}%)`
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

      // Tagline 2 fades in below tagline 1
      if (s2Tag2.current) {
        const tag2In = sp(p, 0.34, 0.37)
        s2Tag2.current.style.opacity = `${easeOut(tag2In)}`
      }

      /* ════════ Scene 3: Mockup fullscreen (0.44–0.70) ════════
       * 0.44–0.54: zoom in from tiny to fill entire screen
       * 0.54–0.62: hold at fullscreen
       * 0.62–0.70: zoom back out (shrink) and fade
       */
      if (sMockup.current) {
        const fadeIn = sp(p, 0.44, 0.48)
        const zoomOut = sp(p, 0.62, 0.70)

        if (p < 0.44) {
          sMockup.current.style.opacity = '0'
        } else if (p <= 0.62) {
          sMockup.current.style.opacity = `${clamp(fadeIn * 4, 0, 1)}`
        } else {
          sMockup.current.style.opacity = `${1 - easeOut(zoomOut)}`
        }
      }
      if (sMockupImg.current) {
        const zoomIn = sp(p, 0.44, 0.54)
        const zoomOut = sp(p, 0.62, 0.70)

        if (p <= 0.62) {
          // Zoom from 0.3 → ~1.15 (slightly overfill to bleed edges)
          const ez = easeOut(zoomIn)
          const scale = 0.3 + ez * 0.85
          const blur = (1 - ez) * 10
          sMockupImg.current.style.transform = `scale(${scale})`
          sMockupImg.current.style.filter = `blur(${blur}px)`
        } else {
          // Zoom back out
          const ez = easeOut(zoomOut)
          const scale = 1.15 - ez * 0.5
          sMockupImg.current.style.transform = `scale(${scale})`
          sMockupImg.current.style.filter = `blur(${ez * 6}px)`
        }
      }

      /* ════════ Scene 4: Waitlist form (0.70–0.90) ════════ */
      if (sForm.current) {
        const fadeIn = sp(p, 0.70, 0.76)
        const fadeOut = sp(p, 0.85, 0.90)

        if (p < 0.70) {
          sForm.current.style.opacity = '0'
          sForm.current.style.pointerEvents = 'none'
        } else if (p <= 0.85) {
          const e = easeOut(fadeIn)
          sForm.current.style.transform = `scale(${0.85 + e * 0.15})`
          sForm.current.style.opacity = `${e}`
          sForm.current.style.filter = `blur(${(1 - e) * 5}px)`
          sForm.current.style.pointerEvents = fadeIn > 0.8 ? 'auto' : 'none'
        } else {
          const e = easeOut(fadeOut)
          sForm.current.style.transform = `scale(${1 - e * 0.1})`
          sForm.current.style.opacity = `${1 - e}`
          sForm.current.style.filter = `blur(${e * 4}px)`
          sForm.current.style.pointerEvents = 'none'
        }
      }

      raf.current = requestAnimationFrame(animate)
    }

    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const geist = { fontFamily: "'Geist', system-ui, sans-serif" } as const

  return (
    <div ref={outerRef} style={{ height: '225vh' }} className="relative z-10">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Scene 1: Headline */}
        <div ref={s1} className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter]">
          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-bold text-white text-center max-w-4xl px-6 leading-[1.05] tracking-tight" style={geist}>
            You shoot the photos.
            <br />
            We&apos;ll handle the rest.
          </h1>
        </div>

        {/* Scene 2: List + taglines */}
        <div ref={s2} className="absolute inset-0 flex items-center justify-center will-change-[opacity]" style={{ opacity: 0 }}>
          <div className="w-full max-w-6xl px-12 grid grid-cols-2 items-start gap-16">
            {/* Left: list */}
            <div ref={s2ListContainer} className="will-change-[opacity] flex justify-end">
              <div className="space-y-3">
                {LIST_ITEMS.map((item, i) => (
                  <div key={item} ref={el => { s2Items.current[i] = el }} className="flex items-center gap-4 will-change-[transform,opacity,filter]" style={{ opacity: 0 }}>
                    <div className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white/90 leading-tight" style={geist}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: taglines — stacked, aligned to left edge of right column */}
            <div ref={s2Right} className="will-change-[transform,opacity] flex flex-col gap-0" style={{ opacity: 0 }}>
              <p ref={s2Tag1} className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-[1.1] mb-3" style={{ ...geist, opacity: 0, textAlign: 'justify' }}>{TAGLINE_1}</p>
              <p ref={s2Tag2} className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white/50 leading-[1.1]" style={{ ...geist, opacity: 0, textAlign: 'justify', textAlignLast: 'justify' }}>{TAGLINE_2}</p>
            </div>
          </div>
        </div>

        {/* Scene 3: Mockup — no container, raw image fills screen */}
        <div ref={sMockup} className="absolute inset-0 flex items-center justify-center will-change-[opacity]" style={{ opacity: 0 }}>
          <div ref={sMockupImg} className="will-change-[transform,filter]" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <NextImage
              src="/images/dashboard-v2-preview.png"
              alt="View1 Sort Dashboard"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Scene 4: Waitlist form */}
        <div ref={sForm} className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter]" style={{ opacity: 0 }}>
          <div className="w-full max-w-xl px-6">
            <div className="rounded-[20px] border border-white/[0.10] bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <p className="text-2xl font-bold text-white text-center mb-2" style={geist}>Join the waitlist</p>
              <p className="text-sm text-white/35 text-center mb-6">Early access + lifetime discount for founding members.</p>
              <WaitlistForm size="large" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
