# View1 Sort - Dashboard v2 Design System

Extracted from `V1 test.pen` > "Dashboard v2" frame (`jHMkx`).

---

## 1. Color Tokens

### Design System Variables (from .pen file)

These are the canonical variables defined in the file. Each has Light/Dark mode values.

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | `#FFFFFF` | `#131124` |
| `--foreground` | `#2A2933` | `#E8E8EA` |
| `--primary` | `#5749F4` | `#5749F4` |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--secondary` | `#D9D9DB` | `#403F51` |
| `--secondary-foreground` | `#2A2933` | `#FFFFFF` |
| `--destructive` | `#CC3314` | `#CC3314` |
| `--destructive-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--muted` | `#F5F5F5` | `#2E2E2E` |
| `--muted-foreground` | `#616167` | `#888799` |
| `--accent` | `#F5F5F5` | `#131124` |
| `--accent-foreground` | `#2A2933` | `#F2F3F0` |
| `--card` | `#FFFFFF` | `#1A182E` |
| `--card-foreground` | `#2A2933` | `#FFFFFF` |
| `--popover` | `#FFFFFF` | `#1A182E` |
| `--popover-foreground` | `#2A2933` | `#FFFFFF` |
| `--border` | `#C5C5CB` | `#2B283D` |
| `--input` | `#C5C5CB` | `#2B283D` |
| `--ring` | `#E1E2E5` | `#666666` |
| `--sidebar` | `#FFFFFF` | `#1A182E` |
| `--sidebar-foreground` | `#939399` | `#ACABB2` |
| `--sidebar-accent` | `#F5F5F5` | `#2B283D` |
| `--sidebar-accent-foreground` | `#2A2933` | `#E8E8EA` |
| `--sidebar-border` | `#D9D9DB` | `#2B283D` |
| `--sidebar-primary` | `#F5F5F5` | `#0F5FFE` |
| `--sidebar-primary-foreground` | `#2A2933` | `#E8E8EA` |
| `--sidebar-ring` | `#D9D9DB` | `#2B283D` |
| `--tile` | `#F5F5F5` | `#1A182E` |
| `--black` | `#000000` | |
| `--white` | `#FFFFFF` | |

### Semantic Status Colors

| Variable | Light | Dark |
|----------|-------|------|
| `--color-success` | `#A1E5A1` | `#3B4748` |
| `--color-success-foreground` | `#003300` | `#A1E5A1` |
| `--color-warning` | `#FFD9B2` | `#53484F` |
| `--color-warning-foreground` | `#4D2700` | `#FFD9B2` |
| `--color-error` | `#FFBFB2` | `#53424F` |
| `--color-error-foreground` | `#590F00` | `#FFBFB2` |
| `--color-info` | `#C9D6F0` | `#404562` |
| `--color-info-foreground` | `#001133` | `#B2CCFF` |

### Palette-Themed Variables (multi-palette support)

| Variable | warm | zinc | mono | tangerine | neon |
|----------|------|------|------|-----------|------|
| `bg` | `#151312` | `#0D0E14` | `#080808` | `#FFFFFF` | `#0A0A0A` |
| `primary` | `#ffb780` | `#818cf8` | `#E8E8E8` | `#FF5C00` | `#A855F7` |
| `primary-container` | `#d48441` | `#6366f1` | `#BDBDBD` | `#FF8533` | `#EC4899` |
| `on-primary` | `#4e2600` | `#FFFFFF` | `#080808` | `#FFFFFF` | `#FFFFFF` |
| `on-surface` | `#e7e1df` | `#E0E7FF` | `#F0F0F0` | `#1A1A1A` | `#FFFFFF` |
| `on-surface-variant` | `#d9c2b4` | `#A5B4FC` | `#AAAAAA` | `#666666` | `#A1A1AA` |
| `accent` | `#D4915C` | `#6366f1` | `#C4C4C4` | `#FF5C00` | `#A855F7` |
| `elevation-1` | `#2a2726` | `#1E2038` | `#1C1C1C` | `#F5F5F5` | `#141414` |
| `elevation-2` | `#312E2D` | `#262945` | `#242424` | `#EEEEEE` | `#1A1A1A` |
| `outline` | `#a18d80` | `#4B5380` | `#555555` | `#888888` | `#71717A` |
| `outline-variant` | `#534439` | `#1E2240` | `#2A2A2A` | `#E5E7EB` | `#1A1A1A` |
| `surface-container` | `#211f1e` | `#1A1B26` | `#181818` | `#F3F4F6` | `#141414` |
| `surface-container-high` | `#2c2928` | `#22253A` | `#222222` | `#E9EAEC` | `#1A1A1A` |
| `surface-container-highest` | `#373433` | `#2D3050` | `#2E2E2E` | `#E0E2E6` | `#222222` |
| `surface-container-low` | `#1d1b1a` | `#13141C` | `#101010` | `#F9FAFB` | `#111111` |
| `surface-bright` | `#3b3937` | `#363960` | `#3A3A3A` | `#FFFFFF` | `#1A1A1A` |

