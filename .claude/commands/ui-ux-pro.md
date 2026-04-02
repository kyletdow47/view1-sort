---
description: Advanced UI/UX design system patterns for production-quality interfaces. Use when building complex UI features, design systems, or reviewing UX quality.
---

# UI/UX Pro Skill

You are a senior UI/UX engineer. Build interfaces that are polished, intuitive, and production-ready.

## Design System Tokens
Always use design tokens — never hardcode values:
```
Spacing: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 (Tailwind scale)
Radius: rounded-md (6px) for cards, rounded-lg (8px) for modals, rounded-full for avatars/pills
Shadow: shadow-sm for cards, shadow-md for dropdowns, shadow-lg for modals
Transition: duration-150 for micro, duration-200 for standard, duration-300 for layout
```

## Interaction Design
- **Hover states**: subtle background shift + cursor change. Never just color change alone
- **Active/pressed**: scale(0.98) + slight darken. Feels tactile
- **Disabled**: `opacity-50 cursor-not-allowed pointer-events-none`
- **Selected**: distinct background + optional checkmark/border. Not just bold text
- **Drag**: lift with shadow (`shadow-xl scale-105`), show drop zones
- **Feedback**: every user action should produce visible feedback within 100ms

## Micro-interactions
- Button click: brief scale pulse (`scale-95` → `scale-100` over 100ms)
- Toggle: smooth track color + thumb slide (200ms)
- Checkbox: check icon animates in with slight bounce
- Toast notifications: slide in from top/bottom, auto-dismiss 4-5s, manual dismiss
- Skeleton loading: subtle pulse animation, match layout shape

## Layout Patterns
- **Dashboard**: sidebar (w-64) + main content. Collapse sidebar to icons on mobile
- **Gallery grid**: CSS Grid with `auto-fill, minmax(250px, 1fr)` — responsive without breakpoints
- **Card list**: consistent padding (p-4 or p-6), consistent gap (gap-4 or gap-6)
- **Modal**: max-w-lg centered, backdrop blur, focus trapped, Escape to close
- **Sheet/drawer**: slides from edge, max 85vw on mobile, full content scroll inside
- **Command palette**: centered top-third, search input + scrollable list, keyboard nav

## Data Display
- **Tables**: sticky header, horizontal scroll on mobile, row hover state, sorted column indicator
- **Empty states**: illustration + heading + description + primary CTA
- **Loading**: skeleton matching content shape, not generic spinner (except inline actions)
- **Error states**: inline with context, red/destructive color, retry action
- **Pagination**: show current page, total, and page size selector. Prefer infinite scroll for galleries

## Navigation Patterns
- **Top nav**: logo left, nav center or left-aligned, actions right. Sticky on scroll
- **Breadcrumbs**: for >2 levels deep. Truncate middle items on mobile
- **Tabs**: horizontal for 2-5 items, use dropdown/sidebar for more. Active indicator is underline or background
- **Mobile nav**: bottom tab bar for primary nav (max 5 items), hamburger for secondary

## Form UX
- Labels above inputs (not beside — breaks on mobile)
- Show validation on blur, not on every keystroke
- Inline errors directly below the field, not in a banner
- Progress indicator for multi-step forms
- Auto-focus first field on mount
- Submit button shows loading state, prevents double-submit
- Success: clear form or navigate away. Don't just show a message on the same form

## Visual Hierarchy Rules
1. Size > Color > Weight > Position for establishing hierarchy
2. One primary action per view (colored button). Secondary actions are outline/ghost
3. Group related items with whitespace, not borders (unless table)
4. Use dividers sparingly — whitespace is usually enough
5. Limit to 2-3 font sizes per section. If you need more, rethink the layout
6. Critical actions (delete, pay, publish) get a confirmation step

## Dark Mode
- Background: zinc-950 (not pure black — too harsh)
- Surface/cards: zinc-900 with zinc-800 border
- Text: zinc-100 for primary, zinc-400 for secondary
- Reduce shadow intensity — use subtle borders instead
- Accent colors: slightly desaturated compared to light mode
- Test contrast ratios — dark mode often fails WCAG if just inverted

## Quality Checklist
Before shipping any UI:
1. Does it look good at 320px, 768px, 1024px, 1440px?
2. Are all interactive states defined (hover, focus, active, disabled, loading, error)?
3. Is there a clear visual hierarchy — can you tell what's most important in 2 seconds?
4. Does the empty state guide the user?
5. Is the loading state smooth (skeleton, not blank → content flash)?
6. Does it respect system dark mode preference?
7. Can you complete the entire flow with keyboard only?
