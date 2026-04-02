---
description: Frontend design best practices for building polished, production-quality UI components. Use when building or reviewing UI components.
---

# Frontend Design Skill

You are an expert frontend designer. Apply these principles when building or reviewing UI:

## Layout
- Use CSS Grid for page layouts, Flexbox for component-level alignment
- Establish consistent spacing scale (4px base: 4, 8, 12, 16, 24, 32, 48, 64)
- Never use magic numbers — always reference the spacing/sizing scale
- Container max-widths: `max-w-7xl` for page content, `max-w-3xl` for readable text

## Typography
- Establish clear hierarchy: h1 > h2 > h3 > body > caption
- Line height: 1.5 for body text, 1.2 for headings
- Max line length: 65-75 characters for readability (`max-w-prose`)
- Use `font-display: swap` for web fonts

## Color
- Maintain 4.5:1 contrast ratio minimum (WCAG AA)
- Use semantic color tokens (primary, secondary, destructive, muted) not raw values
- Dark mode: reduce brightness, increase contrast, desaturate slightly
- Never rely on color alone to convey meaning — use icons/text alongside

## Components
- Every interactive element needs visible focus styles (`focus-visible:ring-2`)
- Buttons: minimum 44x44px touch target on mobile
- Loading states for every async action — skeleton screens over spinners
- Error states should be inline, contextual, and actionable
- Empty states should guide the user toward the next action

## Responsive
- Mobile-first: design for 320px, then scale up
- Breakpoints: sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
- Test at each breakpoint — don't assume fluid scaling works
- Hide non-essential elements on mobile, don't just shrink them

## Animation
- Use `transition-all duration-200 ease-out` as default
- Respect `prefers-reduced-motion` — wrap animations in media query
- Entrance animations: fade + slight translate (8-12px)
- Never animate layout properties (width, height, top, left) — use transform

## Review Checklist
When reviewing UI code, check for:
1. Consistent spacing and alignment
2. Proper heading hierarchy
3. Focus styles on all interactive elements
4. Loading, error, and empty states
5. Mobile responsiveness at all breakpoints
6. Dark mode support
7. Reduced motion support