### Hardcoded Colors Used in Dashboard v2

#### White Opacity Scale
| Token | Hex |
|-------|-----|
| `white-70` | `#FFFFFFB3` |
| `white-50` | `#FFFFFF80` |
| `white-40` | `#FFFFFF66` |
| `white-30` | `#FFFFFF4D` |
| `white-20` | `#FFFFFF33` |

#### In-use Opacity Variants (from actual nodes)
| Usage | Value |
|-------|-------|
| Full white | `#FFFFFF` |
| Near-white (headings) | `#FFFFFFEE` |
| High-emphasis text | `#FFFFFFCC` |
| Body text / labels | `#FFFFFFB3` |
| Nav inactive text | `#FFFFFFAA` |
| Muted text / icons | `#FFFFFF80` |
| Subtle text / timestamps | `#FFFFFF60` |
| Dimmed text (calendar) | `#FFFFFF55` |
| Faded text (calendar days) | `#FFFFFF50` |
| Disabled text | `#FFFFFF40` |
| Ghost text / de-prioritized | `#FFFFFF90` |

#### Accent / Signal Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Green (success) | `#34D399` | Activity dot, delivery status "Paid" |
| Green (teal) | `#2DD4BF` | Task icon (completed) |
| Amber/Gold | `#FBBF24` | Calendar highlight, task icon, inbox badge |
| Amber gradient start | `#F59E0B` | Send button, CTA buttons |
| Amber gradient end | `#D97706` | Send button gradient |
| Purple (violet) | `#A78BFA` | Activity dot, task icon |
| Purple (dark) | `#7C3AED` | Avatar color |
| Blue (sky) | `#60A5FA` | Delivery dot ("In Review") |
| Indigo | `#6366F1` | Brand icon gradient start |
| Indigo dark | `#4F46E5` | Brand icon gradient end, avatar |
| Red | `#F87171` | Activity dot (error/urgent) |
| Rose | `#E11D48` | Avatar color |
| Teal (dark) | `#0D9488` | Avatar color |

#### Surface / Glass Colors
| Usage | Value |
|-------|-------|
| Card fill (subtle) | `#FFFFFF14` (~8%) |
| Card fill (very subtle) | `#FFFFFF0A` (~4%) |
| Card row fill | `#FFFFFF1F` (~12%) |
| Row hover/active | `#FFFFFF08` (~3%) |
| Nav bar fill | `#FFFFFF0A` (~4%) |
| Nav pill fill | `#FFFFFF12` (~7%) |
| Active nav item fill | `#FFFFFF20` (~13%) |
| Input/chat fill | `#FFFFFF18` (~9%) |
| Badge fill | `#FFFFFF10` (~6%) |
| Badge alt fill | `#FFFFFF26` (~15%) |
| Status badge (color+20) | e.g. `#34D39920`, `#FBBF2420`, `#60A5FA20` |

---

## 2. Typography

### Font Families
| Font | Usage |
|------|-------|
| **Geist** | Primary UI font - navigation, headings, widget titles, card text, body content |
| **Plus Jakarta Sans** | Calendar widget, task panel, some secondary headings |
| **Inter** | Inbox widget, quick stats labels, some fallback text |

### Type Scale

