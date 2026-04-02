# Pencil Revision Tasks — View1 Sort
> Source: VISUAL-REVIEW.md  
> Agent: pencil-writer (Opus model — no exceptions)  
> Rule: Delete old Built frames before writing new ones. One task = one frame.

---

## How to work through this list
1. Pick the next `[ ]` task
2. Read the task brief below
3. Call `mcp__pencil__get_editor_state` to locate the target frame by ID
4. Make revisions using `batch_design`
5. Save with `mcp__pencil__save`
6. Mark `[x]` and move to the next task

---

## Task Queue

### TASK 01 — Dashboard v2 (Navigation Restructure)
**Frame:** `jHMkx` — Dashboard v2  
**Status:** `[ ]`

**Changes:**
- Reorder sidebar nav to: Dashboard · AI Sort · Gallery · Projects · Clients · Bookings · Analytics
- Remove "Scheduling" collapsible group — dissolve into Bookings and Analytics
- "Analytics & Finances" label → "Analytics" (fix link target to `/dashboard/analytics`)
- Settings stays pinned at bottom (no change)
- Each nav item except Dashboard gets a small expand arrow (sub-nav indicator)
- Replace any `rounded-full` badge/tag elements visible on this screen with `rounded-md`
- "Revenue this month" KPI card (if present on dashboard) → rename to "Unpaid Work"

---

### TASK 02 — AI Sort: Upload Page (New Frame)
**Frame:** New — does not exist yet  
**Status:** `[ ]`

**Create new frame:** `AI Sort — Upload`  
Position: right of `I8wu6` (AI Workspace) with 100px gap

**Layout:**
```
[Sidebar nav — same as all screens]
[Main area]
  ↳ Page header: "AI Sort" with sub-tabs: Upload · Workspace · Preferences · Vibe Presets
  ↳ Large centered upload zone (drag-and-drop):
      - Dashed border, rounded-xl
      - Camera icon + "Drop photos or folders here"
      - "Browse Files" button (rounded-lg, primary)
  ↳ Sort Settings panel (right column, 320px):
      - Confidence threshold slider
      - Enable/disable sort categories (toggles)
      - Vibe keyword input
      - "Start Sorting" CTA button (full-width, primary)
  ↳ Bottom: progress states mockup (Uploading → Analyzing → Sorted) — shown as inactive steps
```

---

### TASK 03 — AI Workspace (Post-Sort Review)
**Frame:** `I8wu6` — AI Workspace  
**Status:** `[ ]`

**Changes:**
- Add sub-tab bar at top: Upload · **Workspace** (active) · Preferences · Vibe Presets
- Ensure this screen shows the state *after* sorting is complete
- Add confidence score badges on photo cards (e.g. "94%" in `rounded-md` tag, not pill)
- Replace any `rounded-full` tags/badges with `rounded-md`
- Add top-right actions: "Approve All" + "Re-Sort" buttons (rounded-lg)
- Verify category section headers use rectangular labels not pills

---

### TASK 04 — Projects (Card Redesign)
**Frame:** `XBDLS` — Projects  
**Status:** `[ ]`

**Changes to project cards:**
- Cover image: full-bleed, aspect-ratio 4:3
- Add gradient scrim: bottom 40% `rgba(0,0,0,0.7)` → transparent
- Project name: white bold text overlaid on image, bottom-left
- Client name · date · status: smaller white/70 text below name (inside scrim)
- Photo count: large (~48px) semi-transparent white numeral, absolute bottom-right
- Remove any text displayed *below* the image (move all into overlay)
- Card shape: `rounded-xl` (not pill, not sharp)

**Changes to page stats:**
- Replace "Revenue this month" KPI card with "Unpaid Work"

**Hover state:**
- Show 3 ghost action buttons on hover: Edit · Share Gallery · View Invoice

---

### TASK 05 — Gallery (All Photos Entry + Flow)
**Frame:** `iTVxS` — Gallery Builder  
**Status:** `[ ]`

**Rename frame:** Gallery Builder → Gallery — All Photos

**Redesign layout:**
```
[Full-screen photo grid — masonry/scattered layout]
[Center overlay — 2 large CTAs]:
  "See Photos" (secondary, large, rounded-lg)
  "Create Gallery" (primary, large, rounded-lg)
```

