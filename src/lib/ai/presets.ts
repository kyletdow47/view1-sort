import type { LabelDefinition, PhotoCategory } from './labels'

export interface SortCategory {
  name: string
  description?: string
  labels: string[] // SigLIP-optimized sentence labels fed to the classifier
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
      {
        name: 'Getting Ready',
        labels: [
          'a photograph of a bride getting ready and putting on a dress',
          'a photograph of a groom getting dressed and preparing for a wedding',
          'a photograph of wedding preparations in a bridal suite',
          'a photograph of bridesmaids helping the bride get ready',
          'a photograph of makeup or hair styling before a wedding',
        ],
        priority: 1,
      },
      {
        name: 'Ceremony',
        labels: [
          'a photograph of a wedding ceremony at an altar or arch',
          'a photograph of a bride walking down the aisle',
          'a photograph of a couple exchanging wedding vows',
          'a photograph of a ring exchange during a wedding ceremony',
          'a photograph of a wedding kiss at the altar',
        ],
        priority: 2,
      },
      {
        name: 'First Look',
        labels: [
          'a photograph of a bride and groom seeing each other for the first time',
          'a photograph of an emotional first look reveal at a wedding',
          'a photograph of a couple reacting during their first look moment',
        ],
        priority: 3,
      },
      {
        name: 'Portraits',
        labels: [
          'a photograph of a bride and groom posing together for a portrait',
          'a formal wedding portrait of the couple outdoors',
          'a photograph of a bride posing alone in her wedding dress',
          'a photograph of a groom posing alone in a suit',
        ],
        priority: 4,
      },
      {
        name: 'Family',
        labels: [
          'a photograph of a family group posing at a wedding',
          'a photograph of the wedding party posing for a formal group shot',
          'a photograph of parents with the bride or groom at a wedding',
        ],
        priority: 5,
      },
      {
        name: 'Reception',
        labels: [
          'a photograph of a wedding reception dinner with tables and guests',
          'a photograph of a first dance at a wedding reception',
          'a photograph of guests dancing at a wedding party',
          'a photograph of a cake cutting at a wedding reception',
          'a photograph of a toast or speech being given at a wedding dinner',
        ],
        priority: 6,
      },
      {
        name: 'Details',
        labels: [
          'a close-up photograph of wedding rings on a surface',
          'a close-up photograph of a wedding dress or veil detail',
          'a photograph of a wedding bouquet or floral arrangement',
          'a photograph of wedding table decorations and centerpieces',
          'a photograph of a wedding cake or dessert display',
          'a photograph of wedding stationery, invitations, or signage',
        ],
        priority: 7,
      },
      {
        name: 'Candids',
        labels: [
          'a candid photograph of wedding guests laughing together',
          'a candid photograph capturing emotional tears at a wedding',
          'a candid photograph of spontaneous fun moments at a wedding',
          'a candid photograph of the couple in an unposed natural moment',
        ],
        priority: 8,
      },
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
      {
        name: 'Exterior Hero',
        labels: [
          'a photograph of the front exterior of a house or property',
          'a photograph showing curb appeal and the front facade of a home',
          'a wide-angle photograph of a property from the street',
        ],
        priority: 1,
      },
      {
        name: 'Aerial / Drone',
        labels: [
          'an aerial drone photograph looking down on a property',
          'a bird\'s eye view photograph of a house and its surrounding lot',
          'a drone photograph showing a property from above',
        ],
        priority: 2,
      },
      {
        name: 'Living Areas',
        labels: [
          'a photograph of a living room interior with furniture',
          'a photograph of a family room or great room interior',
          'a photograph of an open plan living space',
        ],
        priority: 3,
      },
      {
        name: 'Kitchen',
        labels: [
          'a photograph of a kitchen interior with countertops and cabinets',
          'a photograph of a modern kitchen with appliances and island',
          'a photograph of a kitchen dining area',
        ],
        priority: 4,
      },
      {
        name: 'Bedrooms',
        labels: [
          'a photograph of a bedroom interior with a bed',
          'a photograph of a master bedroom suite',
          'a photograph of a guest bedroom or children\'s room',
        ],
        priority: 5,
      },
      {
        name: 'Bathrooms',
        labels: [
          'a photograph of a bathroom interior with vanity and fixtures',
          'a photograph of a modern bathroom with shower or bathtub',
          'a photograph of a master bathroom suite',
        ],
        priority: 6,
      },
      {
        name: 'Backyard / Outdoor',
        labels: [
          'a photograph of a backyard patio or deck area',
          'a photograph of a swimming pool and outdoor living space',
          'a photograph of a garden, lawn, or landscaped yard',
        ],
        priority: 7,
      },
      {
        name: 'Twilight / Dusk',
        labels: [
          'a twilight photograph of a house exterior at dusk with lights on',
          'a golden hour photograph of a property at sunset',
          'a photograph of a house glowing with warm light at dusk',
        ],
        priority: 8,
      },
      {
        name: 'Detail Textures',
        labels: [
          'a close-up photograph of architectural details like molding or trim',
          'a close-up photograph of interior materials, countertops, or fixtures',
          'a close-up photograph of flooring, tile, or woodwork detail',
        ],
        priority: 9,
      },
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
      {
        name: 'Hero Shots',
        labels: [
          'a product hero photograph on a clean or styled background',
          'a key visual or campaign photograph for commercial branding',
          'a dramatic product photograph with professional lighting',
        ],
        priority: 1,
      },
      {
        name: 'Lifestyle',
        labels: [
          'a lifestyle photograph of a product being used by a person',
          'a photograph of a person interacting with a product in context',
          'a styled commercial lifestyle photograph in a natural setting',
        ],
        priority: 2,
      },
      {
        name: 'Product Detail',
        labels: [
          'a close-up photograph of product details and textures',
          'a macro photograph showing product craftsmanship or materials',
          'a photograph of product packaging and branding design',
        ],
        priority: 3,
      },
      {
        name: 'Behind the Scenes',
        labels: [
          'a behind-the-scenes photograph of a photo shoot in progress',
          'a photograph of production equipment and studio setup',
          'a candid photograph of the creative team working on set',
        ],
        priority: 4,
      },
      {
        name: 'Team / People',
        labels: [
          'a photograph of a brand ambassador or model with a product',
          'a professional team or corporate headshot photograph',
          'a photograph of people at a brand event or product launch',
        ],
        priority: 5,
      },
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
      {
        name: 'Editorial',
        labels: [
          'a high fashion editorial photograph with dramatic styling',
          'a magazine-style fashion photograph with creative composition',
          'an artistic fashion portrait with bold lighting and poses',
        ],
        priority: 1,
      },
      {
        name: 'Portraits',
        labels: [
          'a close-up beauty portrait photograph of a person\'s face',
          'a professional headshot photograph with studio lighting',
          'a portrait photograph with shallow depth of field',
        ],
        priority: 2,
      },
      {
        name: 'Full Length',
        labels: [
          'a full-body fashion photograph showing the complete outfit',
          'a full-length portrait of a model standing or walking',
          'a photograph of a person showing head-to-toe clothing and styling',
        ],
        priority: 3,
      },
      {
        name: 'Detail',
        labels: [
          'a close-up photograph of clothing details or fabric texture',
          'a close-up photograph of accessories, jewelry, or shoes',
          'a detail photograph of fashion craftsmanship or embellishment',
        ],
        priority: 4,
      },
      {
        name: 'Movement',
        labels: [
          'a fashion photograph capturing dynamic motion and movement',
          'a photograph of flowing fabric or hair in motion',
          'a dynamic action photograph of a model jumping or spinning',
        ],
        priority: 5,
      },
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
      {
        name: 'Landscape',
        labels: [
          'a scenic travel landscape photograph of mountains or nature',
          'a photograph of an ocean, beach, or tropical destination',
          'a dramatic landscape photograph at golden hour or blue hour',
        ],
        priority: 1,
      },
      {
        name: 'Architecture',
        labels: [
          'a photograph of iconic architecture or a famous landmark',
          'a photograph of a city street with buildings and urban scenery',
          'a photograph of a historic building, temple, or monument',
        ],
        priority: 2,
      },
      {
        name: 'Street',
        labels: [
          'a street photography photograph of daily life in a city',
          'a photograph of a market, bazaar, or local street scene',
          'a photograph capturing the atmosphere of a foreign street',
        ],
        priority: 3,
      },
      {
        name: 'People & Culture',
        labels: [
          'a portrait photograph of a local person in traditional attire',
          'a photograph of people engaged in cultural activities or customs',
          'a travel portrait of a person in a scenic location',
        ],
        priority: 4,
      },
      {
        name: 'Food',
        labels: [
          'a photograph of local food or cuisine at a restaurant',
          'a photograph of street food or a food market',
          'a photograph of a person eating or drinking at a cafe',
        ],
        priority: 5,
      },
      {
        name: 'Adventure',
        labels: [
          'a photograph of a person hiking, climbing, or on an outdoor adventure',
          'a photograph of an extreme sport or adventure activity',
          'a photograph of a person exploring a natural landscape',
        ],
        priority: 6,
      },
      {
        name: 'Accommodation',
        labels: [
          'a photograph of a hotel room or resort accommodation interior',
          'a photograph of a luxury resort or boutique hotel exterior',
          'a photograph of a unique accommodation like a cabin or treehouse',
        ],
        priority: 7,
      },
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
      {
        name: 'Keynote / Stage',
        labels: [
          'a photograph of a keynote speaker presenting on a stage',
          'a photograph of a conference presentation with slides visible',
          'a photograph of a performer or speaker at a podium',
        ],
        priority: 1,
      },
      {
        name: 'Audience',
        labels: [
          'a photograph of a conference audience watching a presentation',
          'a photograph of a crowd at an event or concert',
          'a photograph of people engaged and taking notes at a talk',
        ],
        priority: 2,
      },
      {
        name: 'Networking',
        labels: [
          'a photograph of people networking and talking at an event',
          'a photograph of a business conversation between professionals',
          'a photograph of people socializing at a corporate reception',
        ],
        priority: 3,
      },
      {
        name: 'Awards',
        labels: [
          'a photograph of an award ceremony with a trophy presentation',
          'a photograph of a person receiving an award on stage',
          'a photograph of a recognition or achievement ceremony',
        ],
        priority: 4,
      },
      {
        name: 'Venue',
        labels: [
          'a photograph of an event venue setup before guests arrive',
          'a photograph of a conference room with tables and chairs arranged',
          'a photograph of event decorations, signage, or branding displays',
        ],
        priority: 5,
      },
      {
        name: 'Exhibition / Booths',
        labels: [
          'a photograph of a trade show booth or exhibition stand',
          'a photograph of a product demonstration at an event',
          'a photograph of people visiting exhibition displays',
        ],
        priority: 6,
      },
    ],
  },
]

export function getPreset(id: string): SortPreset | undefined {
  return BUILT_IN_PRESETS.find((p) => p.id === id)
}

export function getAllLabels(preset: SortPreset): string[] {
  return preset.categories.flatMap((c) => c.labels)
}

/**
 * Convert a preset's categories into LabelDefinition[] for the classifier.
 * Each category name becomes the PhotoCategory-compatible label used for grouping.
 */
export function getPresetLabelDefinitions(preset: SortPreset): LabelDefinition[] {
  const defs: LabelDefinition[] = []
  for (const cat of preset.categories) {
    for (const label of cat.labels) {
      defs.push({ label, category: cat.name.toLowerCase() as PhotoCategory })
    }
  }
  return defs
}

export function getCategoryForLabel(preset: SortPreset, label: string): string | undefined {
  const lower = label.toLowerCase()
  for (const cat of preset.categories) {
    if (cat.labels.some((l) => lower.includes(l.toLowerCase()) || l.toLowerCase().includes(lower))) {
      return cat.name
    }
  }
  return undefined
}

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

export function getAllPresets(): SortPreset[] {
  return [...BUILT_IN_PRESETS, ...getCustomPresets()]
}
