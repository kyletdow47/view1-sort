# View1 Sort — Product Plan v2.0

> Updated: 2026-03-30
> Status: Active
> Vision: The AI-powered photographer OS — sort, deliver, and run your entire business in one place.

---

## The Big Idea

**View1 Sort is not another photo culling tool. It sorts by story and intent, not technical quality.**

Every competitor (Imagen AI, Narrative Select, AfterShoot) filters photos based on sharpness, exposure, and blink detection. View1 Sort understands the *narrative arc* of a shoot. A slightly soft image with perfect emotion beats a technically perfect throwaway. The AI learns the photographer's aesthetic fingerprint over time, getting smarter with every project.

Combined with a full business workflow — contracts, invoices, booking, delivery, analytics — View1 Sort becomes the single platform a photographer never needs to leave.

---

## Target Users

| Type | Why They Need This |
|------|-------------------|
| Wedding Photographers | 1,000+ photos per shoot, complex delivery, client selection workflow |
| Real Estate Photographers | Fast turnaround, multiple properties, direct delivery |
| Commercial Photographers | Brand clients, licensing, revision rounds, complex invoicing |
| Fashion / Portrait | Editorial sorting, mood-based categories, agency delivery |
| Travel / Influencer | Volume shooting, content categorization, social export |

---

## Design System

### Font
**Plus Jakarta Sans** — primary font across all weights (300–800). Clean, modern, premium without being cold.

### Themes (3 built-in, switchable)
| Theme | Dark BG | Surface | Border | Accent |
|-------|---------|---------|--------|--------|
| **Zinc/Cool** (default) | `#09090b` | `#18181b` | `#27272a` | `#6366f1` indigo |
| **Stone/Warm** | `#0c0a09` | `#1c1917` | `#292524` | `#d97706` amber |
| **Monochrome** | `#000000` | `#111111` | `#222222` | `#ffffff` |

Each theme has a corresponding light mode. Active theme stored in localStorage + Supabase profile.

### Motion
- **Micro** — gallery photos: 1-2px translateY on hover, imperceptible but tactile
- **Medium** — project cards: clear shadow bloom, translateY(-3px)
- **Selection** — border highlight in accent color (no fill)

### Layout Principles
- Airy: less information per page, more pages
- Fluid responsive grid (no fixed columns)
- Soft borders + shadow depth on cards
- Plus Jakarta Sans at all weights, no other fonts

---

## Core Architecture

### The AI Sort Difference
```
Upload → Smart Cull → AI Sort by Story → Vibe Preset → Lightroom Roundtrip → 3-Stage Delivery
```

1. **Smart Culling** — auto-flag blurry, duplicate, closed-eyes, blown exposure. Photographer reviews before deleting.
2. **Context-First Sort** — photographer describes the shoot + adds tags before upload. AI uses this context.
3. **Vibe Presets** — built-in niche presets + chat-built custom presets. The AI asks questions to understand your aesthetic.
4. **Narrative Sorting** — photos sorted by story arc, not just quality scores.
5. **Lightroom Roundtrip** — close app → edit → reopen → auto-sync. Edited version shown, original preserved.
6. **AI Style Profile** — learns your taste across projects. Gets smarter over time.

### Project Status Pipeline
```
Draft
  → Culling
  → AI Sorting
  → Preselection Sent
  → Client Selecting
  → Editing
  → Review Sent
  → Revision Requested
  → Final Delivered
  → Archived
```
Status badge visible on every project card, inside the project, in client dashboard, and in analytics.

### 3-Stage Gallery Delivery
| Stage | Who Sees It | What They Can Do |
|-------|-------------|-----------------|
| Preselection | Client | View, comment on photos |
| Client Selection | Client | Favorite photos they want |
| Finals | Client | Download, request revisions |

Photographer controls which stages apply per project (configured at offer setup).

---

## Build Phases

### Phase 1 — Design System & Foundations
**Goal:** Every page looks and feels like a premium product before any feature is built.

- Migrate to Plus Jakarta Sans
- Build 3-theme token system (CSS custom properties)
- Theme switcher component (Settings + floating toggle)
- Elevation + motion system (micro / medium)
- Full component token audit (remove all hardcoded values)
- Rate limiting on public API routes (P0 security)
- Storage quota enforcement

**Definition of done:** All 3 themes work perfectly across every existing page. No hardcoded colors remain.

---

### Phase 2 — Landing Page & Marketing
**Goal:** A conversion-optimized landing page that builds waitlist hype before launch.

- Full landing page rebuild (very long, detailed, screenshot placeholders)
- Waitlist backend (Supabase + Resend confirmation + referral tracking)
- SEO + Open Graph optimization

**Definition of done:** Landing page live on production, collecting waitlist signups with email confirmation.

---

### Phase 3 — AI Sort & Intelligence (The Differentiator)
**Goal:** The core product that makes View1 Sort unlike anything else.

