# View1 Sort — Agent Handoff

**Date:** 2026-04-15
**Last commit on `main`:** `c1e4810` (landing hero scroll indicator, Apr pre-AI-sort)
**Active branch:** `feat/ai-sort/brain2-conversation-engine` (pushed to GitHub)
**Repo:** `https://github.com/kyletdow47/view1-sort`

This handoff supersedes the Mar 27-28 section at the bottom. Read top-to-bottom, then jump to "Resume on Mac mini" to pick up.

---

## Current Session (Apr 14-15) — AI Sorting Brain

### What shipped this session

The AI sorting system got a full backend rebuild. Old version: one CLIP model in the browser with 26 wedding labels, no persistence, no memory, no conversation. New version: two brains.

**Brain 1 (Eyes) — browser, free, unlimited:**
- SigLIP (`Xenova/siglip-base-patch16-224`) via `@huggingface/transformers` v4
- Expanded label taxonomy: 11 categories, ~50 sentence-format labels (SigLIP wants descriptive sentences, not bare nouns)
- Batch scanner pipeline: classification + culling (blur/exposure/dupes) + EXIF extraction
- Batch summary generator produces a natural-language paragraph for Brain 2 to read

**Brain 2 (Mind) — Claude API via Supabase Edge Function, 2-3 calls per sort session:**
- Supabase Edge Function `sort-conversation` with three modes: `brief`, `followup`, `plan`
- Uses `claude-haiku-4-5-20251001` for speed/cost (~$0.005-0.007 per sort session)
- Reads: photographer's brief + batch summary + memory profile
- Returns: categories, matchLabels, quality threshold, reject criteria

**Memory system:**
- New `sort_profiles` + `sort_sessions` tables with RLS
- EMA preference learning (α=0.15, weights clamped [0.2, 2.0])
- `buildMemoryContext()` produces natural-language memory summary for Claude

