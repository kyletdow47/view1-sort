---
description: GSAP animation best practices including core, ScrollTrigger, and React integration. Use when implementing animations with GSAP.
---

# GSAP Animation Skill

You are an expert in GSAP (GreenSock Animation Platform) for high-performance web animations.

## Core Principles
- GSAP animates any numeric property on any JS object — not just CSS
- Use `gsap.to()` for destination-based, `gsap.from()` for entrance, `gsap.fromTo()` for full control
- Always animate `transform` properties (x, y, scale, rotation) over layout properties (top, left, width, height)
- GSAP uses its own property names: `x` (translateX), `y` (translateY), `rotation` (rotate), `scale`

## Core API
```ts
// Basic tween
gsap.to('.element', {
  x: 100,
  opacity: 1,
  duration: 0.6,
  ease: 'power2.out',
});

// Timeline for sequenced animations
const tl = gsap.timeline();
tl.to('.title', { y: 0, opacity: 1, duration: 0.4 })
  .to('.subtitle', { y: 0, opacity: 1, duration: 0.3 }, '-=0.1') // overlap
  .to('.cta', { scale: 1, opacity: 1, duration: 0.3 }, '-=0.1');

// Stagger
gsap.to('.card', {
  y: 0,
  opacity: 1,
  duration: 0.4,
  stagger: 0.08,
  ease: 'power2.out',
});
```

## Easing
- `power2.out` — default for most UI entrances (decelerating)
- `power2.inOut` — smooth for position changes and morphs
- `power3.out` — snappier entrances, hero elements
- `back.out(1.4)` — slight overshoot, playful UI
- `elastic.out(1, 0.3)` — bouncy, use sparingly
- Never use `linear` for UI animation — it feels robotic

## ScrollTrigger
```ts
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

gsap.to('.section', {
  scrollTrigger: {
    trigger: '.section',
    start: 'top 80%',    // when top of trigger hits 80% of viewport
    end: 'bottom 20%',
    toggleActions: 'play none none reverse', // onEnter onLeave onEnterBack onLeaveBack
    // scrub: true,       // tie animation progress to scroll position
  },
  y: 0,
  opacity: 1,
  duration: 0.8,
});

// Pin an element during scroll
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: '+=500',
  pin: true,
});
```

## React Integration
```tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function AnimatedSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // All GSAP code here — auto-cleaned up on unmount
    gsap.from('.card', {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, { scope: container }); // scope limits selectors to this container

  return (
    <div ref={container}>
      <div className="card">...</div>
      <div className="card">...</div>
    </div>
  );
}
```

## Rules
- Always use `useGSAP` hook in React — never raw `useEffect` with GSAP (cleanup issues)
- Always `gsap.registerPlugin()` before using any plugin
- Scope animations to a container ref — never animate globally in components
- Kill tweens/timelines on unmount — `useGSAP` does this automatically
- Use `gsap.context()` outside React for manual cleanup
- Set initial state in CSS, animate from there — don't rely on GSAP for initial render
- Use `will-change: transform` on elements you'll animate (sparingly)

## Performance
- Batch DOM reads before writes — GSAP does this internally for its properties
- Limit simultaneous tweens to ~20 on mobile
- Use `ScrollTrigger.batch()` for animating many elements on scroll efficiently
- `scrub: true` is more performant than `scrub: 0.5` (no interpolation lag)
- Use `gsap.ticker` instead of `requestAnimationFrame` for synced animations
- Always test on low-end mobile — 60fps on desktop means nothing

## Accessibility
- Respect `prefers-reduced-motion`:
  ```ts
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    gsap.globalTimeline.timeScale(20); // instant completion
  }
  ```
- Ensure animated content is still reachable by keyboard/screen reader
- Don't animate content that conveys critical information
