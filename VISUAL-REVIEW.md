# Visual Review Notes — View1 Sort

**Reviewed:** 2026-04-02  
**Status:** Actionable

---

## Global: Design Language Rule

**Pill → Rectangular audit required.**  
The `Badge` component ([src/components/common/Badge.tsx](src/components/common/Badge.tsx)) uses `rounded-full` by default. Status badges in analytics, bookings, and clients pages follow the same pattern. These should use `rounded-md` (8px) or `rounded-lg` (12px) instead.

**Exceptions** (keep `rounded-full`): avatar initials, notification dot indicators, progress bar fills, circular icon containers.

**Hardcoded color debt:** Analytics, Clients, and Bookings pages contain raw hex values (`#818cf8`, `#34d399`, `#e7765f`, etc.) instead of theme tokens. Replace all with semantic tokens (`text-primary`, `text-success`, `text-error`, etc.) from the design system. This is noted as priority zero in CLAUDE.md.

---

## Navigation Restructure

### Current State (from [DashboardClientLayout.tsx](src/components/features/workspace/DashboardClientLayout.tsx))
```
navItems:        Dashboard · AI Sort · Gallery · Projects · Clients · Analytics & Finances
schedulingItems: Calendar · Content Hub · Booking Forms · Bulk Management (collapsible)
```

**Bugs found:**
- "Analytics & Finances" links to `/dashboard/billing` — should link to `/dashboard/analytics`
- "Scheduling" is a vague, collapsible group that buries Bookings — dissolve it
- Content Hub has no place in Scheduling — should move to Analytics sub-nav
- Calendar/Booking Forms should move under Bookings

### Target Nav Order
```
1. Dashboard        → /dashboard
2. AI Sort          → /dashboard/ai-sort        [sub-menu]
3. Gallery          → /dashboard/gallery         [sub-menu]
4. Projects         → /dashboard/projects        [sub-menu]
5. Clients          → /dashboard/clients         [sub-menu]
6. Bookings         → /dashboard/bookings        [sub-menu]
7. Analytics        → /dashboard/analytics       [sub-menu]
```

Settings stays at the bottom (no change). Remove "Bulk Management" from nav — surface only via actions.

### Sub-nav items per section

| Section | Sub Items | Route |
|---|---|---|
| Dashboard | *(action buttons, no sub-nav)* | |
| AI Sort | Upload & Sort · AI Workspace · Sort Preferences · Vibe Presets | `/dashboard/ai-sort`, `/dashboard/ai-workspace`, `/dashboard/settings/ai-profile` |
| Gallery | All Photos · AI Curation · Completed Galleries | `/dashboard/gallery` |
| Projects | All Projects · New Project | `/dashboard/projects`, `/dashboard/project/new` |
| Clients | All Clients · New Client | `/dashboard/clients` |
| Bookings | Schedule · Products & Events · Public Page · Pay Gate | `/dashboard/bookings`, `/dashboard/calendar` |
| Analytics | Overview · Content · Finance · Bookings | `/dashboard/analytics`, `/dashboard/content`, `/dashboard/finances` |

### Header title mapping fix (line 629–639 in DashboardClientLayout.tsx)
Add missing routes: gallery, bookings, finances, projects.

---

## 1. AI Sort

### Current State
- `/dashboard/ai-sort/page.tsx` — exists (content unknown, likely stub)
- `/dashboard/ai-workspace/page.tsx` — exists (post-sort workspace)
- No clear upload entry flow confirmed

### Issues
- No upload entry point confirmed when clicking "AI Sort" from nav
- AI Workspace (post-sort view) appears to exist before upload flow is built
- Navigation label was "AI Workspace" — now "Sorting" ✓

### Pages Needed
- [ ] **Upload Page** (`/dashboard/ai-sort`) — drag-and-drop zone, folder structure detection, sort settings panel; this is the entry point
- [ ] **AI Workspace** (`/dashboard/ai-workspace`) — shown after sort completes; review, approve, re-sort categories
- [ ] **Sorting Preferences** — expand existing `/dashboard/settings/ai-profile`
- [ ] **Vibe-Sort Preset Generator** (`/dashboard/presets`) — route exists, likely stub; build out

### Improvements
- Upload page: real-time multi-step progress indicator (Uploading → Analyzing → Sorted)
- Batch upload with folder structure detection
- Show estimated sort time based on photo count before starting
- Vibe preset generator: suggest vibes based on past shoot metadata + style tags
- After sort, AI Workspace shows confidence scores per photo with override controls

---

## 2. Gallery Builder

