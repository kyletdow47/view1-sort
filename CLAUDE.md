# CLAUDE.md — View1 Sort Agent Handbook

Every Claude Code AI agent reads this file when starting work on this codebase. Follow these rules strictly.

## Project Overview

**View1 Sort** is an AI-powered media sorting and client delivery platform for professional photographers. It automates the post-shoot workflow: AI categorizes photos, delivers curated galleries with watermarking, and manages billing/payments.

**Target Users:** Professional photographers (wedding, event, commercial) who need to sort, deliver, and get paid for their work.

**Core Flow:** Upload → AI sorts → Review → Share gallery → Client pays & downloads

## Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| Next.js | 14+ | Frontend & API routes (App Router) |
| React | 18 | UI components |
| TypeScript | 5+ | Type safety (strict mode) |
| Tailwind CSS | 3+ | Utility-first styling |
| Supabase | Latest | Postgres DB, Auth, Storage, Edge Functions, RLS, pgvector |
| Stripe | Latest | Billing (subscriptions), Connect (photographer→client payments) |
| Cloudflare Images | Latest | Image transforms, thumbnails, watermarking |
| SigLIP + Transformers.js | Latest | Zero-shot image classification (browser-side) |
| Vitest | Latest | Unit testing framework |

## Code Standards

### TypeScript
- Strict mode always. No `any` types. Use `unknown` and type guards.
- Define types in `src/types/` for local types.
- Use `const` assertions for literal types where appropriate.

### React
- Functional components only. No class components.
- Use React hooks (useState, useEffect, useContext, useCallback, useMemo).
- Extract custom hooks to `src/hooks/`.
- Memoize expensive computations and callbacks.

### Next.js (App Router)
- Use `app/` directory structure (not `pages/`).
- Follow conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Use Server Components by default; mark Client Components with `use client`.
- API routes go in `app/api/` as route handlers.

### File Naming
- Files: kebab-case (`photo-upload.tsx`, `auth-service.ts`)
- Components: PascalCase (`PhotoUpload.tsx`)
- Types: PascalCase (`PhotoType.ts`)

### Import Order
1. React & React DOM
2. Next.js imports
3. Third-party libraries
4. Local utils, services, lib/
5. Components
6. Types

### Tailwind CSS
- Use utility classes; no inline `style={}` attributes.
- Create reusable components for repeated patterns.
- Responsive design: mobile-first (`sm:`, `md:`, `lg:`, `xl:`).
- Dark mode: use `dark:` prefix where appropriate.

### Supabase
- Always enable RLS on tables.
- Never expose `service_role` keys client-side.
- Use auto-generated types: `npx supabase gen types typescript --local > src/types/supabase.ts`
- Use RLS policies to enforce data isolation at the database level.

