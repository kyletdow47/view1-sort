'use client'

import { useEffect, useRef, useState } from 'react'

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }
function sp(global: number, start: number, end: number) { return clamp((global - start) / (end - start), 0, 1) }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }

/* Rainbow gradient for the active word */
const RAINBOW = 'linear-gradient(135deg, #F59E0B 0%, #3B82F6 25%, #A855F7 50%, #EC4899 75%, #3B82F6 100%)'

const WORDS_LINE1 = ['Upload.', 'Sort.', 'Deliver.']
const WORD_LINE2 = 'Get paid.'
const ALL_WORDS = [...WORDS_LINE1, WORD_LINE2]

/*
 * Timeline (200vh runway):
 * 0.00–0.10: "HOW IT WORKS" label fades in
 * 0.10–0.70: Words appear one by one — active word is rainbow, previous turn white
 *   Word 0 (Upload.):  0.10–0.25
 *   Word 1 (Sort.):    0.25–0.40
 *   Word 2 (Deliver.): 0.40–0.55
 *   Word 3 (Get paid.):0.55–0.70
 * 0.70–0.85: Hold complete state
 * 0.85–1.00: Everything fades out / scrolls up
 */

function MobileHowItWorks() {
  const geist = { fontFamily: "'Geist', system-ui, sans-serif" } as const
  return (
    <div className="relative z-10 px-5 py-16" id="how-it-works">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">How It Works</span>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {WORDS_LINE1.map(w => (
            <span key={w} className="text-4xl font-extrabold text-white leading-none tracking-tight" style={geist}>{w}</span>
          ))}
        </div>
        <span className="text-4xl font-extrabold text-white leading-none tracking-tight" style={geist}>{WORD_LINE2} ✅</span>
      </div>
    </div>
  )
}

export function ScrollHowItWorks() {
  const [isMobile, setIsMobile] = useState(true)
  const outerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const checkRef = useRef<HTMLSpanElement>(null)
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

      // Label fade in — quick, almost immediate
      if (labelRef.current) {
        const labelIn = easeOut(sp(p, 0, 0.03))
        labelRef.current.style.opacity = `${labelIn}`
        labelRef.current.style.transform = `translateY(${(1 - labelIn) * 15}px)`
      }

      // Word-by-word: active = rainbow gradient, previous = white, future = hidden
      const wordSlots = [
        [0.10, 0.25], // Upload.
        [0.25, 0.40], // Sort.
        [0.40, 0.55], // Deliver.
        [0.55, 0.70], // Get paid.
      ]

      wordRefs.current.forEach((el, i) => {
        if (!el) return
        const [wStart, wEnd] = wordSlots[i]
        const wp = sp(p, wStart, wEnd)
        const isActive = p >= wStart && p < wEnd
        const isDone = p >= wEnd
        const isFuture = p < wStart

        if (isFuture) {
          el.style.opacity = '0'
          el.style.transform = 'translateY(20px)'
          el.style.filter = 'blur(4px)'
          el.style.backgroundImage = 'none'
          el.style.color = 'white'
          el.style.webkitTextFillColor = ''
        } else if (isActive) {
          const e = easeOut(wp)
          el.style.opacity = `${e}`
          el.style.transform = `translateY(${(1 - e) * 20}px)`
          el.style.filter = `blur(${(1 - e) * 4}px)`
          // Rainbow gradient text
          el.style.backgroundImage = RAINBOW
          el.style.backgroundClip = 'text'
          el.style.webkitBackgroundClip = 'text'
          el.style.webkitTextFillColor = 'transparent'
          el.style.color = 'transparent'
        } else if (isDone) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          el.style.filter = 'none'
          // Turn white
          el.style.backgroundImage = 'none'
          el.style.webkitTextFillColor = ''
          el.style.color = 'white'
        }
      })

      // Green checkmark appears after last word (0.70–0.78)
      if (checkRef.current) {
        const checkIn = sp(p, 0.70, 0.78)
        const e = easeOut(checkIn)
        // Bounce: overshoot to 1.2 then settle to 1.0
        const scale = checkIn < 0.6 ? e * 1.2 : 1.2 - (checkIn - 0.6) / 0.4 * 0.2
        checkRef.current.style.opacity = `${e}`
        checkRef.current.style.transform = `scale(${scale})`
      }

      // Fade out everything at the end (0.85–1.0)
      const fadeOut = sp(p, 0.85, 1.0)
      if (fadeOut > 0) {
        const allEls = [labelRef.current, ...wordRefs.current, checkRef.current]
        allEls.forEach(el => {
          if (!el) return
          const currentOp = parseFloat(el.style.opacity || '1')
          el.style.opacity = `${currentOp * (1 - easeOut(fadeOut))}`
        })
      }

      raf.current = requestAnimationFrame(animate)
    }

    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [isMobile])

  const geist = { fontFamily: "'Geist', system-ui, sans-serif" } as const

  if (isMobile) return <MobileHowItWorks />

  return (
    <div ref={outerRef} style={{ height: '150svh' }} className="relative z-10" id="how-it-works">
      <div className="sticky top-0 w-full flex items-center justify-center" style={{ height: '100svh', overflow: 'clip' }}>
        <div className="flex flex-col items-center gap-6">

          {/* Label */}
          <div ref={labelRef} className="will-change-[transform,opacity]" style={{ opacity: 0 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">How It Works</span>
          </div>

          {/* Line 1: Upload. Sort. Deliver. */}
          <div className="flex items-baseline justify-center gap-2 sm:gap-4 lg:gap-8 px-4">
            {WORDS_LINE1.map((word, i) => (
              <span
                key={word}
                ref={el => { wordRefs.current[i] = el }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-[96px] font-extrabold leading-none tracking-tight will-change-[transform,opacity,filter]"
                style={{ ...geist, opacity: 0 }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 2: Get paid. + checkmark */}
          <div className="flex items-center gap-3 sm:gap-6">
            <span
              ref={el => { wordRefs.current[3] = el }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[96px] font-extrabold leading-none tracking-tight will-change-[transform,opacity,filter]"
              style={{ ...geist, opacity: 0 }}
            >
              {WORD_LINE2}
            </span>
            <span
              ref={checkRef}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[96px] will-change-[transform,opacity]"
              style={{ opacity: 0 }}
            >
              ✅
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