### Current State
- `/dashboard/gallery/page.tsx` — photographer-facing gallery manager (exists)
- `/gallery/[id]/page.tsx` — public client gallery view (exists, with approve/cart/checkout/edits sub-routes)
- `/gallery/page.tsx` — is just "Gallery coming soon" placeholder
- 4 gallery themes exist as CSS modules: `dark`, `light`, `minimal`, `editorial`
- `GlassPanel` component exists in dashboard-v2 — can be leveraged for Liquid Glass preview

### Issues
- Gallery page (`/gallery/page.tsx`) is a placeholder — needs full build
- Current gallery entry flow skips the "all photos" overview
- Gallery themes are named by color/mood (`dark`, `light`) not by shape/layout — rename and redesign
- Live preview lacks immersive feel

### Pages Needed
- [ ] **All Photos** (`/dashboard/gallery`) — masonry/scattered layout with centered "See Photos" + "Create Gallery" CTAs
- [ ] **AI Curation Setup** — modal or step within gallery creation flow
- [ ] **Completed Gallery** — review + share page; links to public gallery URL, password toggle, watermark toggle

### Flow Change
```
Gallery (nav) → All Photos → Create Gallery button
  → AI Curation Setup → Live Preview (Liquid Glass scroll) → Confirm
  → Completed Gallery (share link, password, expiry)
```

### Improvements
- **Live Preview redesign:** Use `GlassPanel` + `glass-effect` CSS utilities already in [globals.css](src/styles/globals.css). Full-scroll with frosted glass overlays, depth blur. Client scrolls → selects favorites → Confirm → routed to their curated gallery page.
- **Gallery Themes:** Rename existing CSS modules from color-names to layout-names. Proposed: `editorial-grid`, `staggered-masonry`, `filmstrip`, `polaroid-scatter`, `minimal-fullbleed`. Each theme should show a preview thumbnail in the picker — not a color swatch.
- Watermark preview toggle in live preview (reuse watermark settings from `/dashboard/settings/watermark`)
- Share link + password protection directly on Completed Gallery page (password gate already exists in `GalleryPasswordGate.tsx`)

---

## 3. Bookings

### Current State
- `/dashboard/bookings/page.tsx` — exists; currently shows **Kanban pipeline view** (4 columns) with booking cards, mini calendar, and statistics
- `/dashboard/booking/page.tsx` — also exists (possibly duplicate or alternative)
- `/dashboard/booking-forms/page.tsx` — exists
- `/dashboard/calendar/page.tsx` — exists (likely stub)
- `/book/[photographerId]/page.tsx` — public-facing booking page exists

### Issues
- Bookings page is a Kanban pipeline — needs to become a **scheduling calendar** as the main view
- Kanban view is useful but should be a secondary tab/view, not the primary
- No products/event types configuration page
- No pay gate setup
- Public booking page exists (`/book/[photographerId]`) but needs Calendly-style polish
- No floating email editor

### Pages Needed
- [ ] **Schedule Page** (`/dashboard/bookings`) — rebuild as 3-column layout:
  ```
  [ Inquiry Inbox (left) ]  [ Large Calendar (center) ]  [ Products & Events (right) ]
  ```
- [ ] **Products & Event Types** (`/dashboard/packages`) — route exists, likely stub; build out
- [ ] **Public Booking Page** (`/book/[photographerId]`) — exists, needs Calendly-style redesign
- [ ] **Pay Gate Setup** — new page or section within booking settings
- [ ] **Email Editor** — floating popup overlay (reusable component); triggered by inbox click

### Improvements
- Keep the Kanban pipeline as a tab ("Pipeline") within the Bookings section
- Calendar cells should show: booking type color, payment status indicator, time
- Clicking an inbox message → floating email editor (shared component with Clients)
- "View Public Page" button → opens `/book/[photographerId]` in new tab
- Product cards: type, duration, price, bookings this month, enable/disable toggle
- Pay gate options: (1) Pay to book, (2) Pay to receive gallery download, (3) Both, (4) None
- Auto-send confirmation + contract on booking payment
- Google Calendar / iCal sync via existing `/dashboard/settings/connect` integrations

---

## 4. Projects

### Current State
- `/dashboard/projects/page.tsx` — exists (all projects grid)
- `/dashboard/project/[id]/page.tsx` — individual project page exists
- `/dashboard/project/new` — new project route exists (linked from sidebar "New Shoot" button)
- `ProjectCard.tsx` component exists in [src/components/features/workspace/ProjectCard.tsx](src/components/features/workspace/ProjectCard.tsx)

