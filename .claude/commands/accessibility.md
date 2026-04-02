---
description: Accessibility (a11y) audit and best practices following WCAG 2.2 AA. Use when building UI or reviewing components for accessibility compliance.
---

# Accessibility Skill

You are an accessibility expert. Ensure all UI meets WCAG 2.2 AA standards.

## Semantic HTML
- Use correct elements: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`
- Never use `<div onClick>` — use `<button>` or add `role`, `tabIndex`, and keyboard handlers
- Use heading levels in order (h1 → h2 → h3) — never skip levels
- One `<main>` per page, one `<h1>` per page

## ARIA
- First rule of ARIA: don't use ARIA if native HTML does the job
- Required ARIA patterns:
  - Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  - Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
  - Alerts: `role="alert"` or `aria-live="polite"` for dynamic content
  - Loading: `aria-busy="true"` on the container being updated
- Always pair icons-only buttons with `aria-label`
- Use `aria-describedby` to link error messages to form fields
- Use `aria-expanded` on disclosure/accordion triggers

## Keyboard Navigation
- All interactive elements must be reachable via Tab
- Logical tab order — matches visual reading order
- Focus trap inside modals — Tab cycles within, Escape closes
- Visible focus indicator on all interactive elements (`focus-visible:ring-2`)
- Custom components need full keyboard support:
  - Dropdowns: Arrow keys to navigate, Enter to select, Escape to close
  - Tabs: Arrow keys between tabs, Tab to move into panel

## Forms
- Every input needs a visible `<label>` (or `aria-label` for search/icon inputs)
- Group related fields with `<fieldset>` + `<legend>`
- Error messages: linked with `aria-describedby`, use `aria-invalid="true"`
- Required fields: use `aria-required="true"` or `required` attribute
- Don't rely on placeholder as label — it disappears on focus

## Color & Contrast
- Text: 4.5:1 contrast ratio minimum (3:1 for large text 18px+/bold 14px+)
- UI components and graphical objects: 3:1 against adjacent colors
- Never use color alone — pair with icons, patterns, or text
- Test with simulated color blindness (protanopia, deuteranopia, tritanopia)

## Images & Media
- All `<img>` need `alt` text — descriptive for content images, `alt=""` for decorative
- Complex images (charts, infographics): provide text alternative nearby
- Videos: captions required, audio descriptions for important visual content
- Animated content: provide pause/stop control, respect `prefers-reduced-motion`

## Testing Checklist
When reviewing for accessibility:
1. Navigate entire page with keyboard only — can you reach and operate everything?
2. Run axe-core or Lighthouse accessibility audit
3. Test with screen reader (VoiceOver on Mac: Cmd+F5)
4. Check all form fields have labels and error states are announced
5. Verify color contrast with a contrast checker tool
6. Resize to 400% zoom — is content still usable?
7. Check `prefers-reduced-motion` is respected
8. Verify focus management in modals and dynamic content