| Role | Font | Size | Weight | Color | Usage |
|------|------|------|--------|-------|-------|
| Page heading | Geist | 37px | 700 (Bold) | `#FFFFFF` | "Welcome Kyle," |
| Panel title (large) | Plus Jakarta Sans | 28px | 700 | `#FFFFFF60` | Task count "2/8" |
| Panel title | Plus Jakarta Sans | 18px | 700 | `#FFFFFFEE` | "To-do List:" |
| Brand name | Geist | 15px | 700 | `#FFFFFF` | "View1 Sort" |
| Widget title | Geist | 14px | 600 | `#FFFFFF` | "Recent Activity", "Recent Projects", "Project Deliveries" |
| Widget title alt | Plus Jakarta Sans | 14px | 700 | `#FFFFFFEE` | "Upcoming shoots" |
| Widget title alt 2 | Inter | 14px | 700 | `#FFFFFFEE` | "Inbox" |
| Task name | Plus Jakarta Sans | 14px | 600 | `#FFFFFFEE` | "Complete Sorting", "Send Project" |
| Chat placeholder | Geist | 14px | 400 | `#FFFFFF80` | "Ask View1..." |
| Nav item (active) | Geist | 13px | 600 | `#FFFFFF` | "Dashboard" |
| Nav item (inactive) | Geist | 13px | 400 | `#FFFFFFAA` | "AI Sort", "Gallery", etc. |
| Card primary text | Geist | 13px | 500 | `#FFFFFF` | Client names in delivery rows |
| Card secondary text | Geist | 12px | 400 | `#FFFFFFB3` | Gallery names |
| Link text | Geist | 12px | 400 | `#FFFFFFB3` | "See All" |
| Month selector | Plus Jakarta Sans | 12px | 500 | `#FFFFFF80` | "February" |
| Activity body | Geist | 12px | 400 | `#FFFFFFAA` | Activity descriptions |
| Badge text | Geist | 11px | 500 | `#FFFFFF` | "3 unpaid" |
| View all link | Inter | 11px | 400 | `#FFFFFF60` | "View all" |
| Timestamp | Plus Jakarta Sans | 11px | 400 | `#FFFFFF60` | "Sep 13, 08:30" |
| Stat label | Geist / Inter | 11px | 400 | `#FFFFFFAA` / `#FFFFFF88` | "Unfinished Tasks", "Active Projects" |
| Calendar day header | Plus Jakarta Sans | 9px | 600 | `#FFFFFF50` | "M", "T", "W" |
| Calendar date | Plus Jakarta Sans | 9px | 400 | `#FFFFFF55` | "1", "2", "3" |
| Calendar date (active) | Plus Jakarta Sans | 9px | 700 | `#1A1A0A` | "4", "8" (on gold bg) |
| Calendar date (scheduled) | Plus Jakarta Sans | 9px | 600 | `#FFFFFFCC` | "14", "17" |
| Calendar legend | Plus Jakarta Sans | 9px | 400 | `#FFFFFF60` | "Current day", "Done" |

### Font Weight Scale
| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular/Normal | Body text, placeholders, timestamps |
| 500 | Medium | Card names, badge text, month labels |
| 600 | Semibold | Widget titles, active nav, task names, scheduled dates |
| 700 | Bold | Page heading, brand name, panel titles, calendar active dates |

### Letter Spacing
| Value | Usage |
|-------|-------|
| `0.5px` | Panel titles (e.g. "Quick Stats") |

---

## 3. Spacing Scale

### Padding Values (from actual components)

| Value | Usage |
|-------|-------|
| `4px` | Nav pill inner padding, view toggle inner padding, badge vertical |
| `[3, 4]` | View toggle container |
| `[3, 8]` | Status badge pill |
| `[4, 8]` | Calendar view toggle buttons |
| `[4, 10]` | Badge pill |
| `[5, 10]` | Project card badge |
| `[2, 7]` | Inbox count badge |
| `[8, 10]` | Message row padding |
| `[8, 16]` | Nav items |
| `[8, 0]` | Chat section vertical |
| `[10, 12]` | Activity items, project cards |
| `12px` | Delivery rows, calendar bottom |
| `[12, 16]` | Task items |
| `16px` | Widget cards (uniform) |
| `[16, 16, 12, 16]` | Calendar widget (top, right, bottom, left) |
| `20px` | Chat input left padding |
| `[0, 6, 0, 20]` | Chat box asymmetric |
| `24px` | Task panel horizontal |
| `[32, 24]` | Task panel (vert, horiz) |
| `32px` | (via padding array) |
| `[32, 85, 85, 85]` | Dashboard body (top, right, bottom, left) |
| `[0, 40]` | Top navigation horizontal |

### Gap Values