### Issues
- "Revenue this month" stat on projects view → replace with **"Unpaid Work"**
- Project cards missing: photo count, client name, creation date
- Project name is not overlaid on cover image
- Project page header tab navigation shows "Metadata" and "Export History" as `<span>` elements (not linked — line 584–597 in DashboardClientLayout.tsx)

### Pages Needed
- [x] **All Projects** — exists, needs card redesign
- [x] **Individual Project** — exists (`/dashboard/project/[id]`)
- [x] **New Project** — exists (`/dashboard/project/new`)

### Project Card Redesign
```
┌─────────────────────────────┐
│  [Cover Image full bleed]   │
│                             │
│                        847  │  ← large semi-transparent photo count
│  Wedding · Smith ·  ●Live   │  ← overlay: name / client / status  
│  Apr 2, 2026                │
└─────────────────────────────┘
```
- Cover image: full-bleed, aspect-ratio-[4/3]
- Gradient scrim: bottom 40%, `bg-gradient-to-t from-black/70 to-transparent`
- Project name: `text-white font-bold` overlay bottom-left
- Client name · date · status: `text-white/70 text-xs` below name
- Photo count: `text-white/40 text-4xl font-black` absolute bottom-right
- Hover state: reveal 3 quick actions (Edit, Share Gallery, View Invoice)

### Fix: Project Page Tabs
Line 584–597 in DashboardClientLayout.tsx uses `<span>` for "Metadata" and "Export History" tabs instead of `<Link>` — these are non-functional. Convert to proper links.

### Improvements
- Filter bar above grid: All · Active · Delivered · Archived + date range picker
- Drag-to-reorder with persist (or sort by: date, status, unpaid first)
- Replace "Revenue this month" KPI with "Unpaid Work" total

---

## 5. Clients

### Current State
- `/dashboard/clients/page.tsx` — exists; large file with Kanban + client sidebar details + rules/workflows
- `/dashboard/clients/[id]/page.tsx` — client detail page exists

### Issues
- Kanban status badge on cards is redundant (column already shows status)
- Cards show project names — problematic when clients have many projects
- No list view (toggle between Kanban / List)

### Pages Needed
- [x] **All Clients (Kanban)** — exists, needs card redesign
- [ ] **List View** — sortable table: client name, location, # projects, last activity, notification count
- [x] **Client Detail** — exists (`/dashboard/clients/[id]`)
- [ ] **New Client** — form page (may exist inline; verify)

### Kanban Card Redesign
**Remove:** status badge, project name list  
**Keep:** client name, location  
**Add:** notification dot (unread messages / pending actions), last active date

### Improvements
- View toggle (Kanban / List) with `localStorage` preference persistence
- "Quick Message" button on card → opens shared email editor overlay (same component as Bookings inbox)
- Client detail page: contact info, all shoots with status, gallery links, invoice history, notes section
- Search/filter bar: by location, status, last active

---

## 6. Settings

### Current State (routes confirmed to exist)
- `/dashboard/settings` — main hub
- `/dashboard/settings/branding` ✓
- `/dashboard/settings/ai-profile` ✓ (AI preferences wizard)
- `/dashboard/settings/themes` ✓
- `/dashboard/settings/connect` ✓ (integrations)
- `/dashboard/settings/team` ✓
- `/dashboard/settings/emails` ✓
- `/dashboard/settings/watermark` ✓
- `/dashboard/settings/booking-forms` ✓
- `/dashboard/settings/offers` ✓
- **Missing:** Profile page, Subscription page

### Issues
- AI Setup Wizard at `/dashboard/settings/ai-profile` is shallow — needs more data entry
- No Profile page (basic account info)
- No Subscription/billing management page (different from `/dashboard/billing`)

### Pages Needed
- [ ] **Profile** (`/dashboard/settings/profile`) — name, profile photo, bio, contact info, social links
- [ ] **Subscription** (`/dashboard/settings/subscription`) — current plan, usage stats, upgrade CTA, billing history

### AI Preferences Expansion (`/dashboard/settings/ai-profile`)
Add these sections to the existing wizard:
- Shooting style tags (wedding, portrait, commercial, event, editorial) — multi-select
- Auto-sort categories to enable/disable per shoot type — toggles
- Minimum confidence threshold slider (0–100%) per category
- Auto-reject rules: blurry, duplicate, eyes-closed, overexposed — toggles
- Preferred hero-shot criteria: sharpness weight, composition weight, expression weight — sliders
- Vibe/mood keywords that bias curation ranking — tag input
- Delivery defaults: watermark on/off, max selects per gallery, gallery expiry date

