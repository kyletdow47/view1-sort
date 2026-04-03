/** Types for the AI Sort Workspace Tab — sorting controls and configuration */

export type SortAlgorithm = 'category-quality' | 'quality-category' | 'chronological'

export interface SortAlgorithmOption {
  id: SortAlgorithm
  label: string
  description: string
}

export const SORT_ALGORITHMS: SortAlgorithmOption[] = [
  {
    id: 'category-quality',
    label: 'Category → Quality',
    description: 'Sort by category first, then rank by quality within each',
  },
  {
    id: 'quality-category',
    label: 'Quality → Category',
    description: 'Sort by quality score first, then group by category',
  },
  {
    id: 'chronological',
    label: 'Chronological',
    description: 'Sort by timestamp within each category',
  },
] as const

export interface CategoryMapping {
  id: string
  aiLabel: string
  displayCategory: string
  enabled: boolean
}

export interface QualityDistribution {
  high: number   // 90+
  medium: number  // 70-89
  low: number     // <70
}

export interface AISortSettings {
  confidenceThreshold: number
  sortAlgorithm: SortAlgorithm
  duplicateDetection: boolean
  blurDetection: boolean
  categoryMappings: CategoryMapping[]
}

export const DEFAULT_AI_SORT_SETTINGS: AISortSettings = {
  confidenceThreshold: 70,
  sortAlgorithm: 'category-quality',
  duplicateDetection: true,
  blurDetection: true,
  categoryMappings: [
    { id: 'ceremony', aiLabel: 'ceremony', displayCategory: 'Ceremony', enabled: true },
    { id: 'portraits', aiLabel: 'portraits', displayCategory: 'Portraits', enabled: true },
    { id: 'reception', aiLabel: 'reception', displayCategory: 'Reception', enabled: true },
    { id: 'details', aiLabel: 'details', displayCategory: 'Details', enabled: true },
  ],
}
