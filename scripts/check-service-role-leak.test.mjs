import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const SCRIPT = resolve(process.cwd(), 'scripts/check-service-role-leak.mjs')

function makeRepo(files) {
  const root = mkdtempSync(join(tmpdir(), 'srlk-'))
  const src = join(root, 'src')
  mkdirSync(src, { recursive: true })
  for (const [rel, contents] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, contents)
  }
  // symlink the script into the fake repo so __dirname → repo root walk works
  const scriptsDir = join(root, 'scripts')
  mkdirSync(scriptsDir, { recursive: true })
  symlinkSync(SCRIPT, join(scriptsDir, 'check-service-role-leak.mjs'))
  return root
}

function runCheck(root) {
  try {
    const stdout = execFileSync('node', ['scripts/check-service-role-leak.mjs'], {
      cwd: root,
      encoding: 'utf8',
    })
    return { code: 0, stdout, stderr: '' }
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    }
  }
}

describe('check-service-role-leak', () => {
  it('passes when the key only appears in allowed paths', () => {
    const root = makeRepo({
      'src/lib/supabase/server.ts': 'const k = process.env.SUPABASE_SERVICE_ROLE_KEY',
      'src/app/api/example/route.ts': 'const k = process.env.SUPABASE_SERVICE_ROLE_KEY',
      'src/lib/stripe.ts': '// no service role here',
    })
    try {
      const result = runCheck(root)
      expect(result.code).toBe(0)
      expect(result.stdout).toMatch(/No SUPABASE_SERVICE_ROLE_KEY leaks detected/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('fails when the key appears in a disallowed lib file', () => {
    const root = makeRepo({
      'src/lib/supabase/server.ts': 'const k = process.env.SUPABASE_SERVICE_ROLE_KEY',
      'src/lib/leaky.ts': 'const k = process.env.SUPABASE_SERVICE_ROLE_KEY',
    })
    try {
      const result = runCheck(root)
      expect(result.code).toBe(1)
      expect(result.stderr).toMatch(/Service-role key leak detected/)
      expect(result.stderr).toMatch(/src\/lib\/leaky\.ts:1/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('fails when the key appears in a client component', () => {
    const root = makeRepo({
      'src/components/bad.tsx':
        "'use client'\nexport const k = process.env.SUPABASE_SERVICE_ROLE_KEY",
    })
    try {
      const result = runCheck(root)
      expect(result.code).toBe(1)
      expect(result.stderr).toMatch(/src\/components\/bad\.tsx:2/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