### Settings Nav Rename
- Rename `connect` → `integrations` (route alias is fine, just the label)
- Add Profile and Subscription to the settings sub-nav list

---

## 7. Client Portal

### Current State
- `/client/page.tsx` — exists (client-facing portal home)
- `/gallery/[id]/` — rich sub-routes: approve, cart, checkout, edits, edit-request, pricing
- `GalleryPasswordGate.tsx`, `AccessGate.tsx`, `CartView.tsx`, `CheckoutForm.tsx` — all exist
- `PhotoCommentPanel.tsx` — exists (per-photo comments/notes)

### Issues
- Favorite photos not prominently featured on portal home
- Limited discovery/navigation features for clients

### Improvements
- **Favorite Photos Strip** — horizontal scroll row in bottom third of portal home (use `CartView.tsx` as reference for selection state)
- **Shoot Map** — visual map of all shoot locations; GPS from photo metadata or manual pin; use Mapbox or Google Maps embed
- **New Shoot Request** — simple inquiry form within portal (pre-fills photographer's booking form)
- **Make Selections** — client marks favorites from gallery (already partially built via `/gallery/[id]/approve`) — surface more prominently
- **Revision Requests** — client flags photos with notes; `PhotoCommentPanel.tsx` already exists, integrate into revision flow
- **Portal Home layout:** Header (photographer branding) → Hero gallery strip → Active galleries list → Favorites strip → Request new shoot CTA

---

## 8. Content Hub

### Current State
- `/dashboard/content/page.tsx` — exists (social calendar + AI caption stub)
- Listed in `schedulingItems` in nav — needs to move to Analytics sub-nav

### Issues
- Instagram/Facebook platform tags not visible
- Stats section at top is sparse

### Improvements
- **Stats row** (top of page): Total Posts · Avg. Engagement Rate · Best Performing Post · Scheduled This Week · Drafts
- **Platform tags:** Replace text labels with colored icon badges — Instagram gradient ring, Facebook solid blue, TikTok dual-color. Use `rounded-md` not `rounded-full`.
- **Top Posts carousel** — 3-card horizontal scroll showing best performers by engagement (image + stat)
- **Calendar filter** — filter by platform (All / Instagram / Facebook / TikTok)
- Move Content Hub route from `schedulingItems` to Analytics sub-nav group

---

## 9. Analytics

### Current State
- `/dashboard/analytics/page.tsx` — exists; uses Recharts, glass morphism panels, KPIs, AI insights
- `/dashboard/finances/page.tsx` — exists (separate finance view)
- Hardcoded hex values confirmed in analytics page: `#818cf8`, `#34d399`, `#60a5fa`, `#FBBF24`, `#A78BFA`
- `rounded-3xl` used for glass cards — acceptable (large panel containers)

### Issues
- Panels misaligned (inconsistent heights, varying padding)
- Numbers in horizontal list rows are not vertically aligned
- Only one trend chart view; no metric switcher
- `rounded-full` used on some badge elements (lines ~737 in analytics page) — fix to `rounded-md`
- Hardcoded colors throughout — replace with semantic tokens
- No period-over-period comparison

### Improvements
- **Layout:** Enforce consistent grid — `fluid-grid-3` utility already in [globals.css](src/styles/globals.css). All stat panels same height via `min-h` constraint.
- **List panel alignment:** Use `tabular-nums` on all numeric cells + `text-right` with fixed-width column. Tailwind: `font-variant-numeric: tabular-nums` → `font-mono` class.
- **Trend Chart metric selector:** Dropdown/tabs above chart: Revenue · Bookings · Gallery Views · Client Inquiries · Photos Delivered · Engagement
- **Chart view toggle:** Weekly / Monthly / Quarterly + Line / Bar switcher
- **Sub-tabs:** Overview (merged KPIs) · Content · Finance · Bookings — each deep-dive panel
- **Period comparison:** "↑ 12% vs last month" beneath each KPI number
- **Token cleanup:** Replace all hex values with CSS token vars from [globals.css](src/styles/globals.css)

---

## Implementation Priority

| # | Item | File(s) Affected | Complexity |
|---|---|---|---|
| 1 | Fix nav: order, links, dissolve Scheduling group | [DashboardClientLayout.tsx](src/components/features/workspace/DashboardClientLayout.tsx) | Low |
| 2 | Fix `Badge` + status badges: `rounded-full` → `rounded-md` | [Badge.tsx](src/components/common/Badge.tsx), analytics, bookings pages | Low |
| 3 | Fix analytics + clients hardcoded colors → tokens | analytics/page.tsx, clients/page.tsx, bookings/page.tsx | Low |
| 4 | Fix project page tabs: `<span>` → `<Link>` | [DashboardClientLayout.tsx](src/components/features/workspace/DashboardClientLayout.tsx) line 584 | Low |
| 5 | Analytics: panel alignment + tabular numbers + metric switcher | analytics/page.tsx | Medium |
| 6 | Projects: card redesign + replace "Revenue" with "Unpaid Work" | [ProjectCard.tsx](src/components/features/workspace/ProjectCard.tsx) | Medium |
| 7 | AI Sort: Upload page flow | `/dashboard/ai-sort/page.tsx` | Medium |
| 8 | Clients: remove redundant badges, add List View toggle | `/dashboard/clients/page.tsx` | Medium |
| 9 | Settings: add Profile + Subscription pages; expand AI wizard | New pages under `/dashboard/settings/` | Medium |
| 10 | Content Hub: stats + platform tags + move to Analytics sub-nav | `/dashboard/content/page.tsx` | Medium |
| 11 | Bookings: rebuild as 3-col calendar layout; Products page | `/dashboard/bookings/page.tsx`, `/dashboard/packages/page.tsx` | High |
| 12 | Gallery: All Photos page + Liquid Glass live preview + theme rename | `/dashboard/gallery/page.tsx` + theme CSS modules | High |
| 13 | Client Portal: Favorites strip + Map + Selections prominence | `/src/app/client/page.tsx` | High |
| 14 | Shared Email Editor popup component (Bookings + Clients) | New `EmailComposer` component | Medium |
| 15 | Vibe-Sort Preset Generator | `/dashboard/presets/page.tsx` (route exists, build out) | Medium |

---

## Existing Pages — Status Matrix

| Route | Status | Notes |
|---|---|---|
| `/dashboard` | ✅ Built | DashboardV2 with own TopNav |
| `/dashboard/ai-sort` | ⚠️ Stub? | Verify content |
| `/dashboard/ai-workspace` | ⚠️ Stub? | Verify content |
| `/dashboard/gallery` | ⚠️ Needs rebuild | Start with All Photos layout |
| `/dashboard/projects` | ✅ Built | Card redesign needed |
| `/dashboard/project/[id]` | ✅ Built | Tab links broken (span → link) |
| `/dashboard/clients` | ✅ Built | Badge + card cleanup needed |
| `/dashboard/clients/[id]` | ✅ Built | Review completeness |
| `/dashboard/bookings` | ⚠️ Wrong layout | Rebuild as calendar |
| `/dashboard/calendar` | ⚠️ Stub? | Merge with bookings or remove |
| `/dashboard/analytics` | ✅ Built | Alignment + token cleanup |
| `/dashboard/finances` | ✅ Built | Move under Analytics sub-nav |
| `/dashboard/content` | ✅ Built | Move under Analytics sub-nav |
| `/dashboard/settings/*` | ✅ Most built | Add Profile + Subscription |
| `/dashboard/presets` | ⚠️ Stub? | Build Vibe-Sort Generator |
| `/dashboard/packages` | ⚠️ Stub? | Build Products & Event Types |
| `/book/[photographerId]` | ✅ Built | Needs Calendly-style redesign |
| `/client` | ✅ Built | Needs features (map, favorites) |
| `/gallery/[id]` | ✅ Built | Rich sub-routes exist |

---

## New Pages Master List (net new, not already built)

| Page | Route | Parent Section |
|---|---|---|
| Upload & Sort Settings | `/dashboard/ai-sort` (rebuild) | AI Sort |
| Vibe-Sort Preset Generator | `/dashboard/presets` (build out) | AI Sort |
| All Photos | `/dashboard/gallery` (rebuild) | Gallery |
| Clients List View | `/dashboard/clients?view=list` | Clients |
| New Client | `/dashboard/clients/new` | Clients |
| Products & Event Types | `/dashboard/packages` (build out) | Bookings |
| Public Booking Page | `/book/[id]` (redesign) | Bookings |
| Pay Gate Setup | `/dashboard/settings/pay-gate` | Bookings/Settings |
| Settings: Profile | `/dashboard/settings/profile` | Settings |
| Settings: Subscription | `/dashboard/settings/subscription` | Settings |
| Analytics: Content sub-tab | tab in `/dashboard/analytics` | Analytics |
| Analytics: Finance sub-tab | tab in `/dashboard/analytics` | Analytics |
| Analytics: Bookings sub-tab | tab in `/dashboard/analytics` | Analytics |