**Gallery themes picker (shown in Create Gallery flow):**
- Replace color swatches with layout shape previews
- Theme names: Editorial Grid · Staggered Masonry · Filmstrip · Polaroid Scatter · Minimal Full-Bleed
- Each shown as a small thumbnail card (not a color dot)

**New sub-frame within same screen or as an annotation:**
- Note: Live Preview should feel like Liquid Glass — frosted glass overlay, depth blur, parallax scroll

---

### TASK 06 — Booking (Calendar Layout Rebuild)
**Frame:** `vrsJs` — Booking  
**Status:** `[ ]`

**Rebuild as 3-column layout:**
```
┌──────────────────┬───────────────────────────┬──────────────────┐
│  Inquiry Inbox   │    Large Month Calendar    │ Products/Events  │
│  (240px)         │    (flexible center)       │ (280px)          │
│                  │                            │                  │
│  - Message list  │  - Month grid              │  - Event type    │
│  - Each row:     │  - Colored booking dots    │    cards         │
│    avatar, name, │  - Today highlighted       │  - Type · price  │
│    preview text, │  - Click → detail sidebar  │  - # booked      │
│    timestamp     │                            │  - Enable toggle │
│                  │                            │                  │
│  [Click → float  │  [View Public Page] btn    │  [+ New Type]    │
│   email editor]  │  top-right of calendar     │  button          │
└──────────────────┴───────────────────────────┴──────────────────┘
```

**Additional elements:**
- Sub-tabs at top: Schedule (active) · Pipeline · Products · Public Page
- "Pipeline" tab = the existing Kanban view (keep, just demote to tab)
- Booking dots on calendar: color-coded by type, with paid/unpaid indicator
- Replace any `rounded-full` status badges on booking cards with `rounded-md`

---

### TASK 07 — Clients (Kanban Card Cleanup)
**Frame:** `9eyUx` — Clients  
**Status:** `[ ]`

**Kanban card changes:**
- Remove: status badge (column header already shows status)
- Remove: project name list
- Keep: client name (bold), location (subdued)
- Add: notification dot (top-right corner of card) — red dot with count if unread
- Card shape: `rounded-xl`

**Page-level changes:**
- Add view toggle top-right: Kanban | List (icon buttons, `rounded-lg`)
- List view: sortable table — Name · Location · Projects · Last Active · Notifications
- Add search/filter bar above Kanban columns

**Remove from cards:** All `rounded-full` status pill badges

---

### TASK 08 — Analytics (Alignment + Polish)
**Frame:** `JNWPT` — Analytics  
**Status:** `[ ]`

**Layout fixes:**
- Enforce consistent panel heights — all KPI cards same height
- Numbers in list-type panels: right-aligned with tabular spacing (numbers line up vertically)
- All panels on same baseline grid (8px increments)

**Trend chart:**
- Add metric selector tabs/dropdown above chart: Revenue · Bookings · Gallery Views · Inquiries · Photos Delivered
- Add chart type toggle: Line | Bar
- Add period toggle: Weekly | Monthly | Quarterly
- Add period-over-period delta label beneath each KPI (e.g. "↑ 12% vs last month")

**Badge/tag fixes:**
- Replace `rounded-full` tags on "Top Galleries" and other list items with `rounded-md`

**Sub-tabs:**
- Add sub-tab bar: Overview · Content · Finance · Bookings
- Current content = Overview tab

---

### TASK 09 — Finances (Merge into Analytics)
**Frame:** `YmPsS` — Finances  
**Status:** `[ ]`

**Changes:**
- Rename frame annotation: Finances → Analytics — Finance Tab
- This screen becomes the "Finance" sub-tab of Analytics
- Add consistent sub-tab bar at top matching Analytics: Overview · Content · **Finance** · Bookings
- Replace any `rounded-full` invoice status badges with `rounded-md`
- Align stat numbers using tabular spacing

---

### TASK 10 — Settings: AI Preferences Expansion
**Frame:** Existing settings frame (locate by searching "Settings" or "AI" in canvas)  
**Status:** `[ ]`

