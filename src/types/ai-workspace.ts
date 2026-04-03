/** Types for the AI Workspace — Project Detail page */

export type WorkspaceTab = 'ai-sort' | 'review' | 'shot-list' | 'gallery' | 'client' | 'details'

export type AISortSubTab = 'upload' | 'workspace' | 'preferences' | 'vibe-presets'

export interface WorkspaceTabConfig {
  id: WorkspaceTab
  label: string
  icon: string
}

export interface AISortSubTabConfig {
  id: AISortSubTab
  label: string
}

export interface CategoryColumn {
  id: string
  name: string
  photoCount: number
  color: string
}

export interface AIAnalysisResult {
  qualityConfidence: number
  flaggedIssues: string[]
  duplicateCount: number
  blurryCount: number
  overexposedCount: number
}

export interface CullSettings {
  keepCount: number
  totalCount: number
  aiRecommendation: number
}

export interface SelectionAction {
  id: string
  label: string
  icon: string
  variant?: 'danger' | 'default'
}

export const WORKSPACE_TABS: WorkspaceTabConfig[] = [
  { id: 'ai-sort', label: 'AI Sort', icon: 'sparkles' },
  { id: 'review', label: 'Review', icon: 'eye' },
  { id: 'shot-list', label: 'Shot List', icon: 'list-checks' },
  { id: 'gallery', label: 'Gallery', icon: 'image' },
  { id: 'client', label: 'Client', icon: 'user' },
  { id: 'details', label: 'Details', icon: 'file-text' },
] as const

export const AI_SORT_SUB_TABS: AISortSubTabConfig[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'vibe-presets', label: 'Vibe Presets' },
] as const

export const DEFAULT_CATEGORIES: CategoryColumn[] = [
  { id: 'ceremony', name: 'Ceremony', photoCount: 0, color: '#F59E0B' },
  { id: 'portraits', name: 'Portraits', photoCount: 0, color: '#3B82F6' },
  { id: 'reception', name: 'Reception', photoCount: 0, color: '#A855F7' },
  { id: 'details', name: 'Details', photoCount: 0, color: '#EC4899' },
] as const

/** Status enum from ARCHITECTURE-DECISIONS.md */
export type ProjectStatus =
  | 'inquiry'
  | 'quoted'
  | 'booked'
  | 'contracted'
  | 'prepped'
  | 'shooting'
  | 'processing'
  | 'review'
  | 'gallery_live'
  | 'delivered'

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  inquiry: { label: 'Inquiry', color: '#94A3B8' },
  quoted: { label: 'Quoted', color: '#60A5FA' },
  booked: { label: 'Booked', color: '#34D399' },
  contracted: { label: 'Contracted', color: '#2DD4BF' },
  prepped: { label: 'Prepped', color: '#A78BFA' },
  shooting: { label: 'Shooting', color: '#F97316' },
  processing: { label: 'Processing', color: '#F59E0B' },
  review: { label: 'Review', color: '#818CF8' },
  gallery_live: { label: 'Gallery Live', color: '#34D399' },
  delivered: { label: 'Delivered', color: '#22C55E' },
}
