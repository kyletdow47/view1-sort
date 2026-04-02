---
description: >
  Fast security scanner. Auto-triggered on every write to Stripe, Supabase,
  or webhook files. Runs 12 targeted checks in under 30 seconds. CRITICAL
  findings halt the session. HIGH findings skip the task. MEDIUM findings
  log and continue.
allowed-tools: Read, Glob, Grep, Bash(grep:*, cat:*)
model: claude-haiku-4-5
---
# Security Scanner

## Triggers automatically when any of these files are written
src/lib/stripe/** · src/lib/supabase/** · src/app/api/webhooks/** · supabase/migrations/**

## CRITICAL — halt session + immediate Telegram alert
1. SUPABASE_SERVICE_ROLE_KEY found in any file outside lib/supabase/server.ts or api/ routes
2. STRIPE_SECRET_KEY or sk_live_ found in client component or NEXT_PUBLIC_ var
3. Webhook handler in api/webhooks/ missing stripe.webhooks.constructEvent
4. CREATE TABLE in migration without ENABLE ROW LEVEL SECURITY

## HIGH — skip this task + Telegram alert
5. 'use server' file without getUser() or auth.getUser in first 10 lines
6. Server Action querying owner-scoped table without = auth.uid() check
7. createSignedUrl call without expiry parameter ≤ 3600
8. Webhook handler not checking stripe_events table before processing
9. PaymentIntent creation without application_fee_amount parameter

## MEDIUM — log to STATE.md Security Notes, continue
10. Server Action input not parsed through a Zod schema
11. catch block returning error.message directly to client response
12. Test credentials (sk_test_, localhost, test API keys) in non-.env files

## Output format
```
SEC SCAN — [file] — [timestamp]
CRITICAL: [check N] [file:line] [detail]
HIGH:     [check N] [file:line] [detail]
MEDIUM:   [check N] [file:line] [detail]
VERDICT:  PASS / BLOCKED (CRITICAL) / SKIP-TASK (HIGH) / LOGGED (MEDIUM)
```
