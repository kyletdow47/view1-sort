/**
 * Onboarding Trainer logic — samples 20 stock photos across the active
 * preset's category set, tracks decisions, and seeds the StyleProfile.
 *
 * Doubles as a tutorial: the first time a user picks a preset we ask them
 * to quick-sort keep/reject on 20 photos before their first real sort.
 */

import type {
  StockEntry,
  StockManifest,
  TrainerPhoto,
  TrainerVerdict,
} from '@/types/onboarding-trainer'
import { TRAINER_PHOTO_COUNT } from '@/types/onboarding-trainer'
import { getPreset } from './presets'

const DONE_KEY = 'v1-trainer-done'
const STOCK_URL = '/training/onboarding-stock.json'

/* ─── Stock loading ───────────────────────────────────────────────────── */

let stockCache: StockManifest | null = null

export async function loadStockManifest(
  fetcher: typeof fetch = fetch,
): Promise<StockManifest> {
  if (stockCache) return stockCache
  const res = await fetcher(STOCK_URL)
  if (!res.ok) throw new Error(`Failed to load stock manifest: ${res.status}`)
  const manifest = (await res.json()) as StockManifest
  stockCache = manifest
  return manifest
}

/** Test-only reset of the module cache */
export function __resetStockCache(): void {
  stockCache = null
}

/* ─── Sampling ────────────────────────────────────────────────────────── */

/**
 * Pick `count` photos for the trainer, evenly distributed across the
 * preset's categories. Seeded for deterministic output in tests.
 */
export function sampleTrainerPhotos(
  manifest: StockManifest,
  presetId: string,
  count: number = TRAINER_PHOTO_COUNT,
  seed: number = Date.now(),
): TrainerPhoto[] {
  const preset = getPreset(presetId)
  if (!preset) return []

  const pool = manifest.entries.filter((e) => e.preset === presetId)
  const byCategory = new Map<string, StockEntry[]>()
  for (const entry of pool) {
    const bucket = byCategory.get(entry.category) ?? []
    bucket.push(entry)
    byCategory.set(entry.category, bucket)
  }

  const categories = preset.categories
    .map((c) => c.name)
    .filter((name) => (byCategory.get(name)?.length ?? 0) > 0)

  if (categories.length === 0) return []

  const rng = mulberry32(seed)
  const perCategory = Math.max(1, Math.floor(count / categories.length))
  const picked: TrainerPhoto[] = []

  for (const category of categories) {
    const entries = shuffle(byCategory.get(category) ?? [], rng)
    for (const entry of entries.slice(0, perCategory)) {
      picked.push(toPhoto(entry))
      if (picked.length >= count) break
    }
    if (picked.length >= count) break
  }

  // Top up with extras from any category if we under-filled.
  if (picked.length < count) {
    const pickedIds = new Set(picked.map((p) => p.id))
    const extras = shuffle(pool, rng)
      .filter((e) => !pickedIds.has(stockId(e)))
      .slice(0, count - picked.length)
      .map(toPhoto)
    picked.push(...extras)
  }

  return shuffle(picked, rng).slice(0, count)
}

function stockId(e: StockEntry): string {
  return `${e.preset}:${e.pexelsId}`
}

function toPhoto(e: StockEntry): TrainerPhoto {
  return {
    id: stockId(e),
    url: e.url,
    category: e.category,
    credit: e.credit,
    creditUrl: e.creditUrl,
  }
}

/* ─── "Done" flag ─────────────────────────────────────────────────────── */

function doneStorageKey(userId: string): string {
  return `${DONE_KEY}:${userId}`
}

export function loadDonePresets(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(doneStorageKey(userId))
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function isTrainerDone(userId: string, presetId: string): boolean {
  return loadDonePresets(userId).has(presetId)
}

export function markTrainerDone(userId: string, presetId: string): void {
  if (typeof window === 'undefined') return
  const done = loadDonePresets(userId)
  done.add(presetId)
  localStorage.setItem(doneStorageKey(userId), JSON.stringify([...done]))
}

/** Test-only: clear the done flag for a user */
export function clearTrainerDone(userId: string, presetId?: string): void {
  if (typeof window === 'undefined') return
  if (!presetId) {
    localStorage.removeItem(doneStorageKey(userId))
    return
  }
  const done = loadDonePresets(userId)
  done.delete(presetId)
  localStorage.setItem(doneStorageKey(userId), JSON.stringify([...done]))
}

/* ─── Verdict helpers ─────────────────────────────────────────────────── */

export function verdictAccepted(verdict: TrainerVerdict): boolean {
  return verdict === 'keep'
}

/* ─── Small deterministic RNG / shuffle ───────────────────────────────── */

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
