export type PhotoCategory =
  | 'portrait'
  | 'landscape'
  | 'event'
  | 'detail'
  | 'group'
  | 'candid'
  | 'architecture'
  | 'food'
  | 'product'
  | 'action'
  | 'other'

export interface LabelDefinition {
  label: string
  category: PhotoCategory
}

/**
 * Base label taxonomy for zero-shot image classification.
 *
 * Each label is a SigLIP-optimized descriptive sentence fragment.
 * SigLIP performs best when labels describe what the image looks like
 * rather than using bare noun phrases.
 *
 * These labels are genre-neutral and cover the broad spectrum of
 * professional photography: people, places, objects, food, products,
 * events, architecture, and action.
 */
export const PHOTOGRAPHY_LABELS: LabelDefinition[] = [
  // ── Portrait ───────────────────────────────────────────────────────
  { label: 'a close-up portrait photograph of a person looking at the camera', category: 'portrait' },
  { label: 'a full-body portrait of a person posing outdoors', category: 'portrait' },
  { label: 'a photograph of a couple posing together for a portrait', category: 'portrait' },
  { label: 'a professional headshot photograph with studio lighting', category: 'portrait' },
  { label: 'a photograph of a child or baby posing for a portrait', category: 'portrait' },

  // ── Group ──────────────────────────────────────────────────────────
  { label: 'a photograph of a small group of people posing together', category: 'group' },
  { label: 'a photograph of a large group of people gathered together', category: 'group' },
  { label: 'a photograph of a family posing together for a group portrait', category: 'group' },
  { label: 'a photograph of a bridal party or wedding party group', category: 'group' },

  // ── Candid ─────────────────────────────────────────────────────────
  { label: 'a candid photograph of a person laughing or smiling naturally', category: 'candid' },
  { label: 'a candid photograph capturing an emotional reaction or tears', category: 'candid' },
  { label: 'a candid photograph of people interacting and talking', category: 'candid' },
  { label: 'a candid photograph of a person in motion or walking', category: 'candid' },
  { label: 'a candid photograph of people dancing together', category: 'candid' },

  // ── Event ──────────────────────────────────────────────────────────
  { label: 'a photograph of a wedding ceremony at an altar or arch', category: 'event' },
  { label: 'a photograph of a party or celebration with guests', category: 'event' },
  { label: 'a photograph of a speaker presenting on stage at an event', category: 'event' },
  { label: 'a photograph of a toast or speech being given at a dinner', category: 'event' },
  { label: 'a photograph of a cake cutting or special moment at a celebration', category: 'event' },
  { label: 'a photograph of a first dance at a wedding or formal event', category: 'event' },
  { label: 'a photograph of a crowd or audience watching a performance', category: 'event' },
  { label: 'a photograph of people networking at a conference or business event', category: 'event' },

  // ── Landscape ──────────────────────────────────────────────────────
  { label: 'a scenic landscape photograph of mountains, fields, or nature', category: 'landscape' },
  { label: 'a photograph of a sunset or golden hour sky over a landscape', category: 'landscape' },
  { label: 'a photograph of an ocean, lake, or waterfront scene', category: 'landscape' },
  { label: 'a photograph of a cityscape or urban skyline', category: 'landscape' },
  { label: 'an aerial or drone photograph looking down on a landscape', category: 'landscape' },

  // ── Architecture ───────────────────────────────────────────────────
  { label: 'a photograph of the exterior of a building or structure', category: 'architecture' },
  { label: 'a photograph of a room interior with furniture and decor', category: 'architecture' },
  { label: 'a photograph of a kitchen interior with countertops and appliances', category: 'architecture' },
  { label: 'a photograph of a bathroom interior with fixtures', category: 'architecture' },
  { label: 'a photograph of a bedroom interior with a bed', category: 'architecture' },
  { label: 'a photograph of a living room or lounge interior', category: 'architecture' },
  { label: 'a photograph of architectural details like stairs, doors, or windows', category: 'architecture' },

  // ── Detail ─────────────────────────────────────────────────────────
  { label: 'a close-up detail photograph of jewelry, rings, or accessories', category: 'detail' },
  { label: 'a close-up photograph of flowers or a floral arrangement', category: 'detail' },
  { label: 'a close-up photograph of table settings, decorations, or centerpieces', category: 'detail' },
  { label: 'a close-up photograph of textures, fabrics, or materials', category: 'detail' },
  { label: 'a flat lay photograph of objects arranged on a surface', category: 'detail' },
  { label: 'a close-up photograph of signage, stationery, or printed materials', category: 'detail' },

  // ── Food ───────────────────────────────────────────────────────────
  { label: 'a photograph of a plated dish of food at a restaurant', category: 'food' },
  { label: 'a photograph of drinks, cocktails, or beverages', category: 'food' },
  { label: 'a photograph of a decorated cake or dessert', category: 'food' },
  { label: 'a photograph of a buffet, spread, or catering setup', category: 'food' },

  // ── Product ────────────────────────────────────────────────────────
  { label: 'a product photograph of an item on a clean background', category: 'product' },
  { label: 'a lifestyle photograph of a product being used by a person', category: 'product' },
  { label: 'a photograph of product packaging or branding materials', category: 'product' },

  // ── Action ─────────────────────────────────────────────────────────
  { label: 'a photograph of a person playing sports or exercising', category: 'action' },
  { label: 'a photograph capturing fast motion or movement blur', category: 'action' },
  { label: 'a photograph of a live music performance or concert', category: 'action' },
]

export const LABEL_STRINGS: string[] = PHOTOGRAPHY_LABELS.map((l) => l.label)

/**
 * SigLIP-optimized broad category prompts for coarse-level classification.
 * Used by hierarchical classification (first pass) to quickly bucket images.
 */
export const BROAD_CATEGORY_PROMPTS: Record<PhotoCategory, string> = {
  portrait: 'a photograph of a person posing for a portrait',
  landscape: 'a scenic landscape or nature photograph',
  event: 'a photograph of an event, ceremony, or celebration',
  detail: 'a close-up detail or macro photograph of an object',
  group: 'a photograph of a group of people together',
  candid: 'a candid photograph of people in a natural unposed moment',
  architecture: 'a photograph of a building interior or exterior',
  food: 'a photograph of food, drinks, or a dining setup',
  product: 'a product photograph or commercial still life',
  action: 'a photograph of sports, motion, or a live performance',
  other: 'a miscellaneous photograph',
}

export function getCategoryForLabel(label: string): PhotoCategory {
  return PHOTOGRAPHY_LABELS.find((l) => l.label === label)?.category ?? 'other'
}

/**
 * Get the label strings for a specific preset, or fall back to the base taxonomy.
 *
 * NOTE: This lives here (not in presets.ts) so callers can import from labels.ts
 * without pulling in the full presets module. The dynamic import avoids a circular
 * dependency since presets.ts imports from labels.ts at the top level.
 */
export async function getLabelsForPreset(presetId: string | null): Promise<string[]> {
  if (!presetId) return LABEL_STRINGS

  const { getPresetLabelDefinitions, getPreset } = await import('./presets')
  const preset = getPreset(presetId)
  if (!preset) return LABEL_STRINGS

  const defs = getPresetLabelDefinitions(preset)
  return defs.map((d: LabelDefinition) => d.label)
}
