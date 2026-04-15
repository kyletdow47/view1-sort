#!/usr/bin/env tsx
/**
 * bootstrap-sort — run the AI sorting pipeline against a local folder of
 * photos and generate an HTML report showing what the AI predicted.
 *
 * Usage:
 *   npx tsx scripts/bootstrap-sort.ts <folder-name>
 *
 * Example folder structure:
 *   ai-training/raw/lisbon-travel-2025/
 *     preset.txt      (contains "travel")
 *     IMG_0001.jpg
 *     IMG_0002.jpg
 *     ...
 *
 * After running, open the report:
 *   open ai-training/raw/lisbon-travel-2025/sort-report.html
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { resolve, join, extname, basename } from 'node:path'
import { pipeline, env, RawImage, type Pipeline } from '@xenova/transformers'
import { getPreset, getAllLabels, getCategoryForLabel } from '../src/lib/ai/presets'

env.allowLocalModels = false
env.allowRemoteModels = true

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

interface SortedPhoto {
  filename: string
  relPath: string
  category: string
  topLabel: string
  confidence: number
  topPredictions: Array<{ label: string; score: number }>
}

async function main(): Promise<void> {
  const shootArg = process.argv[2]
  if (!shootArg) {
    console.error(`\nUsage: npx tsx scripts/bootstrap-sort.ts <folder-name>`)
    console.error(`\nExample: npx tsx scripts/bootstrap-sort.ts lisbon-travel-2025\n`)
    process.exit(1)
  }

  const shootDir = resolve(process.cwd(), 'ai-training/raw', shootArg)
  if (!existsSync(shootDir) || !statSync(shootDir).isDirectory()) {
    console.error(`\n❌ Folder not found: ${shootDir}`)
    console.error(`   Create it and drop photos in, plus a preset.txt file.\n`)
    process.exit(1)
  }

  const presetPath = join(shootDir, 'preset.txt')
  if (!existsSync(presetPath)) {
    console.error(`\n❌ Missing ${presetPath}`)
    console.error(`   Create preset.txt with one of: wedding, real-estate, commercial, fashion, travel, event\n`)
    process.exit(1)
  }

  const presetId = readFileSync(presetPath, 'utf-8').trim()
  const preset = getPreset(presetId)
  if (!preset) {
    console.error(`\n❌ Unknown preset "${presetId}"`)
    console.error(`   Valid presets: wedding, real-estate, commercial, fashion, travel, event\n`)
    process.exit(1)
  }

  const photoFiles = readdirSync(shootDir)
    .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .sort()

  if (photoFiles.length === 0) {
    console.error(`\n❌ No photos found in ${shootDir}`)
    console.error(`   Drop .jpg / .png / .webp files in and try again.\n`)
    process.exit(1)
  }

  console.log(`\n📸 Sorting ${photoFiles.length} photos — preset: ${preset.icon} ${preset.name}`)
  console.log(`📦 Loading CLIP model...`)

  let lastProgress = -1
  const pipe = (await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
    progress_callback: (info: unknown) => {
      const p = info as { status?: string; progress?: number; file?: string }
      if (p?.status !== 'progress' || typeof p.progress !== 'number') return
      if (!p.file?.endsWith('.onnx')) return
      const rounded = Math.floor(p.progress / 10) * 10
      if (rounded !== lastProgress) {
        lastProgress = rounded
        console.log(`   Downloading: ${rounded}%`)
      }
    },
  })) as Pipeline

  console.log(`✅ Model loaded — sorting now...\n`)

  const labels = getAllLabels(preset)
  const sorted: SortedPhoto[] = []
  const startTime = Date.now()

  for (let i = 0; i < photoFiles.length; i++) {
    const filename = photoFiles[i]
    const fullPath = join(shootDir, filename)

    try {
      // RawImage.read handles JPG/PNG/WebP/HEIC from local paths
      const image = await RawImage.read(fullPath)

      const raw = (await (pipe as unknown as (
        img: RawImage,
        labels: string[],
        opts: { topk: number },
      ) => Promise<Array<{ label: string; score: number }>>)(image, labels, { topk: 5 }))

      const top = raw[0]
      const category = top ? getCategoryForLabel(preset, top.label) ?? 'Uncategorized' : 'Uncategorized'

      sorted.push({
        filename,
        relPath: filename,
        category,
        topLabel: top?.label ?? '',
        confidence: top?.score ?? 0,
        topPredictions: raw.slice(0, 3),
      })

      console.log(`   [${i + 1}/${photoFiles.length}] ${filename.padEnd(30)} → ${category.padEnd(22)} (${(top?.score ?? 0).toFixed(2)})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`   [${i + 1}/${photoFiles.length}] ${filename.padEnd(30)} FAILED — ${msg}`)
    }
  }

  const durationMs = Date.now() - startTime

  /* ── Generate HTML report ── */

  const reportPath = writeHtmlReport(shootDir, shootArg, preset, sorted, durationMs)

  console.log(``)
  console.log(`╔═════════════════════════════════════════════════════════╗`)
  console.log(`║  SORT REPORT                                            ║`)
  console.log(`╚═════════════════════════════════════════════════════════╝`)
  console.log(`  Photos sorted:      ${sorted.length}`)
  console.log(`  Preset:             ${preset.name}`)
  console.log(`  Duration:           ${(durationMs / 1000).toFixed(1)}s`)
  console.log(``)
  console.log(`  Category breakdown:`)
  const byCategory = new Map<string, number>()
  for (const s of sorted) byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1)
  for (const [cat, n] of Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat.padEnd(22)} ${n}`)
  }
  console.log(``)
  console.log(`  📄 Report: ${reportPath}`)
  console.log(`  👉 open "${reportPath}"\n`)
}

/* ------------------------------------------------------------------ */
/*  HTML report                                                        */
/* ------------------------------------------------------------------ */

function writeHtmlReport(
  shootDir: string,
  shootName: string,
  preset: { icon: string; name: string; categories: Array<{ name: string }> },
  sorted: SortedPhoto[],
  durationMs: number,
): string {
  const byCategory = new Map<string, SortedPhoto[]>()
  for (const s of sorted) {
    const arr = byCategory.get(s.category) ?? []
    arr.push(s)
    byCategory.set(s.category, arr)
  }

  const categoryOrder = [
    ...preset.categories.map((c) => c.name),
    'Uncategorized',
  ]

  const sections = categoryOrder
    .filter((cat) => byCategory.has(cat))
    .map((cat) => {
      const photos = byCategory.get(cat) ?? []
      const cards = photos.map((p) => `
        <div class="card">
          <img src="${escapeHtml(p.relPath)}" loading="lazy" alt="${escapeHtml(p.filename)}" />
          <div class="meta">
            <div class="filename">${escapeHtml(p.filename)}</div>
            <div class="confidence">${(p.confidence * 100).toFixed(0)}% — ${escapeHtml(p.topLabel)}</div>
          </div>
        </div>
      `).join('')

      return `
        <section>
          <h2>${escapeHtml(cat)} <span class="count">${photos.length}</span></h2>
          <div class="grid">${cards}</div>
        </section>
      `
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(shootName)} — AI Sort Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #eee; margin: 0; padding: 2rem; }
  header { margin-bottom: 2rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
  .subtitle { color: #888; font-size: 0.875rem; }
  .stats { margin-top: 1rem; display: flex; gap: 2rem; flex-wrap: wrap; font-size: 0.875rem; color: #aaa; }
  section { margin-bottom: 3rem; }
  h2 { font-size: 1.125rem; border-bottom: 1px solid #222; padding-bottom: 0.5rem; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.75rem; }
  .count { background: #222; color: #aaa; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 999px; font-weight: normal; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
  .card { background: #141414; border-radius: 6px; overflow: hidden; }
  .card img { width: 100%; height: 150px; object-fit: cover; display: block; }
  .meta { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
  .filename { color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .confidence { color: #888; margin-top: 0.125rem; }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(preset.icon)} ${escapeHtml(shootName)}</h1>
    <div class="subtitle">Preset: ${escapeHtml(preset.name)} — ${sorted.length} photos sorted in ${(durationMs / 1000).toFixed(1)}s</div>
    <div class="stats">
      ${Array.from(byCategory.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .map(([cat, ps]) => `<span>${escapeHtml(cat)}: <strong>${ps.length}</strong></span>`)
        .join('')}
    </div>
  </header>
  ${sections}
</body>
</html>`

  const path = join(shootDir, 'sort-report.html')
  writeFileSync(path, html, 'utf-8')
  return path
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})

// satisfy unused import guard when basename is tree-shaken by tsx
void basename