**Frontend integration:**
- `ai-sort/page.tsx` `SortPhase` rewritten: stages `loading → scanning → planning → done`
- Uses `scanBatch` worker message, posts batch summary to `/api/ai/sort-conversation` mode=`plan`
- Graceful fallback: if Edge Function fails, falls back to per-photo classify (page doesn't break pre-deploy)
- `/api/ai/parse-vibe` rewritten as thin wrapper around sort-conversation mode=`brief` with heuristic fallback

### Per-sort API call budget

| Step | API Calls | Model | Cost |
|------|-----------|-------|------|
| Pre-scan (all photos) | 0 (browser) | SigLIP | Free |
| Brief interpretation | 1 | Haiku | ~$0.002 |
| Follow-up questions (optional) | 0-1 | Haiku | ~$0.002 |
| Generate sort plan | 1 | Haiku | ~$0.003 |
| **Total** | **2-3** | | **~$0.005-0.007** |

At 100 sorts/month/user that's ~$0.50-0.70/user/month in API costs.

---

## Ship status

| Task | Status | Owner |
|------|--------|-------|
| Brain 1 (SigLIP + expanded labels) | DONE | code |
| Batch scanner pipeline (class + cull + EXIF) | DONE | code |
| Batch summary generator | DONE | code |
| Edge Function `sort-conversation` | DONE (written, not deployed) | code |
| API route `/api/ai/sort-conversation` | DONE | code |
| API route `/api/media/classify-batch` | DONE | code |
| Sort executor (plan → SortedPhoto[]) | DONE | code |
| Memory system (read/write/context) | DONE | code |
| DB migration `sort_profiles` + `sort_sessions` | DONE (not pushed) | code |
| Parse-vibe route rewrite | DONE | code |
| Frontend wiring (SortPhase) | DONE | code |
| Tests (memory, sort-executor, batch-summary, labels, classifier) | DONE | code |
| Build passing (`tsc --noEmit`, `npm run build`) | DONE | code |
| **Deploy Edge Function** | TODO | manual |
| **Push DB migration** | TODO | manual |
| **Set `ANTHROPIC_API_KEY` secret** | TODO | manual |
| **End-to-end smoke test** | TODO | manual |

---

## File map — what changed this session

### New files
```
src/lib/ai/batch-scanner.ts
src/lib/ai/batch-scanner-worker.ts
src/lib/ai/batch-summary.ts           + batch-summary.test.ts
src/lib/ai/exif.ts
src/lib/ai/sort-executor.ts           + sort-executor.test.ts
src/lib/ai/memory.ts                  + memory.test.ts
src/app/api/ai/sort-conversation/route.ts
src/app/api/media/classify-batch/route.ts
supabase/functions/sort-conversation/index.ts
supabase/migrations/20260414000000_sort_memory.sql
.claude/launch.json                   (port 3100 override)
```

### Modified
```
package.json                   (xenova v2 → huggingface v4, +exifreader)
package-lock.json              (matching lock)
src/lib/ai/classifier.ts       (SigLIP model + optional labels param)
src/lib/ai/classifier.test.ts  (huggingface mock)
src/lib/ai/labels.ts           (11 categories, sentence-format)
src/lib/ai/labels.test.ts      (new taxonomy)
src/lib/ai/presets.ts          (all 6 presets rewritten for SigLIP)
src/lib/ai/worker.ts           (+scanBatch message type, +labels passthrough)
src/app/api/ai/parse-vibe/route.ts  (sort-conversation wrapper)
src/app/dashboard/ai-sort/page.tsx  (SortPhase rewrite, new stages)
tsconfig.json                  (exclude supabase/functions — Deno, not Node)
```

### NOT touched this session (other agents/user)
Listed in "Unrelated uncommitted work" below.

---

## Resume on Mac mini

```bash
# 1. Clone or pull
git clone https://github.com/kyletdow47/view1-sort.git
cd view1-sort
git checkout feat/ai-sort/brain2-conversation-engine

# 2. Env — copy .env.local from 1Password or the MacBook (DO NOT commit)
# Needs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#        SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL

# 3. Install
npm install

# 4. Verify
npm run lint
npx tsc --noEmit
npm run test
npm run build

# 5. If all green, work through the 4 ship tasks below.
```

### Files to be aware of on the Mac mini
- **Secrets are NOT in the repo.** The MacBook has `.env.local` + `.env.local.pulled`. The `.pulled` file holds service role keys — never commit it. `.gitignore` covers `.env*.local` already.
- **`supabase/functions/sort-conversation/index.ts`** uses Deno imports (`@anthropic-ai/sdk` via URL). `tsconfig.json` excludes the whole `supabase/functions` dir so Node tsc ignores it. Don't remove that exclude.
- **Dev server port:** `.claude/launch.json` hardcodes `PORT=3100`. User's own dev server runs on 3000. Keep the override.

---

## The 4 ship tasks (manual)

### Task 1 — Deploy the Edge Function

```bash
# Login once
npx supabase login

# Link the project
npx supabase link --project-ref ojdhvkywfyvoduzxvsoq

# Deploy the function
npx supabase functions deploy sort-conversation --no-verify-jwt

# Set the Claude API secret
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Get the Anthropic key from https://console.anthropic.com/settings/keys.

### Task 2 — Push the DB migration

```bash
# Dry-run check
npx supabase db diff --schema public

# Apply
npx supabase db push
```

Creates `sort_profiles` and `sort_sessions` tables with RLS policies.

### Task 3 — Verify via smoke test

1. `npm run dev` (port 3100)
2. Open `http://localhost:3100/dashboard/ai-sort`
3. Upload 5-10 test photos
4. Enter a brief like "corporate headshots for a tech startup, clean business look"
5. Watch console: should log `scan complete` → `plan received` → `executeSortPlan done`
6. Check Supabase `sort_sessions` table — one row per sort
7. Check Supabase `media` table — `ai_category`, `ai_confidence`, `sort_order` populated

**If Edge Function call fails:** the frontend falls back to per-photo classify, so the page still works. But fix the Function — check logs in Supabase dashboard.

### Task 4 — Merge and deploy to production

```bash
# Create PR
gh pr create \
  --base main \
  --head feat/ai-sort/brain2-conversation-engine \
  --title "feat(ai-sort): two-brain architecture (SigLIP + Claude)" \
  --body "See HANDOFF.md for details"

# After merge
git checkout main && git pull
# Vercel auto-deploys on main push
```

CLAUDE.md rule: never push to main directly, always PR.

---

## Architecture notes

### Why a Supabase Edge Function and not a Next.js route?
Keeps the Anthropic API key out of the Next.js server bundle. Edge Function runs in Deno, separate runtime, secrets managed via `supabase secrets`. The Next.js route at `/api/ai/sort-conversation` is a thin proxy that forwards the user's auth JWT.

### Why Haiku and not Sonnet?
Sort plan generation is structured extraction, not reasoning. Haiku 4.5 is fast (~1s) and cheap. If we need more creative/complex briefs later, the plan was to fall back to Sonnet automatically but that's not implemented yet.

### Why sentence-format labels for SigLIP?
SigLIP is a sigmoid-loss contrastive model — it compares image embeddings to text embeddings, and descriptive sentences ("a photograph of a bride posing for a portrait") embed closer to real captions than bare tokens ("bride portrait"). Scores are noticeably higher and categories separate better.

### Why EMA and not a more complex memory model?
EMA is stateless (one row per user), converges fast (α=0.15 means ~10 sorts to stabilize), and degrades gracefully if a user's style changes. The weights are bounded [0.2, 2.0] so a single bad correction can't poison the profile.

---

## Known gaps / future work

- **No follow-up question round yet.** Edge Function has mode=`followup` but the frontend never triggers it. Skipped for v1 — one-shot sort is enough for most briefs.
- **No Sonnet fallback.** Complex briefs get the same Haiku treatment. If we see sort quality dip, add a complexity check before picking the model.
- **Memory context isn't surfaced in UI.** User has no way to see "the AI thinks I prefer 6-8 categories for weddings." Nice to have.
- **Duplicate groups ignored by sort executor.** Scanner detects them but sort plan doesn't dedupe. Low priority — photographers usually want to see dupes.
- **`classify-batch` route doesn't handle partial failures.** If 50 of 500 writes fail, the other 450 still go through but no retry logic. Fine for v1.
- **Build fails if `ANTHROPIC_API_KEY` is missing in Edge Function.** The Function errors at runtime, not build time, so the app itself boots. But sorts will fail until the secret is set.

---

## Unrelated uncommitted work (on MacBook, NOT in this branch)

The MacBook has a lot of uncommitted work that is NOT AI sort. I deliberately did not commit these — per CLAUDE.md "one task per commit." If you want these on the Mac mini, either commit them on the MacBook first OR copy them over manually. Full list:

**Modified (not mine):**
- `.gitignore`, `BUILD-STATE.md`, `CLAUDE.md`, `STATE.md`
- `V1 test.pen` (Pencil file)
- `next-env.d.ts`
- `public/wiki/index.html`
- `src/app/api/media/process/route.ts`
- `src/lib/email/templates/waitlist-*.tsx`
- `src/middleware.ts`
- `supabase/.temp/cli-latest`

**New (not mine):**
- `AGENT-PROMPT.md`
- `dashboard-v2.png`, `background*.jpg`, `space*.jpg`, `sunset alps.jpg`, `spaceship.jpg`, `jHMkx.png` (design assets)
- `public/bg-cms.jpg`, `public/build-validation.html`, `public/email-preview.html`
- `docs/marketing/*` (big folder: GTM, outreach, remotion, content strategy)
- `images/*` (generated images)
- `src/app/api/admin/` (admin routes)
- `src/app/api/cron/` (cron jobs)
- `src/app/cms/` (CMS UI)
- `src/components/cms/` (CMS components)
- `src/lib/utm.ts`
- `vercel.json`
- `.env.local.pulled` **(SECRETS — never commit)**

To see current state on Mac mini after clone: `git status`.

---

## Previous handoff (Mar 27-28) — preserved for context

Started with a skeleton prototype, ended with a fully-wired production app. 39 pages, real Supabase data, real Stripe payments, real AI classification, real email delivery.

### What Was Built (Mar 27-28)

**Design & UI:**
- Full Stitch design system port (Material Design 3 tokens, Manrope/Inter/Space Grotesk fonts)
- 38 pages built/rebuilt matching Stitch mockups + AI Studio prototype
- Dashboard, project workspace, gallery, settings, bookings, calendar, AI sort, analytics, billing, clients

**Real Code Wiring:**
- Auth middleware restored (Supabase sessions)
- Dashboard, workspace, gallery, onboarding, billing, analytics, clients, bookings, calendar — all wired to real Supabase data
- AI sort uses real CLIP model via Web Worker (now replaced with SigLIP in Apr 14-15 session)
- Stripe checkout + webhooks fully functional
- Gallery access gate with token validation

**Critical Infrastructure:**
- Email system: Resend SDK + 6 branded HTML templates
- Gallery invite API, ZIP export, notifications, Cloudflare Images upload
- Project settings, publish flow, cart ↔ checkout, AI sort → Supabase writes
- New Booking modal, download tracking, payment emails, access upgrade after payment
- Free tier enforcement (3 projects), Stripe Connect pending state

### Database Schema

Migrations in `supabase/migrations/`:
- `20260326000000_create_schema.sql` — full schema + RLS + profile trigger
- `20260326000001_test_schema.sql` — test data
- `20260327000000_add_media_display_name.sql`
- `20260327000001_stripe_schema_fixes.sql`
- `20260327000002_create_bookings.sql`
- `20260414000000_sort_memory.sql` **(new this session)**

**Run `npx supabase db push` to apply all migrations.**

### Environment Variables

**Set in Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

**Still need to add (Vercel + Supabase):**
```
RESEND_API_KEY                     # Resend
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID  # Cloudflare
CLOUDFLARE_API_TOKEN               # Cloudflare
ANTHROPIC_API_KEY                  # Supabase secret only (Edge Function)
```

---

*Handoff updated 2026-04-15 for Mac mini transition. Branch: `feat/ai-sort/brain2-conversation-engine`.*
