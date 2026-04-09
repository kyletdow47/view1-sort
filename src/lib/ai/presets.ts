// ─── MobileNet preset system ─────────────────────────────────────────────────
// Maps MobileNet ImageNet predictions to photographer-specific categories.
// Each category has a `keywords` array of lowercase ImageNet class name
// fragments. matchPredictionToCategory sums probabilities for keyword matches.

export type PresetType = 'real_estate' | 'wedding' | 'travel' | 'general'

export interface Category {
  id: string
  label: string
  keywords: string[]
  icon: string
}

export interface CategoryPreset {
  name: string
  categories: Category[]
}

export type MatchResult = {
  category: string
  confidence: number
  allScores: Record<string, number>
}

export const PRESETS: Record<PresetType, CategoryPreset> = {
  real_estate: {
    name: 'Real Estate',
    categories: [
      {
        id: 'exterior',
        label: 'Exterior',
        icon: 'home',
        keywords: [
          'house', 'villa', 'cottage', 'mansion', 'bungalow', 'barn',
          'porch', 'balcony', 'boathouse', 'garage', 'farmhouse',
          'lakehouse', 'greenhouse', 'carport', 'picket fence',
        ],
      },
      {
        id: 'interior',
        label: 'Interior',
        icon: 'sofa',
        keywords: [
          'couch', 'sofa', 'rocking chair', 'studio couch', 'chiffonier',
          'bookcase', 'wardrobe', 'chest', 'desk', 'recliner', 'loveseat',
          'entertainment center', 'fireplace screen', 'radiator',
        ],
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        icon: 'chef-hat',
        keywords: [
          'kitchen', 'refrigerator', 'stove', 'microwave', 'dishwasher',
          'dining table', 'toaster', 'oven', 'sink', 'coffeepot', 'pot',
          'frying pan', 'spatula', 'ladle', 'kitchen sink',
        ],
      },
      {
        id: 'bathroom',
        label: 'Bathroom',
        icon: 'bath',
        keywords: [
          'bathtub', 'shower', 'toilet seat', 'toilet tissue',
          'soap dispenser', 'washbasin', 'plunger', 'toilet', 'medicine chest',
        ],
      },
      {
        id: 'drone_aerial',
        label: 'Drone / Aerial',
        icon: 'plane',
        keywords: [
          'golf course', 'dam', 'fountain', 'flagpole', 'runway',
          'solar dish', 'amphitheater', 'baseball field', 'soccer field',
          'tennis court', 'swimming pool',
        ],
      },
      {
        id: 'pool_outdoor',
        label: 'Pool / Outdoor',
        icon: 'waves',
        keywords: [
          'patio', 'umbrella', 'lounge chair', 'lawn mower', 'barbecue',
          'garden hose', 'swing', 'hammock', 'gazebo', 'deck',
          'hot tub', 'outdoor furniture', 'park bench',
        ],
      },
      {
        id: 'landscape',
        label: 'Landscape',
        icon: 'mountain',
        keywords: [
          'lawn', 'garden', 'valley', 'lakeside', 'alp', 'cliff',
          'seashore', 'corn field', 'stone wall', 'tree', 'flower garden',
          'promontory', 'sandbar',
        ],
      },
      {
        id: 'twilight',
        label: 'Twilight',
        icon: 'moon',
        keywords: [
          'street sign', 'traffic light', 'lantern', 'beacon', 'candle',
          'torch', 'spotlight', 'lamp', 'streetlight', 'neon sign',
        ],
      },
      { id: 'video', label: 'Video', icon: 'video', keywords: [] },
      { id: 'other', label: 'Other', icon: 'more-horizontal', keywords: [] },
    ],
  },

  wedding: {
    name: 'Wedding',
    categories: [
      {
        id: 'ceremony',
        label: 'Ceremony',
        icon: 'heart',
        keywords: [
          'church', 'altar', 'mosque', 'monastery', 'palace',
          'stage', 'throne', 'pew', 'chapel', 'cathedral',
        ],
      },
      {
        id: 'reception',
        label: 'Reception',
        icon: 'glass-cheers',
        keywords: [
          'banquet', 'ballroom', 'reception hall', 'dining room',
          'candelabrum', 'wine glass', 'champagne', 'goblet',
          'table lamp', 'centerpiece',
        ],
      },
      {
        id: 'portraits',
        label: 'Portraits',
        icon: 'camera',
        keywords: [
          'suit', 'bow tie', 'gown', 'veil', 'tuxedo',
          'dress', 'bouquet', 'corsage', 'wedding dress', 'bridal',
        ],
      },
      {
        id: 'getting_ready',
        label: 'Getting Ready',
        icon: 'sparkles',
        keywords: [
          'mirror', 'lipstick', 'comb', 'curling iron', 'hair spray',
          'makeup brush', 'perfume bottle', 'nail polish', 'hand mirror',
        ],
      },
      {
        id: 'details',
        label: 'Details',
        icon: 'gem',
        keywords: [
          'ring', 'necklace', 'bracelet', 'earring', 'shoe',
          'high heel', 'sandal', 'flower arrangement', 'ribbon',
        ],
      },
      {
        id: 'dance',
        label: 'Dance',
        icon: 'music',
        keywords: [
          'dance', 'dancing', 'disco', 'spotlight', 'microphone',
          'accordion', 'band', 'stage', 'loudspeaker',
        ],
      },
      {
        id: 'family',
        label: 'Family',
        icon: 'users',
        keywords: [
          'toddler', 'baby', 'child', 'stroller', 'pram',
          'playpen', 'diaper', 'bonnet',
        ],
      },
      {
        id: 'venue',
        label: 'Venue',
        icon: 'building',
        keywords: [
          'barn', 'castle', 'garden', 'vineyard', 'beach',
          'cliff', 'lakeside', 'park bench', 'pergola', 'archway',
        ],
      },
      { id: 'video', label: 'Video', icon: 'video', keywords: [] },
      { id: 'other', label: 'Other', icon: 'more-horizontal', keywords: [] },
    ],
  },

  travel: {
    name: 'Travel',
    categories: [
      {
        id: 'landmarks',
        label: 'Landmarks',
        icon: 'map-pin',
        keywords: [
          'pyramid', 'triumphal arch', 'obelisk', 'monument',
          'statue', 'tower', 'lighthouse', 'castle', 'palace', 'temple',
        ],
      },
      {
        id: 'street',
        label: 'Street',
        icon: 'map',
        keywords: [
          'street sign', 'traffic light', 'crosswalk', 'bus stop',
          'tram', 'bicycle', 'market', 'alley', 'plaza', 'sidewalk cafe',
        ],
      },
      {
        id: 'food',
        label: 'Food',
        icon: 'utensils',
        keywords: [
          'restaurant', 'plate', 'pizza', 'sushi', 'soup', 'burrito',
          'ice cream', 'bakery', 'coffee', 'espresso', 'cup',
        ],
      },
      {
        id: 'accommodation',
        label: 'Accommodation',
        icon: 'bed',
        keywords: [
          'hotel', 'resort', 'bed', 'pillow', 'duvet', 'hammock',
          'tent', 'bunk bed', 'hostel', 'villa',
        ],
      },
      {
        id: 'nature',
        label: 'Nature',
        icon: 'tree',
        keywords: [
          'mountain', 'glacier', 'valley', 'waterfall', 'ocean',
          'coral reef', 'jungle', 'rainforest', 'volcano', 'geyser',
        ],
      },
      {
        id: 'people',
        label: 'People',
        icon: 'users',
        keywords: [
          'monk', 'cowboy hat', 'sombrero', 'kimono', 'sari',
          'tribal', 'turban', 'cloak', 'uniform',
        ],
      },
      {
        id: 'transport',
        label: 'Transport',
        icon: 'plane',
        keywords: [
          'airplane', 'airport terminal', 'train', 'locomotive',
          'ferry', 'cruise ship', 'gondola', 'rickshaw', 'tuk-tuk',
        ],
      },
      {
        id: 'nightlife',
        label: 'Nightlife',
        icon: 'moon',
        keywords: [
          'neon sign', 'bar', 'cocktail shaker', 'night club',
          'lantern', 'candle', 'illuminated', 'fireworks',
        ],
      },
      { id: 'video', label: 'Video', icon: 'video', keywords: [] },
      { id: 'other', label: 'Other', icon: 'more-horizontal', keywords: [] },
    ],
  },

  general: {
    name: 'General',
    categories: [
      {
        id: 'people',
        label: 'People',
        icon: 'users',
        keywords: [
          'suit', 'lab coat', 'jersey', 'sweatshirt', 'cardigan',
          'kimono', 'sombrero', 'mortarboard', 'military uniform', 'apron',
        ],
      },
      {
        id: 'places',
        label: 'Places',
        icon: 'map-pin',
        keywords: [
          'church', 'library', 'shopping mall', 'airport terminal',
          'stadium', 'gymnasium', 'hospital', 'theater curtain',
        ],
      },
      {
        id: 'objects',
        label: 'Objects',
        icon: 'box',
        keywords: [
          'laptop', 'keyboard', 'mouse', 'remote control', 'telephone',
          'television', 'clock', 'vase', 'trophy', 'suitcase',
        ],
      },
      {
        id: 'nature',
        label: 'Nature',
        icon: 'tree',
        keywords: [
          'mountain', 'ocean', 'lake', 'forest', 'flower',
          'mushroom', 'coral reef', 'glacier', 'valley', 'tree',
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        icon: 'building',
        keywords: [
          'arch', 'dome', 'steeple', 'bridge', 'skyscraper',
          'viaduct', 'column', 'bell tower', 'amphitheater', 'monument',
        ],
      },
      {
        id: 'action',
        label: 'Action',
        icon: 'zap',
        keywords: [
          'skateboard', 'surfboard', 'snowboard', 'parachute',
          'bicycle', 'motorcycle', 'racing car', 'canoe', 'dumbbell',
        ],
      },
      {
        id: 'detail',
        label: 'Detail',
        icon: 'zoom-in',
        keywords: [
          'macro', 'feather', 'seashell', 'crystal', 'fabric',
          'honeycomb', 'web spider', 'caterpillar', 'dragonfly', 'butterfly',
        ],
      },
      { id: 'video', label: 'Video', icon: 'video', keywords: [] },
      { id: 'other', label: 'Other', icon: 'more-horizontal', keywords: [] },
    ],
  },
}

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Match MobileNet predictions to the best preset category.
 * Sums probabilities of predictions whose className contains (or is contained
 * by) a category keyword. Highest-scoring non-other/video category wins.
 * Falls back to 'other' if the best score is below `threshold`.
 */
export function matchPredictionToCategory(
  predictions: Array<{ className: string; probability: number }>,
  preset: PresetType,
  threshold = 0.1,
): MatchResult {
  if (predictions.length === 0) {
    return { category: 'other', confidence: 0, allScores: {} }
  }

  const categories = PRESETS[preset].categories
  const allScores: Record<string, number> = {}

  for (const cat of categories) {
    let score = 0
    if (cat.keywords.length > 0) {
      for (const pred of predictions) {
        const name = pred.className.toLowerCase()
        if (cat.keywords.some((kw) => name.includes(kw) || kw.includes(name))) {
          score += pred.probability
        }
      }
    }
    allScores[cat.id] = score
  }

  let bestCategory = 'other'
  let bestScore = 0
  for (const cat of categories) {
    const score = allScores[cat.id] ?? 0
    if (cat.id !== 'other' && cat.id !== 'video' && score > bestScore) {
      bestScore = score
      bestCategory = cat.id
    }
  }

  if (bestScore < threshold) {
    return { category: 'other', confidence: bestScore, allScores }
  }
  return { category: bestCategory, confidence: bestScore, allScores }
}

/** Returns the ordered list of category ids for a preset. */
export function getPresetCategories(preset: PresetType): string[] {
  return PRESETS[preset].categories.map((c) => c.id)
}

// ─── Backward-compat shims (used by existing pages) ──────────────────────────

export interface SortCategory {
  name: string
  description?: string
  labels: string[]
  priority: number
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

function presetTypeToSortPreset(type: PresetType): SortPreset {
  const preset = PRESETS[type]
  return {
    id: type,
    name: preset.name,
    niche: type,
    description: `${preset.name} photography preset`,
    icon: '📷',
    builtIn: true,
    rejectCriteria: ['blurry', 'duplicate'],
    categories: preset.categories.map((c, i) => ({
      name: c.label,
      labels: c.keywords,
      priority: i + 1,
    })),
  }
}

export const BUILT_IN_PRESETS: SortPreset[] = (
  ['real_estate', 'wedding', 'travel', 'general'] as PresetType[]
).map(presetTypeToSortPreset)

export function getPreset(id: string): SortPreset | undefined {
  return [...BUILT_IN_PRESETS, ...getCustomPresets()].find((p) => p.id === id)
}

export function getAllLabels(preset: SortPreset): string[] {
  return preset.categories.flatMap((c) => c.labels)
}

export function getCategoryForLabel(preset: SortPreset, label: string): string | undefined {
  for (const cat of preset.categories) {
    if (
      cat.labels.some(
        (l) =>
          label.toLowerCase().includes(l.toLowerCase()) ||
          l.toLowerCase().includes(label.toLowerCase()),
      )
    ) {
      return cat.name
    }
  }
  return undefined
}

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

export function getAllPresets(): SortPreset[] {
  return [...BUILT_IN_PRESETS, ...getCustomPresets()]
}
