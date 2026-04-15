#!/usr/bin/env tsx
/**
 * fetch-eval-stock — populate ai-training/eval-stock/manifest.json with
 * Pexels photo URLs, grouped by preset + category. Used as the ground-truth
 * set for `npm run eval:sort`.
 *
 * Requires PEXELS_API_KEY in env (free at pexels.com/api — no credit card).
 *
 * Usage:
 *   PEXELS_API_KEY=xxx npx tsx scripts/fetch-eval-stock.ts
 *   PEXELS_API_KEY=xxx npx tsx scripts/fetch-eval-stock.ts --preset=travel   (subset)
 *   PEXELS_API_KEY=xxx npx tsx scripts/fetch-eval-stock.ts --per-category=5  (smaller set)
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { BUILT_IN_PRESETS, type SortPreset, type SortCategory } from '../src/lib/ai/presets'

/* ------------------------------------------------------------------ */
/*  Pexels API types                                                   */
/* ------------------------------------------------------------------ */

interface PexelsPhoto {
  id: number
  photographer: string
  photographer_url: string
  url: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
  }
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
  total_results: number
}

/* ------------------------------------------------------------------ */
/*  Manifest types                                                     */
/* ------------------------------------------------------------------ */

export interface EvalEntry {
  preset: string
  category: string
  url: string
  pexelsId: number
  credit: string
  creditUrl: string
}

export interface EvalManifest {
  generatedAt: string
  perCategory: number
  entries: EvalEntry[]
}

/* ------------------------------------------------------------------ */
/*  Query builder — blends preset + category into a Pexels search term */
/* ------------------------------------------------------------------ */

function buildQuery(preset: SortPreset, category: SortCategory): string {
  // Use the first label as the query — curated and descriptive (e.g.
  // "bride getting ready", "kitchen interior"). Already Pexels-friendly.
  return category.labels[0] ?? category.name
}

/* ------------------------------------------------------------------ */
/*  CLI flags                                                          */
/* ------------------------------------------------------------------ */

function parseArgs(): { presetFilter?: string; perCategory: number } {
  const args = process.argv.slice(2)
  const out: { presetFilter?: string; perCategory: number } = { perCategory: 15 }

  for (const a of args) {
    if (a.startsWith('--preset=')) out.presetFilter = a.slice('--preset='.length)
    else if (a.startsWith('--per-category=')) out.perCategory = parseInt(a.slice('--per-category='.length), 10) || 15
  }

  return out
}

/* ------------------------------------------------------------------ */
/*  Pexels fetch                                                       */
/* ------------------------------------------------------------------ */

async function fetchPexels(query: string, perPage: number, apiKey: string): Promise<PexelsPhoto[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`

  const res = await fetch(url, { headers: { Authorization: apiKey } })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Pexels API ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as PexelsSearchResponse
  return json.photos ?? []
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.error('\n❌ PEXELS_API_KEY is not set.')
    console.error('   Get a free key at https://www.pexels.com/api/ and run:')
    console.error('   PEXELS_API_KEY=xxx npx tsx scripts/fetch-eval-stock.ts\n')
    process.exit(1)
  }

  const { presetFilter, perCategory } = parseArgs()
  const targetPresets = presetFilter
    ? BUILT_IN_PRESETS.filter((p) => p.id === presetFilter)
    : BUILT_IN_PRESETS

  if (targetPresets.length === 0) {
    console.error(`❌ No preset matches "${presetFilter}". Valid: ${BUILT_IN_PRESETS.map((p) => p.id).join(', ')}`)
    process.exit(1)
  }

  const entries: EvalEntry[] = []
  const outDir = resolve(process.cwd(), 'ai-training/eval-stock')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  console.log(`\n📸 Fetching ${perCategory} photos per category from Pexels...\n`)

  for (const preset of targetPresets) {
    console.log(`── ${preset.icon}  ${preset.name} (${preset.id})`)

    for (const category of preset.categories) {
      const query = buildQuery(preset, category)
      try {
        const photos = await fetchPexels(query, perCategory, apiKey)
        for (const p of photos) {
          entries.push({
            preset: preset.id,
            category: category.name,
            url: p.src.large, // ~1440px wide, good balance for CLIP
            pexelsId: p.id,
            credit: p.photographer,
            creditUrl: p.photographer_url,
          })
        }
        console.log(`   ✓ ${category.name.padEnd(22)} ${photos.length.toString().padStart(3)} photos  (query: "${query}")`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.log(`   ✗ ${category.name.padEnd(22)} FAILED — ${msg}`)
      }

      // Gentle rate-limit: Pexels allows 200 req/hour on the free tier
      await new Promise((r) => setTimeout(r, 250))
    }
  }

  const manifest: EvalManifest = {
    generatedAt: new Date().toISOString(),
    perCategory,
    entries,
  }

  const manifestPath = resolve(outDir, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

  console.log(`\n✅ Wrote ${entries.length} entries to ${manifestPath}`)
  console.log(`   Presets:    ${new Set(entries.map((e) => e.preset)).size}`)
  console.log(`   Categories: ${new Set(entries.map((e) => `${e.preset}/${e.category}`)).size}`)
  console.log(`\nRun eval:  npm run eval:sort\n`)
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