| Value | Usage |
|-------|-------|
| `2px` | Text stacks (name + timestamp), message list, view toggle |
| `4px` | Nav pill items, legend items, badge with icon, task list items |
| `6px` | Activity list, calendar rows |
| `8px` | Brand icon + name, widget gaps, stat rows, project card list, delivery rows |
| `10px` | Activity items, project cards, message rows, delivery row items |
| `12px` | Widget internal (title to content), nav right icons, task items, delivery widget, inbox widget, legend |
| `16px` | Chat section, widget rows (between widgets), chat section internal |
| `20px` | Task panel internal |
| `24px` | Dashboard body sections |

---

## 4. Border Radii

### Radius Variables
| Variable | Value |
|----------|-------|
| `--radius-xs` | `6` |
| `--radius-m` | `24` |
| `--radius-l` | `40` |
| `--radius-pill` | `999` |
| `--radius-none` | `0` |
| `radius-sm` | `8` |
| `radius-md` | `12` |
| `radius-lg` | `16` |

### In-use Radii

| Radius | Usage |
|--------|-------|
| `4px` | Small badges |
| `6px` | Calendar toggle buttons |
| `8px` | Nav items, brand icon, view toggle container |
| `10px` | Inbox badge |
| `11px` | Calendar date cells (pill-like on 22px circles) |
| `12px` | Nav pill container, activity items, project cards, delivery rows, task items, message rows |
| `16px` | Dashboard frame outer |
| `18px` | Chat send button (nearly circular on 36px) |
| `20px` | Calendar widget, delivery widget, inbox widget |
| `24px` | Main widget cards, chat box, task panel |
| `999px` | Status badges (full pill) |

---

## 5. Shadows & Effects

### Background Blur
| Radius | Usage |
|--------|-------|
| `16px` | Calendar widget, delivery widget, inbox widget, nav pill |
| `20px` | Chat box |
| `32px` | Main widget cards (activity, projects, quick stats) |
| `40px` | Task panel |

### Shadow Patterns

**Widget Card Shadow (standard)**
```
blur: 32, color: #00000028, offset: (0, 8), type: outer
+ blur: 0, color: #FFFFFF25, offset: (0, 1), type: outer  (top edge highlight)
```

**Task Panel Shadow (heavy)**
```
blur: 48, color: #00000040, offset: (0, 16), spread: -4, type: outer
+ blur: 8, color: #FFFFFF08, offset: (0, 2), type: outer  (subtle glow)
+ blur: 0, color: #FFFFFF20, offset: (0, 1), type: outer  (top edge highlight)
```

**Dashboard Frame Shadow**
```
blur: 40, color: #00000060, offset: (0, 8), type: outer
```

**Chat Box Shadow**
```
blur: 16, color: #FFFFFF10, offset: (0, 4), type: outer  (light glow)
```

---

## 6. Component Patterns

### Navigation Bar (`q5TiS`)
- **Layout:** Horizontal, `space_between`, `align: center`
- **Size:** `fill_container` x `56px`
- **Fill:** `#FFFFFF0A`
- **Bottom border:** `#FFFFFF18`, `1px` inside, bottom only
- **Padding:** `0 40px`
- **Children:** Brand (left), Nav pills (center), Actions (right)

### Navigation Pill Container (`Sh9Yj`)
- **Fill:** `#FFFFFF12`
- **Corner radius:** `12px`
- **Padding:** `4px`
- **Gap:** `4px`
- **Background blur:** `16px`
- **Active item:** `fill: #FFFFFF20`, `cornerRadius: 8`, text `600 weight`, `#FFFFFF`
- **Inactive item:** no fill, text `400 weight`, `#FFFFFFAA`
- **Item padding:** `8px 16px`

### Glass Card (Widget) Pattern
Used for: Activity, Projects, Quick Stats, Calendar, Deliveries, Inbox

- **Corner radius:** `20-24px`
- **Background blur:** `16-32px`
- **Fill (layered):**
  1. `linear-gradient(180deg, #FFFFFF1E 0%, #FFFFFF08 100%)`
  2. `linear-gradient(180deg, #FFFFFF30 0%, #FFFFFF00 25%)`
- **Stroke:** `1px inside`, gradient `#FFFFFF40 -> #FFFFFF18 -> #FFFFFF08`
- **Shadow:** `(0, 8) blur 32 #00000028` + `(0, 1) blur 0 #FFFFFF25`
- **Padding:** `16px`
- **Gap (header to content):** `12px`

