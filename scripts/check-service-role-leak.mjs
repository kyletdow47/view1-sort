#!/usr/bin/env node
/**
 * Service-role leak guard.
 *
 * Fails if the Supabase service-role key identifier appears anywhere in `src/`
 * outside the files permitted to read it. The service role bypasses RLS, so
 * any occurrence in client-reachable code is a security regression.
 *
 * Permitted files:
 *   - `src/lib/supabase/server.ts`      (the single centralized helper)
 *   - `src/app/api/**\/*`               (server-only route handlers + tests)
 *
 * Run locally:  node scripts/check-service-role-leak.mjs
 * Run in CI:    via `npm run check:service-role-leak`
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const REPO_ROOT = process.cwd()
const SRC_DIR = join(REPO_ROOT, 'src')
const NEEDLE = 'SUPABASE_SERVICE_ROLE_KEY'

const ALLOWED = [
  join('src', 'lib', 'supabase', 'server.ts'),
  join('src', 'app', 'api') + sep,
]

function isAllowed(relPath) {
  return ALLOWED.some((prefix) =>
    prefix.endsWith(sep) ? relPath.startsWith(prefix) : relPath === prefix
  )
}

/** @param {string} dir */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      yield* walk(full)
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) {
      yield full
    }
  }
}

const violations = []

for (const file of walk(SRC_DIR)) {
  const rel = relative(REPO_ROOT, file)
  if (isAllowed(rel)) continue
  const contents = readFileSync(file, 'utf8')
  if (contents.includes(NEEDLE)) {
    const lines = contents.split('\n')
    lines.forEach((line, idx) => {
      if (line.includes(NEEDLE)) {
        violations.push(`${rel}:${idx + 1}: ${line.trim()}`)
      }
    })
  }
}

if (violations.length > 0) {
  console.error(
    `\n❌ Service-role key leak detected. ${NEEDLE} may only appear in:\n` +
      ALLOWED.map((p) => `  - ${p}`).join('\n') +
      `\n\nViolations:\n` +
      violations.map((v) => `  ${v}`).join('\n') +
      `\n\nRoute service-role usage through getServiceRoleClient() in src/lib/supabase/server.ts.\n`
  )
  process.exit(1)
}

console.log(`✅ No ${NEEDLE} leaks detected outside allowed paths.`)
