/** Types for the AI Sort Vibe Presets tab */

export interface VibeStyleParams {
  mood: string
  lighting: string
  composition: string
  colorTemp: 'warm' | 'neutral' | 'cool'
  subjects: string[]
  avoidPatterns: string[]
}

export interface VibePreset {
  id: string
  name: string
  description: string
  styleParams: VibeStyleParams
  createdAt: string
  isActive?: boolean
}

export interface ParseVibeRequest {
  description: string
  projectId?: string
}

export interface ParseVibeResponse {
  styleParams: VibeStyleParams
  presetName: string
  confidence?: number
  source?: 'claude' | 'heuristic'
}

export const EXAMPLE_PROMPTS = [
  'I love moody, dramatic shots with deep shadows and rich contrast',
  'I prefer bright and airy with lots of negative space and soft light',
  'Editorial magazine style with tight crops on details and texture',
] as const

export type ExamplePrompt = (typeof EXAMPLE_PROMPTS)[number]

export const MOCK_PRESETS: VibePreset[] = [
  {
    id: 'preset-1',
    name: 'Moody Editorial',
    description:
      'Dark, dramatic shots with deep shadows and strong contrast. Focus on emotion and texture.',
    styleParams: {
      mood: 'dramatic',
      lighting: 'low-key',
      composition: 'tight',
      colorTemp: 'cool',
      subjects: ['faces', 'details'],
      avoidPatterns: ['overexposed', 'flat lighting'],
    },
    createdAt: '2026-04-01T10:00:00Z',
    isActive: true,
  },
  {
    id: 'preset-2',
    name: 'Bright & Airy',
    description: 'Clean, light-filled images with soft tones and plenty of breathing room.',
    styleParams: {
      mood: 'joyful',
      lighting: 'high-key',
      composition: 'wide',
      colorTemp: 'warm',
      subjects: ['faces', 'scenery'],
      avoidPatterns: ['harsh shadows', 'underexposed'],
    },
    createdAt: '2026-04-02T14:30:00Z',
  },
]
