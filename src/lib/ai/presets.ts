import type { VibePreset, VibeStyleParams } from '@/types/vibe-presets'
import type { VibePresetRow } from '@/types/supabase'

export interface SortCategory {
  name: string
  description?: string
  labels: string[] // Zero-shot labels fed to the classifier
  priority: number // Lower = sorted first in gallery
}

export interface SortPreset {
  id: string
  name: string
  niche: string
  description: string
  categories: SortCategory[]
  rejectCriteria: string[]
  builtIn: boolean
  icon: string
}

/* ── 6 built-in presets ─────────────────────────────────────────────── */

export const BUILT_IN_PRESETS: SortPreset[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    niche: 'wedding',
    description: 'Full wedding day coverage from getting ready to reception.',
    icon: '💍',
    builtIn: true,
    rejectCriteria: ['blurry', 'closed eyes', 'duplicate', 'accidental'],
    categories: [
      { name: 'Getting Ready', labels: ['bride getting ready', 'groom getting ready', 'wedding preparations', 'bridal suite', 'dressing for wedding'], priority: 1 },
      { name: 'Ceremony', labels: ['wedding ceremony', 'bride walking down aisle', 'vows exchange', 'wedding rings ceremony', 'church wedding'], priority: 2 },
      { name: 'First Look', labels: ['first look wedding', 'bride and groom first reveal', 'emotional wedding moment'], priority: 3 },
      { name: 'Portraits', labels: ['wedding couple portrait', 'bride and groom portrait', 'formal wedding portrait', 'wedding photography'], priority: 4 },
      { name: 'Family', labels: ['family wedding photo', 'group wedding portrait', 'wedding family formals'], priority: 5 },
      { name: 'Reception', labels: ['wedding reception', 'first dance wedding', 'wedding dinner', 'cutting the cake', 'wedding dance floor'], priority: 6 },
      { name: 'Details', labels: ['wedding ring detail', 'wedding dress detail', 'bouquet flowers', 'wedding decoration', 'wedding cake'], priority: 7 },
      { name: 'Candids', labels: ['candid wedding moment', 'emotional wedding', 'laughter wedding', 'spontaneous wedding photo'], priority: 8 },
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    niche: 'real_estate',
    description: 'Property photography organized by space and angle.',
    icon: '🏠',
    builtIn: true,
    rejectCriteria: ['blurry', 'duplicate', 'incorrect exposure'],
    categories: [
      { name: 'Exterior Hero', labels: ['house exterior front', 'property facade', 'curb appeal photo', 'home front view'], priority: 1 },
      { name: 'Aerial / Drone', labels: ['aerial property photo', 'drone real estate', 'bird eye view house'], priority: 2 },
      { name: 'Living Areas', labels: ['living room interior', 'family room', 'open plan living space', 'great room'], priority: 3 },
      { name: 'Kitchen', labels: ['kitchen interior', 'modern kitchen', 'kitchen countertop', 'kitchen appliances'], priority: 4 },
      { name: 'Bedrooms', labels: ['bedroom interior', 'master bedroom', 'guest bedroom'], priority: 5 },
      { name: 'Bathrooms', labels: ['bathroom interior', 'master bathroom', 'modern bathroom'], priority: 6 },
      { name: 'Backyard / Outdoor', labels: ['backyard patio', 'pool area', 'garden', 'outdoor living space'], priority: 7 },
      { name: 'Twilight / Dusk', labels: ['twilight real estate photo', 'dusk property photo', 'golden hour house'], priority: 8 },
      { name: 'Detail Textures', labels: ['architectural detail', 'material texture', 'interior detail closeup'], priority: 9 },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial',
    niche: 'commercial',
    description: 'Brand and product photography for commercial clients.',
    icon: '📦',
    builtIn: true,
    rejectCriteria: ['blurry', 'incorrect color', 'duplicate', 'test shot'],
    categories: [
      { name: 'Hero Shots', labels: ['product hero shot', 'main campaign photo', 'key visual commercial', 'brand hero image'], priority: 1 },
      { name: 'Lifestyle', labels: ['lifestyle product photo', 'product in use', 'brand lifestyle photography', 'commercial lifestyle'], priority: 2 },
      { name: 'Product Detail', labels: ['product detail closeup', 'product texture', 'product packaging detail', 'macro product shot'], priority: 3 },
      { name: 'Behind the Scenes', labels: ['behind the scenes photography', 'production making of', 'bts photo'], priority: 4 },
      { name: 'Team / People', labels: ['brand ambassador photo', 'people with product', 'model with product'], priority: 5 },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Portrait',
    niche: 'fashion',
    description: 'Editorial fashion, portrait, and beauty photography.',
    icon: '👗',
    builtIn: true,
    rejectCriteria: ['blurry', 'closed eyes', 'blink', 'unflattering expression'],
    categories: [
      { name: 'Editorial', labels: ['fashion editorial', 'high fashion photo', 'editorial portrait', 'vogue style photo'], priority: 1 },
      { name: 'Portraits', labels: ['portrait photography', 'headshot', 'face portrait', 'close-up portrait'], priority: 2 },
      { name: 'Full Length', labels: ['full body fashion photo', 'full length portrait', 'outfit flat lay standing'], priority: 3 },
      { name: 'Detail', labels: ['clothing detail', 'accessory detail', 'fabric texture closeup', 'jewelry closeup'], priority: 4 },
      { name: 'Movement', labels: ['movement fashion photo', 'dynamic pose', 'action fashion', 'flowing dress movement'], priority: 5 },
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Lifestyle',
    niche: 'travel',
    description: 'Travel, lifestyle, and influencer content creation.',
    icon: '✈️',
    builtIn: true,
    rejectCriteria: ['blurry', 'duplicate', 'overexposed sky'],
    categories: [
      { name: 'Landscape', labels: ['travel landscape', 'scenic nature photo', 'mountain landscape', 'ocean landscape', 'destination landscape'], priority: 1 },
      { name: 'Architecture', labels: ['travel architecture', 'building exterior travel', 'city architecture', 'iconic landmark'], priority: 2 },
      { name: 'Street', labels: ['street photography travel', 'market scene', 'city street photo', 'local culture photo'], priority: 3 },
      { name: 'People & Culture', labels: ['local people portrait', 'cultural portrait', 'travel portrait', 'community photo'], priority: 4 },
      { name: 'Food', labels: ['food photography travel', 'restaurant food photo', 'local cuisine', 'street food'], priority: 5 },
      { name: 'Adventure', labels: ['adventure travel photo', 'hiking photo', 'outdoor adventure', 'extreme sport travel'], priority: 6 },
      { name: 'Accommodation', labels: ['hotel room photo', 'resort accommodation', 'travel accommodation'], priority: 7 },
    ],
  },
  {
    id: 'event',
    name: 'Event',
    niche: 'event',
    description: 'Corporate events, conferences, concerts, and gatherings.',
    icon: '🎤',
    builtIn: true,
    rejectCriteria: ['blurry', 'closed eyes', 'duplicate', 'empty stage'],
    categories: [
      { name: 'Keynote / Stage', labels: ['keynote speaker photo', 'stage presentation', 'conference speaker', 'event stage'], priority: 1 },
      { name: 'Audience', labels: ['conference audience', 'crowd at event', 'people watching presentation', 'audience engagement'], priority: 2 },
      { name: 'Networking', labels: ['networking event photo', 'business conversation', 'people talking event', 'event networking'], priority: 3 },
      { name: 'Awards', labels: ['award ceremony', 'trophy presentation', 'award winner photo', 'recognition ceremony'], priority: 4 },
      { name: 'Venue', labels: ['event venue photo', 'conference room setup', 'event space decoration', 'venue details'], priority: 5 },
      { name: 'Exhibition / Booths', labels: ['trade show booth', 'exhibition stand', 'product demonstration event'], priority: 6 },
    ],
  },
]

export function getPreset(id: string): SortPreset | undefined {
  return BUILT_IN_PRESETS.find((p) => p.id === id)
}

export function getAllLabels(preset: SortPreset): string[] {
  return preset.categories.flatMap((c) => c.labels)
}

export function getCategoryForLabel(preset: SortPreset, label: string): string | undefined {
  for (const cat of preset.categories) {
    if (cat.labels.some((l) => label.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(label.toLowerCase()))) {
      return cat.name
    }
  }
  return undefined
}

/* ── localStorage fallback (anonymous / offline) ──────────────────────── */

/** Persist custom presets to localStorage */
export function saveCustomPreset(preset: SortPreset): void {
  if (typeof window === 'undefined') return
  const stored = getCustomPresets()
  const existing = stored.findIndex((p) => p.id === preset.id)
  if (existing >= 0) stored[existing] = preset
  else stored.push(preset)
  localStorage.setItem('v1-presets', JSON.stringify(stored))
}

export function getCustomPresets(): SortPreset[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('v1-presets') ?? '[]') as SortPreset[]
  } catch {
    return []
  }
}

export function deleteCustomPreset(id: string): void {
  if (typeof window === 'undefined') return
  const stored = getCustomPresets().filter((p) => p.id !== id)
  localStorage.setItem('v1-presets', JSON.stringify(stored))
}

export function getAllPresets(): SortPreset[] {
  return [...BUILT_IN_PRESETS, ...getCustomPresets()]
}

/* ── Supabase-backed CRUD (authenticated users) ──────────────────────── */

/** Convert a DB row to the client-side VibePreset shape */
export function rowToVibePreset(row: VibePresetRow): VibePreset {
  const sp = row.style_params as Record<string, unknown>
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    styleParams: {
      mood: (sp.mood as string) ?? '',
      lighting: (sp.lighting as string) ?? '',
      composition: (sp.composition as string) ?? '',
      colorTemp: (sp.colorTemp as VibeStyleParams['colorTemp']) ?? 'neutral',
      subjects: (sp.subjects as string[]) ?? [],
      avoidPatterns: (sp.avoidPatterns as string[]) ?? [],
    },
    createdAt: row.created_at,
    isActive: row.is_active,
  }
}

export async function fetchPresetsFromAPI(): Promise<VibePreset[]> {
  const res = await fetch('/api/presets')
  if (!res.ok) return []
  const { presets } = (await res.json()) as { presets: VibePresetRow[] }
  return presets.map(rowToVibePreset)
}

export async function savePresetToAPI(preset: {
  name: string
  description: string
  styleParams: VibeStyleParams
  projectId?: string
  source?: 'custom' | 'ai_parsed'
}): Promise<VibePreset | null> {
  const res = await fetch('/api/presets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preset),
  })
  if (!res.ok) return null
  const { preset: row } = (await res.json()) as { preset: VibePresetRow }
  return rowToVibePreset(row)
}

export async function updatePresetInAPI(update: {
  id: string
  name?: string
  description?: string
  styleParams?: VibeStyleParams
  isActive?: boolean
}): Promise<VibePreset | null> {
  const res = await fetch('/api/presets', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
  if (!res.ok) return null
  const { preset: row } = (await res.json()) as { preset: VibePresetRow }
  return rowToVibePreset(row)
}

export async function deletePresetFromAPI(id: string): Promise<boolean> {
  const res = await fetch(`/api/presets?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return res.ok
}
