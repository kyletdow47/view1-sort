#!/usr/bin/env tsx
/**
 * run-eval — measure sorting accuracy against ai-training/eval-stock/manifest.json.
 *
 * Loads CLIP (clip-vit-base-patch32) in Node, runs each photo through the
 * same preset-specific label list the production pipeline uses, compares
 * the predicted category to the manifest's expected category, and writes
 * a timestamped JSON report.
 *
 * Usage:
 *   npx tsx src/lib/ai/__evals__/run-eval.ts
 *   npx tsx src/lib/ai/__evals__/run-eval.ts --preset=travel
 *   npx tsx src/lib/ai/__evals__/run-eval.ts --limit=20
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pipeline, env, type Pipeline } from '@xenova/transformers'
import { BUILT_IN_PRESETS, getPreset, getAllLabels, getCategoryForLabel } from '../presets'
import type { EvalManifest, EvalEntry } from '../../../../scripts/fetch-eval-stock'

// Node-friendly config — cache models under ~/.cache/xenova
env.allowLocalModels = false
env.allowRemoteModels = true

interface EvalRowResult {
  preset: string
  expected: string
  predicted: string
  topLabel: string
  confidence: number
  correct: boolean
  pexelsId: number
}

interface PerCategoryStats {
  preset: string
  category: string
  total: number
  correct: number
  accuracy: number
}

interface EvalReport {
  generatedAt: string
  model: string
  totalPhotos: number
  overallAccuracy: number
  perCategory: PerCategoryStats[]
  perPresetAccuracy: Array<{ preset: string; total: number; accuracy: number }>
  confusionMatrix: Record<string, Record<string, number>> // preset/expected → preset/predicted → count
  worstCategories: PerCategoryStats[]
  durationMs: number
}

function parseArgs(): { presetFilter?: string; limit?: number; quiet: boolean } {
  const args = process.argv.slice(2)
  const out: { presetFilter?: string; limit?: number; quiet: boolean } = { quiet: false }
  for (const a of args) {
    if (a.startsWith('--preset=')) out.presetFilter = a.slice('--preset='.length)
    else if (a.startsWith('--limit=')) out.limit = parseInt(a.slice('--limit='.length), 10)
    else if (a === '--quiet') out.quiet = true
  }
  return out
}

async function main(): Promise<void> {
  const { presetFilter, limit, quiet } = parseArgs()
  const manifestPath = resolve(process.cwd(), 'ai-training/eval-stock/manifest.json')

  if (!existsSync(manifestPath)) {
    console.error(`\n❌ Manifest not found at ${manifestPath}`)
    console.error(`   Run first:  PEXELS_API_KEY=xxx npx tsx scripts/fetch-eval-stock.ts\n`)
    process.exit(1)
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as EvalManifest
  let entries = manifest.entries

  if (presetFilter) entries = entries.filter((e) => e.preset === presetFilter)
  if (limit) entries = entries.slice(0, limit)

  if (entries.length === 0) {
    console.error(`❌ No entries match filters.`)
    process.exit(1)
  }

  console.log(`\n🧪 Evaluating ${entries.length} photos across ${new Set(entries.map((e) => e.preset)).size} presets`)
  console.log(`📦 Loading CLIP (clip-vit-base-patch32)...`)

  const start = Date.now()

  let lastProgressReported = -1
  const pipe = (await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
    progress_callback: (info: unknown) => {
      const p = info as { status?: string; progress?: number; file?: string }
      if (p?.status !== 'progress' || typeof p.progress !== 'number') return
      if (!p.file?.endsWith('.onnx')) return
      const rounded = Math.floor(p.progress / 10) * 10
      if (rounded !== lastProgressReported) {
        lastProgressReported = rounded
        console.log(`   Downloading model: ${rounded}%`)
      }
    },
  })) as Pipeline

  console.log(`✅ Model loaded\n`)

  const results: EvalRowResult[] = []
  const confusion: Record<string, Record<string, number>> = {}

  for (let i = 0; i < entries.length; i++) {
    const entry: EvalEntry = entries[i]
    const preset = getPreset(entry.preset)
    if (!preset) {
      console.warn(`   ⚠ Skip ${entry.pexelsId} — unknown preset ${entry.preset}`)
      continue
    }

    const labels = getAllLabels(preset)

    try {
      const raw = (await (pipe as unknown as (
        src: string,
        labels: string[],
        opts: { topk: number },
      ) => Promise<Array<{ label: string; score: number }>>)(entry.url, labels, { topk: 1 }))

      const top = raw[0]
      const predictedCategory = top ? getCategoryForLabel(preset, top.label) ?? 'Uncategorized' : 'Uncategorized'
      const correct = predictedCategory === entry.category

      results.push({
        preset: entry.preset,
        expected: entry.category,
        predicted: predictedCategory,
        topLabel: top?.label ?? '',
        confidence: top?.score ?? 0,
        correct,
        pexelsId: entry.pexelsId,
      })

      // Confusion matrix
      const expKey = `${entry.preset}/${entry.category}`
      const predKey = `${entry.preset}/${predictedCategory}`
      confusion[expKey] ??= {}
      confusion[expKey][predKey] = (confusion[expKey][predKey] ?? 0) + 1

      const marker = correct ? '✓' : '✗'
      const confStr = (top?.score ?? 0).toFixed(2)
      if (!quiet) {
        console.log(`   [${i + 1}/${entries.length}] ${marker} ${entry.preset}/${entry.category.padEnd(22)} → ${predictedCategory.padEnd(22)} (${confStr})`)
      } else if ((i + 1) % 25 === 0 || i === entries.length - 1) {
        const pct = Math.round(((i + 1) / entries.length) * 100)
        const soFar = results.filter((r) => r.correct).length
        const acc = results.length > 0 ? (soFar / results.length * 100).toFixed(1) : '0'
        console.log(`   [${i + 1}/${entries.length}] ${pct}% done — running accuracy ${acc}%`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`\n   ⚠ Failed ${entry.pexelsId}: ${msg}`)
    }
  }

  console.log(`\n`)

  /* ---------- Aggregate ---------- */

  const totalCorrect = results.filter((r) => r.correct).length
  const overallAccuracy = results.length > 0 ? totalCorrect / results.length : 0

  const perCategoryMap = new Map<string, { correct: number; total: number; preset: string; category: string }>()
  for (const r of results) {
    const key = `${r.preset}/${r.expected}`
    const slot = perCategoryMap.get(key) ?? { correct: 0, total: 0, preset: r.preset, category: r.expected }
    slot.total += 1
    if (r.correct) slot.correct += 1
    perCategoryMap.set(key, slot)
  }

  const perCategory: PerCategoryStats[] = Array.from(perCategoryMap.values())
    .map((s) => ({ ...s, accuracy: s.correct / s.total }))
    .sort((a, b) => a.accuracy - b.accuracy)

  const perPresetMap = new Map<string, { correct: number; total: number }>()
  for (const r of results) {
    const slot = perPresetMap.get(r.preset) ?? { correct: 0, total: 0 }
    slot.total += 1
    if (r.correct) slot.correct += 1
    perPresetMap.set(r.preset, slot)
  }

  const perPresetAccuracy = Array.from(perPresetMap.entries()).map(([preset, s]) => ({
    preset,
    total: s.total,
    accuracy: s.correct / s.total,
  }))

  const report: EvalReport = {
    generatedAt: new Date().toISOString(),
    model: 'Xenova/clip-vit-base-patch32 (CLIP only, no vision escalation)',
    totalPhotos: results.length,
    overallAccuracy,
    perCategory,
    perPresetAccuracy,
    confusionMatrix: confusion,
    worstCategories: perCategory.slice(0, 5),
    durationMs: Date.now() - start,
  }

  /* ---------- Write report ---------- */

  const reportDir = resolve(process.cwd(), 'ai-training/eval-history')
  if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const reportPath = resolve(reportDir, `baseline-${stamp}.json`)
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')

  /* ---------- Console summary ---------- */

  console.log(`╔═════════════════════════════════════════════════════════╗`)
  console.log(`║  EVAL REPORT                                            ║`)
  console.log(`╚═════════════════════════════════════════════════════════╝`)
  console.log(`  Total photos:       ${report.totalPhotos}`)
  console.log(`  Overall accuracy:   ${(overallAccuracy * 100).toFixed(1)}%`)
  console.log(`  Duration:           ${(report.durationMs / 1000).toFixed(1)}s`)
  console.log(``)
  console.log(`  Per-preset accuracy:`)
  for (const p of perPresetAccuracy) {
    console.log(`    ${p.preset.padEnd(14)} ${(p.accuracy * 100).toFixed(1)}%  (${p.total} photos)`)
  }
  console.log(``)
  console.log(`  Worst categories (room for improvement):`)
  for (const c of report.worstCategories) {
    console.log(`    ${c.preset}/${c.category.padEnd(22)} ${(c.accuracy * 100).toFixed(1)}%  (${c.correct}/${c.total})`)
  }
  console.log(``)
  console.log(`  Report written: ${reportPath}\n`)
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