### Task Panel (Floating)
- **Position:** Absolute, overlays right side
- **Corner radius:** `24px`
- **Background blur:** `40px`
- **Fill:** Same glass pattern as cards
- **Shadow:** Heavy - `(0, 16) blur 48 #00000040`
- **Padding:** `32px 24px`
- **Gap:** `20px`

### Activity Item Row
- **Corner radius:** `12px`
- **Fill:** `#FFFFFF08`
- **Stroke:** `1px inside #FFFFFF10`
- **Padding:** `10px 12px`
- **Gap:** `10px`
- **Left indicator:** `8px` colored dot (ellipse)

### Project Card Row
- **Corner radius:** `12px`
- **Fill:** `#FFFFFF1F`
- **Padding:** `10px 12px`
- **Gap:** `10px`
- **Left element:** Image thumbnail stack
- **Right element:** Icon button (amber `#F59E0B`) with arrow

### Delivery Row
- **Corner radius:** `12px`
- **Fill:** `#FFFFFF14`
- **Stroke:** `1px inside #FFFFFF1A`
- **Padding:** `12px`
- **Gap:** `10px`
- **Left indicator:** `8px` colored dot
- **Right element:** Status pill badge

### Task Item Row
- **Corner radius:** `12px`
- **Fill:** `#FFFFFF0A` (active) / `#FFFFFF14` (highlighted)
- **Padding:** `12px 16px`
- **Gap:** `12px`
- **Left element:** `36px` colored circle (ellipse)
- **Right element:** `28px` status circle

### Message Row
- **Corner radius:** `12px`
- **Fill:** `#FFFFFF0A`
- **Padding:** `8px 10px`
- **Gap:** `10px`
- **Left element:** `32px` colored avatar (ellipse)

### Status Badge / Pill
- **Corner radius:** `999px` (full pill)
- **Fill:** Signal color at 20% opacity (e.g. `#34D39920`)
- **Padding:** `3px 8px`
- **Text:** Signal color at full opacity, `11px`, `500 weight`

### Chat Box / Search Input
- **Corner radius:** `24px`
- **Fill:** `#FFFFFF18`
- **Stroke:** `1px inside #FFFFFF30`
- **Background blur:** `20px`
- **Shadow:** `(0, 4) blur 16 #FFFFFF10` (glow up)
- **Padding:** `0 6px 0 20px`
- **Send button:** `36px` circle, amber gradient `#F59E0B -> #D97706`, `cornerRadius: 18`

### Calendar Date Cell
- **Size:** `22px` x `22px`
- **Corner radius:** `11px` (circle)
- **States:**
  - Default: no fill, text `#FFFFFF55`
  - Today: `stroke: 2px #FFFFFFAA`, text `#FFFFFF` bold
  - Completed: `fill: #FBBF24`, text `#1A1A0A` bold
  - Scheduled: `fill: #FFFFFF20`, `stroke: 1px #FFFFFF30`, text `#FFFFFFCC` semibold

### Icon Buttons (from design system components)
- **Size:** Varies (referenced `9:NZ2w4` for small icon buttons)
- **Fill:** Signal color (e.g. `#F59E0B` amber)
- **Icon:** Lucide icon set, `16px`

---

## 7. Background / Page — Metallic Rainbow

### Dashboard Frame Background
Multi-layer metallic rainbow creating an iridescent dark chrome atmosphere:

```
Layer 1 - Background image:
  type: image, url: "./background 5.jpg", mode: fill, opacity: 1.0
  (Grainy chromatic blur texture — blue, pink, purple blobs on black)

Layer 2 - Dark overlay (50% opacity):
  linear 160°: #03030580 (0%) → #08081090 (30%) → #06060990 (60%) → #03030580 (100%)

Layer 3 - Chromatic mesh gradient (35% opacity):
  type: mesh_gradient, columns: 4, rows: 3
  Colors: #F59E0B35, #3B82F665, #A855F745, #EC489935,
          #EC489945, #F59E0B55, #3B82F665, #A855F745,
          #3B82F635, #A855F755, #EC489965, #F59E0B45

Layer 4 - Metallic light streak:
  linear 135°: #FFFFFF0A (0%) → #FFFFFF00 (30%) → #FFFFFF08 (50%) → #FFFFFF00 (70%) → #FFFFFF0A (100%)

Stroke: 2.5px inside rainbow gradient 135°:
  #F59E0BA0 (0%) → #3B82F690 (20%) → #A855F790 (40%) →
  #EC489990 (60%) → #3B82F690 (80%) → #F59E0BA0 (100%)

Corner radius: 16px

Shadows:
  1. outer (0, 12) blur 60 #000000A0
  2. outer (-20, 0) blur 100 #3B82F620 (blue side glow)
  3. outer (20, 0) blur 100 #F59E0B18 (amber side glow)
  4. inner (0, 2) blur 60 #FFFFFF06 (top highlight)
```

