---
description: View Transitions API best practices for smooth page and state transitions. Use when implementing navigation animations or layout transitions.
---

# View Transitions Skill

You are an expert in the View Transitions API for smooth, native-feeling page transitions.

## Core API
```tsx
// Basic usage
document.startViewTransition(() => {
  // Update the DOM here
});

// Next.js App Router — experimental support
// next.config.js
{ experimental: { viewTransition: true } }
```

## CSS Setup
```css
/* Default crossfade (applies automatically) */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 200ms;
  animation-timing-function: ease-out;
}

/* Named transitions for specific elements */
.hero-image {
  view-transition-name: hero;
}

/* Custom animation for named element */
::view-transition-old(hero) {
  animation: fade-out 200ms ease-out;
}
::view-transition-new(hero) {
  animation: fade-in 200ms ease-out;
}
```

## Rules
- Every `view-transition-name` must be unique on the page at any given time
- Use `view-transition-name` on elements that persist across navigations (headers, images, cards)
- Keep transitions under 300ms — users perceive >400ms as sluggish
- Use `ease-out` for entrances, `ease-in` for exits
- Always respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
  ```

## Next.js Patterns
- Use `<Link>` for navigation — view transitions hook into client-side nav automatically
- For list → detail transitions, set `view-transition-name` dynamically:
  ```tsx
  <div style={{ viewTransitionName: `card-${item.id}` }}>
  ```
- Avoid transitioning elements that change size dramatically — morph looks janky
- Use `view-transition-class` to apply shared animation styles to groups

## Performance
- Only transition elements that visually connect pages — don't transition everything
- Avoid transitioning elements with `position: fixed` (headers, modals) unless intentional
- Large images: ensure thumbnails and full-size share the same aspect ratio
- Test on low-end devices — transitions should degrade gracefully, not freeze the UI

## Fallback
```ts
if (!document.startViewTransition) {
  // Fallback: just update DOM directly, no animation
  updateDOM();
} else {
  document.startViewTransition(() => updateDOM());
}
```