- Smart culling engine UI (review flagged photos before sort)
- AI sort with shoot context (description + tags fed to classifier)
- Vibe preset builder — dedicated /dashboard/presets page with chat interface
- 6 built-in niche presets (Wedding, Real Estate, Commercial, Fashion, Travel, Event)
- Lightroom roundtrip sync (watch folder + auto-detect on app open)
- AI Style Profile (learns taste across projects, unlocks Personalized Mode)

**Definition of done:** Photographer can describe a shoot, run AI sort with a preset, review culled photos, and see sorted categories in the gallery.

---

### Phase 4 — Gallery & Delivery
**Goal:** The most beautiful, functional gallery delivery experience in the industry.

- Gallery — Netflix/Finder hybrid layout (horizontal rows that expand to collapsible sections)
- 3-stage delivery flow (Preselection → Client Selection → Finals)
- Photo comment system (threaded, with revision request categories)
- Watermark configurator (logo upload, placement, size, opacity, live preview)
- Download & payment gate (per-photo pricing, ZIP by category, Cloudflare delivery)

**Definition of done:** Full end-to-end delivery flow works — photographer publishes, client selects, photographer re-uploads finals, client downloads ZIP.

---

### Phase 5 — Client Experience
**Goal:** Clients feel like they have a beautiful, dedicated space for their photos.

- Client dashboard (/client — all projects, status tracking, pending actions)
- Magic link + account flow (no-account gallery view, optional account for dashboard)
- Client mobile experience (full-featured mobile gallery + dashboard)
- Project status visibility everywhere (timeline of stage completions)

**Definition of done:** Client can receive magic link, view gallery, select photos, track status, and download finals — all on mobile.

---

### Phase 6 — Business Workflow
**Goal:** Replace DocuSign + Stripe + email chains with one unified flow.

- Offer setup in profile creation (questions define default project workflow)
- Contract + invoice flow (sign → auto-invoice → Stripe payment → project unlocks)
- Package & product builder (session fees, photo counts, extras, licenses)
- Booking forms by type (Wedding, Real Estate, Commercial, Portrait, Event)
- Automated email + SMS notifications (Resend + Twilio at key workflow moments)

**Definition of done:** Photographer can send a contract, collect a signature, auto-generate an invoice, get paid, and have the project workflow begin — without leaving View1.

---

### Phase 7 — Analytics & Finances
**Goal:** Photographers understand their business performance at a glance.

- Analytics dashboard (revenue, active projects, client acquisition, conversion rates)
- Calendar rebuild (drag-to-move events, click-to-edit, Google/Apple Calendar sync)
- Package analytics (which packages sell, average project value, repeat client rate)

**Definition of done:** Photographer can see revenue by month, upcoming shoots on a calendar, and which packages perform best.

---

### Phase 8 — Infrastructure & Quality
**Goal:** Production-ready reliability and performance.

- End-to-end test suite (Playwright covering full photographer + client flows)
- Performance audit (LCP <2.5s, CLS <0.1, Vercel Analytics)
- Security hardening (rate limiting, input validation, RLS audit)

---

### Phase 9 — Mobile App
**Goal:** Photographers use View1 on-set. Clients use it everywhere.

- Mobile PWA for photographers (shot list, notes, client info, auto-sync on reopen)
- Client mobile push notifications (gallery ready, selection reminder, finals delivered)
- Full offline capability for on-set use

**Definition of done:** Photographer can manage a full shoot day from their phone and walk away with notes + shot list auto-synced to the project.

---

## What Makes Us Different

| Feature | View1 Sort | Competitors |
|---------|-----------|-------------|
| Sorts by story arc | ✅ | ❌ Quality only |
| Vibe chat preset builder | ✅ | ❌ |
| Lightroom roundtrip | ✅ | Partial |
| 3-stage client delivery | ✅ | ❌ |
| Contract + invoice + delivery | ✅ | ❌ |
| AI learns your style | ✅ | ❌ |
| Client dashboard | ✅ | ❌ |
| On-set mobile companion | ✅ | ❌ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript 5 strict |
| Styling | Tailwind CSS 3, Plus Jakarta Sans, 3-theme token system |
| Database | Supabase Postgres + RLS + pgvector |
| Auth | Supabase Auth (email, Google OAuth) |
| Storage | Supabase Storage + Cloudflare Images |
| AI | SigLIP/CLIP via Transformers.js (browser-side, Web Worker) |
| Payments | Stripe Billing + Stripe Connect |
| Email | Resend + React Email templates |
| SMS | Twilio (notifications) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Deployment | Vercel (production + preview) |

---

## Non-Negotiables

1. **RLS on every table** — data isolation at the database level, always
2. **No service_role key client-side** — ever
3. **Plus Jakarta Sans only** — no font mixing
4. **3 themes must all work** — no hardcoded colors anywhere
5. **Mobile-first client experience** — clients live on their phones
6. **Status visible everywhere** — photographers and clients always know where they are

---

*Last updated: 2026-03-30 — Based on founder product interview*