### Error Handling
- Use try/catch blocks with proper error typing.
- Never silently swallow errors.
- Return meaningful error messages to clients.
- Log errors with context (user ID, action, timestamp).

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   ├── api/                # API routes
│   ├── auth/               # Auth pages (login, signup, reset)
│   ├── dashboard/          # Photographer dashboard
│   ├── gallery/            # Client-facing gallery
│   └── settings/           # Account settings
├── components/
│   ├── common/             # Reusable UI (Button, Card, Modal)
│   └── features/           # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions & services
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── cloudflare.ts
│   └── ai/                 # SigLIP classifier
├── types/                  # TypeScript types
└── styles/                 # Global styles
```

## Git Workflow

### Branch Naming
```
feat/agent-id/short-description
fix/agent-id/short-description
refactor/agent-id/short-description
```

### Commit Format (conventional commits)
```
type(scope): message
```
Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

### Pull Requests
1. Never push directly to `main`. Always create a feature branch and PR.
2. PR title format: `[agent-id] Brief description`
3. PR description must include: what was built, how to test, known limitations.

## Testing

- Write tests for all new features using Vitest.
- Minimum 80% coverage for new code.
- Test files: `*.test.ts` or `*.test.tsx` co-located with source.
- Run `npm run test` before creating a PR.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## IMPORTANT RULES

1. NEVER push directly to `main` branch. Always create a feature branch and PR.
2. NEVER delete files without explicit instruction.
3. NEVER commit secrets or API keys.
4. ALWAYS run `npm run lint` before creating a PR.
5. ALWAYS run tests before creating a PR.
6. If unsure, add a TODO comment. Do not guess.

## What This Repo Is NOT

This repo is the **product** only. It does NOT contain:
- The ops dashboard (that is `view1-dashboard` repo)
- The Telegram bot or agent scripts (that is `~/view1-studio/agents/`)
- Strategy docs, competitive analysis, or business plans (that is `~/view1-studio/docs/`)

Stay focused on building the product. Do not create dashboard HTML pages or bot scripts here.

---
## Agent System Rules (view1-sort v7)

### Model discipline — non-negotiable
- Haiku:  telegram-operator, design-extractor, task-sync, day-assistant, sec-scanner
- Sonnet: coordinator, ui-builder, logic-builder, db-agent, ai-builder, browser-tester
- Opus:   pencil-writer (ALWAYS — every write), sec-auditor (once/week max)

### Credit rules
- /compact after every 3 tasks
- @file references only — never paste file contents
- Max 10 files in context at once
- Never start a task without checking 2-minute window buffer
- Update spend avg in STATE.md every 3 tasks

### Guardrails
- Read STATE.md before every session — no exceptions
- Never touch files marked "DO NOT TOUCH" in STATE.md
- Phase 1 only — Phase 2 features are BLOCKED
- One task per commit — no batching
- Design questions held overnight — sent in 8am morning sequence only
- Pencil write-back: always Opus, always delete old Built frame first

### Start command (paste this at 10pm)
Read STATE.md and SPEC.md. Run the 10pm startup sequence.
Generate/refresh the Asana queue. Read Pencil for design changes.
Fix broken items first. Build until 8am. Send morning check-in at 8am.
Halt only on CRITICAL security or two consecutive failures on same file.

---
## Agent System Rules (view1-sort v7)

### Model discipline — non-negotiable
- Haiku:  telegram-operator, design-extractor, task-sync, day-assistant, sec-scanner
- Sonnet: coordinator, ui-builder, logic-builder, db-agent, ai-builder, browser-tester
- Opus:   pencil-writer (ALWAYS — every write), sec-auditor (once/week max)

### Credit rules
- /compact after every 3 tasks
- @file references only — never paste file contents
- Max 10 files in context at once
- Never start a task without checking 2-minute window buffer
- Update spend avg in STATE.md every 3 tasks

### Guardrails
- Read STATE.md before every session — no exceptions
- Never touch files marked "DO NOT TOUCH" in STATE.md
- Phase 1 only — Phase 2 features are BLOCKED
- One task per commit — no batching
- Design questions held overnight — sent in 8am morning sequence only
- Pencil write-back: always Opus, always delete old Built frame first

### Architecture reference docs (read at session start)
- STATE.md — nightly state, broken items, tonight's instructions
- SPEC.md — product spec and Phase 1 feature list
- docs/strategy/ARCHITECTURE-DECISIONS.md — resolved decisions on fonts, AI arch, status enum, charts, drag-drop, e-signature, 17 new DB tables, hardcoded colors fix
- docs/strategy/APP-ARCHITECTURE.html — full 12-page app layout and component map
- docs/strategy/FEATURE-ROADMAP.html — competitive feature roadmap

### Start command (paste this at 10pm)
Read STATE.md, SPEC.md, and docs/strategy/ARCHITECTURE-DECISIONS.md. Run the 10pm startup sequence.
Generate/refresh the Asana queue from docs/strategy/APP-ARCHITECTURE.html. Read Pencil for design changes.
Fix broken items first (hardcoded colors in DashboardV2 is priority zero). Build until 8am. Send morning check-in at 8am.
Halt only on CRITICAL security or two consecutive failures on same file.