### Rainbow Border Stroke (reusable across widgets)
```
Standard (1.5px): gradient 135° cycling through:
  #F59E0B70 → #3B82F660 → #A855F760 → #EC489970
  (rotate start angle per widget for variety)

Heavy (2.5px): same colors at higher opacity (A0/90)
  Used on page frames and floating panels
```

### Metallic Rainbow Accent Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Amber/Gold | `#F59E0B` | Primary accent, gradient start |
| Blue | `#3B82F6` | Secondary accent, gradient midpoint |
| Purple | `#A855F7` | Tertiary accent, gradient midpoint |
| Pink | `#EC4899` | Quaternary accent, gradient end |

### Rainbow Gradient Presets
```
Brand gradient (icons, buttons): 135° #F59E0B → #3B82F6 → #A855F7
CTA button: 135° #F59E0B → #EC4899 → #3B82F6
Activity dots: pair combos rotating through the 4 accent colors
Donut rings: angular gradients using accent pairs with outer glow
Avatar circles: linear gradient pairs with 6px colored glow shadow
```

---

## 10. Liquid Glass Style System

This is the canonical "liquid glass" visual language used across all Dashboard v2 surfaces. Every new page or feature must follow these patterns.

### 10.1 Page Background

All pages use the metallic rainbow background (see §7): background 5.jpg image → dark overlay → chromatic mesh gradient → metallic light streak. Rainbow gradient border stroke (2.5px).

### 10.2 Navigation Bar

| Property | Value |
|----------|-------|
| Fill | `#FFFFFF08` (~3% white) |
| Bottom stroke | `1.5px inside rainbow gradient 90°: #F59E0B50 → #3B82F640 → #A855F740 → #EC489950` |
| Height | `56px` |
| Padding | `0 40px` |

**Nav Pill Container** (wraps all nav items):

| Property | Value |
|----------|-------|
| Fill | `#FFFFFF0A` (~4% white) |
| Corner radius | `12px` |
| Padding | `4px` |
| Gap | `4px` |
| Background blur | `16px` |

**Active nav item:** fill `#FFFFFF18`, cornerRadius `8px`, text weight `600`, color `#FFFFFF`
**Inactive nav item:** no fill, text weight `400`, color `#FFFFFFAA`
**Item padding:** `8px 16px`

**Brand icon:** rainbow gradient fill `135°: #F59E0B → #3B82F6 → #A855F7`
**Nav icons (bell, settings):** rainbow gradient fills (unique per icon)
**Avatar:** rainbow gradient fill with rainbow stroke (2px)

### 10.3 Glass Card — Primary (Large Widgets)

Used for: main dashboard widgets (Recent Activity, Recent Projects, Quick Stats)

| Property | Value |
|----------|-------|
| Corner radius | `24px` |
| Background blur | `32px` |
| Fill layer 1 | `linear 180°: #FFFFFF14 (0%) → #FFFFFF04 (100%)` |
| Fill layer 2 | `linear ~210°: accent_color_10 (0%) → accent2_08 (50%) → transparent (100%)` |
| Stroke | `1.5px inside rainbow gradient (rotate per widget): accent colors at 60-70%` |
| Shadow 1 | `outer (0, 8) blur 32 #00000040` |
| Shadow 2 | `outer (0, 0) blur 16 accent_color_10` (chromatic glow) |
| Shadow 3 | `inner (0, 2) blur 24 #FFFFFF08` (top highlight) |
| Padding | `16px` |
| Gap | `12px` |

### 10.4 Glass Card — Secondary (Compact Widgets)

Used for: Calendar, Deliveries, Inbox, filter bars, auxiliary panels