**AI Preferences wizard — add sections:**
- Shooting style tags: multi-select chips (wedding · portrait · commercial · event · editorial) — `rounded-md` chips, not pills
- Auto-sort categories: toggle list per category
- Confidence threshold slider per category
- Auto-reject rules: toggle row for blurry · duplicate · eyes-closed · overexposed
- Hero-shot criteria: weighted sliders (sharpness · composition · expression)
- Vibe/mood keywords: tag input field
- Delivery defaults section: watermark toggle · max selects input · expiry date picker

---

### TASK 11 — New Frame: Client Portal
**Frame:** New — does not exist yet  
**Status:** `[ ]`

**Create new frame:** `Client Portal — Home`

**Layout:**
```
[Photographer branding header — logo, name]
[Hero: active gallery strip — horizontal scroll]
[Section: "Your Galleries" — card grid with status]
[Section: "Favorites" — horizontal photo strip (bottom third)]
[CTA row: "Request New Shoot" · "Make Selections" · "Request Revisions"]
[Footer: photographer contact info]
```

---

### TASK 12 — New Frame: Public Booking Page
**Frame:** New — does not exist yet  
**Status:** `[ ]`

**Create new frame:** `Public Booking — Client View`

**Layout (Calendly-style):**
```
[Left panel — 300px]:
  - Photographer profile photo + name
  - Short bio
  - List of available shoot types (click to select)
  - Price range for selected type

[Right panel — flexible]:
  - Month calendar (large, clean)
  - Click date → show available time slots
  - Selected slot highlighted
  - "Continue" CTA → booking form step

[Step 2 — Booking Form]:
  - Name, email, phone, notes
  - Pay gate option (if enabled): payment fields or "Pay deposit to confirm"
  - "Confirm Booking" CTA
```

---

### TASK 13 — Content Hub (Stats + Platform Tags)
**Frame:** Locate "Content" frame on canvas (may be in the +3 unlisted frames)  
**Status:** `[ ]`

**Changes:**
- Add stats row at top: Total Posts · Avg. Engagement · Best Post · Scheduled This Week · Drafts
- Platform indicator badges: replace text labels with icon + color badge
  - Instagram: gradient (purple→orange) icon badge, `rounded-md`
  - Facebook: solid blue icon badge, `rounded-md`
  - TikTok: black/red dual-color, `rounded-md`
- Add "Top Posts" carousel row: 3 cards showing best-performing posts with engagement stat overlay
- Add platform filter tabs above calendar: All · Instagram · Facebook · TikTok

---

## Global Polish Pass (do after all above tasks)

### TASK 14 — Cross-Screen: Pill → Rounded Audit
**Applies to:** All frames  
**Status:** `[ ]`

Scan every frame for `rounded-full` on non-circular elements:
- Status badges → `rounded-md`
- Tag/category chips → `rounded-md`  
- Filter buttons → `rounded-lg`
- CTA buttons → `rounded-lg`

**Keep `rounded-full` only for:**
- Avatar/initials circles
- Notification dot indicators
- Progress bar fill tracks
- Circular icon containers (24×24 or smaller)

---

## Canvas Frame Inventory (as of 2026-04-02)

| ID | Frame Name | Task | Status |
|---|---|---|---|
| `jHMkx` | Dashboard v2 | TASK 01 | `[ ]` |
| `U1Kew` | Cal - List View | — | Review needed |
| `I8wu6` | AI Workspace | TASK 03 | `[ ]` |
| `XBDLS` | Projects | TASK 04 | `[ ]` |
| `iTVxS` | Gallery Builder | TASK 05 | `[ ]` |
| `vrsJs` | Booking | TASK 06 | `[ ]` |
| `9eyUx` | Clients | TASK 07 | `[ ]` |
| `UuJdw` | Contracts | — | No changes |
| `YmPsS` | Finances | TASK 09 | `[ ]` |
| `JNWPT` | Analytics | TASK 08 | `[ ]` |
| *(+3 unknown)* | — | Identify first | — |
| *(new)* | AI Sort — Upload | TASK 02 | `[ ]` |
| *(new)* | Client Portal — Home | TASK 11 | `[ ]` |
| *(new)* | Public Booking — Client View | TASK 12 | `[ ]` |