| Property | Value |
|----------|-------|
| Corner radius | `20px` |
| Background blur | `16px` |
| Fill layer 1 | `#FFFFFF0C` (solid ~5% white) |
| Fill layer 2 | `linear 180°: #FFFFFF20 (0%) → #FFFFFF00 (100%)` |
| Stroke | `1.5px inside rainbow gradient (rotate per widget)` |
| Shadow 1 | `outer (0, 6) blur 24 #00000038` |
| Shadow 2 | `outer (0, 0) blur 12 accent_color_0C` (chromatic glow) |
| Shadow 3 | `inner (0, 1) blur 16 #FFFFFF06` |
| Padding | `16px` |
| Gap | `12px` |

### 10.5 Glass Panel — Floating (Task Panel / Modals)

| Property | Value |
|----------|-------|
| Corner radius | `24px` |
| Background blur | `40px` |
| Fill layer 1 | `linear 180°: #FFFFFF16 (0%) → #FFFFFF06 (100%)` |
| Fill layer 2 | `linear 180°: #FFFFFF25 (0%) → #FFFFFF00 (30%)` |
| Fill layer 3 | `linear ~225°: subtle accent tint` |
| Stroke | `2px inside full rainbow gradient 135° (6-stop cycle)` |
| Shadow 1 | `outer (0, 16) blur 48 #00000060 spread -4` |
| Shadow 2 | `outer (0, 0) blur 20 accent_color_12` (chromatic glow) |
| Shadow 3 | `inner (0, 2) blur 30 #FFFFFF0A` (top highlight) |

### 10.6 Glass Input / Search Box

| Property | Value |
|----------|-------|
| Corner radius | `24px` |
| Fill | `#FFFFFF10` |
| Stroke | `1.5px inside rainbow gradient 90°` |
| Background blur | `20px` |
| Shadow 1 | `outer (0, 4) blur 20 #00000020` |
| Shadow 2 | `inner (0, 1) blur 12 #FFFFFF06` |

### 10.7 Text Colors on Glass

| Role | Color |
|------|-------|
| Primary heading | `#FFFFFF` |
| High emphasis | `#FFFFFFEE` or `#FFFFFFCC` |
| Body / labels | `#FFFFFFB3` or `#FFFFFFAA` |
| Muted / secondary | `#FFFFFF80` |
| Placeholder / timestamps | `#FFFFFF60` or `#FFFFFF55` |
| Disabled | `#FFFFFF40` |

### 10.8 Glass Row Items (Activity / Delivery / Task rows)

| Type | Fill | Stroke | Radius |
|------|------|--------|--------|
| Activity row | `#FFFFFF08` | `1px #FFFFFF10` | `12px` |
| Delivery row | `#FFFFFF14` | `1px #FFFFFF1A` | `12px` |
| Task row (normal) | `#FFFFFF0A` | — | `12px` |
| Task row (active) | `#FFFFFF14` | — | `12px` |
| Project card row | `#FFFFFF1F` | — | `12px` |

### 10.9 Status Badges on Glass

All status badges use the colored signal value at ~12–20% opacity for fill, full opacity for text:

| Status | Fill | Text |
|--------|------|------|
| AI Sorting | `#818cf818` | `#818cf8` |
| Editing | `#3b82f618` | `#60a5fa` |
| Final Delivered | `#34d39918` | `#34d399` |
| Client Selecting | `#f59e0b18` | `#f59e0b` |
| Review Sent | `#06b6d418` | `#22d3ee` |
| Draft | `#6b728018` | `#9ca3af` |
| Culling | `#fbbf2418` | `#fbbf24` |

---

## 8. Icon System

- **Library:** Lucide
- **Sizes:** `12px`, `16px`, `18px`
- **Colors:** Match adjacent text color (typically `#FFFFFFAA`, `#FFFFFF60`, or `#FFFFFF`)
- **Icons used:** `bell`, `settings`, `arrow-right`, `arrow-up-right`, `chevron-down`

---

## 9. Themes

### Mode Theme
- **Axis:** `9:Mode`
- **Values:** `Light`, `Dark`
- Dashboard v2 uses **Dark** mode

### Palette Theme
- **Axis:** `palette`
- **Values:** `warm`, `zinc`, `mono`, `tangerine`, `neon`
- Dashboard v2 uses the **zinc** palette (indigo/purple accent family)
