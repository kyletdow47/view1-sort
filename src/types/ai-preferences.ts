/** Types for the AI Sort Preferences Tab — per-project AI configuration */

export type ShootingStyle = 'wedding' | 'portrait' | 'event' | 'commercial' | 'real-estate' | 'editorial'

export interface ShootingStyleOption {
  id: ShootingStyle
  label: string
}

export const SHOOTING_STYLES: ShootingStyleOption[] = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'event', label: 'Event' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'real-estate', label: 'Real Estate' },
  { id: 'editorial', label: 'Editorial' },
] as const

export type AutoSortCategoryKey =
  | 'sharp'
  | 'blurry'
  | 'duplicate'
  | 'eyes-closed'
  | 'hero-shot'
  | 'group'
  | 'detail'
  | 'overexposed'

export interface AutoSortCategory {
  id: AutoSortCategoryKey
  label: string
  enabled: boolean
}

export const DEFAULT_AUTO_SORT_CATEGORIES: AutoSortCategory[] = [
  { id: 'sharp', label: 'Sharp', enabled: true },
  { id: 'blurry', label: 'Blurry', enabled: true },
  { id: 'duplicate', label: 'Duplicate', enabled: true },
  { id: 'eyes-closed', label: 'Eyes Closed', enabled: false },
  { id: 'hero-shot', label: 'Hero Shot', enabled: true },
  { id: 'group', label: 'Group', enabled: false },
  { id: 'detail', label: 'Detail', enabled: true },
  { id: 'overexposed', label: 'Overexposed', enabled: false },
] as const

export type AutoRejectKey = 'blurry' | 'duplicate' | 'eyes-closed' | 'overexposed'

export interface AutoRejectRule {
  id: AutoRejectKey
  label: string
  enabled: boolean
}

export const DEFAULT_AUTO_REJECT_RULES: AutoRejectRule[] = [
  { id: 'blurry', label: 'Blurry', enabled: true },
  { id: 'duplicate', label: 'Duplicate', enabled: true },
  { id: 'eyes-closed', label: 'Eyes Closed', enabled: false },
  { id: 'overexposed', label: 'Overexposed', enabled: false },
] as const

export interface HeroShotScoring {
  sharpness: number
  composition: number
  expression: number
}

export type WatermarkStyle = 'diagonal-text' | 'center-logo' | 'corner-logo' | 'tiled'

export interface WatermarkStyleOption {
  id: WatermarkStyle
  label: string
}

export const WATERMARK_STYLES: WatermarkStyleOption[] = [
  { id: 'diagonal-text', label: 'Diagonal Text' },
  { id: 'center-logo', label: 'Center Logo' },
  { id: 'corner-logo', label: 'Corner Logo' },
  { id: 'tiled', label: 'Tiled' },
] as const

export type GalleryTheme = 'minimal-dark' | 'minimal-light' | 'classic' | 'editorial'

export interface GalleryThemeOption {
  id: GalleryTheme
  label: string
}

export const GALLERY_THEMES: GalleryThemeOption[] = [
  { id: 'minimal-dark', label: 'Minimal Dark' },
  { id: 'minimal-light', label: 'Minimal Light' },
  { id: 'classic', label: 'Classic' },
  { id: 'editorial', label: 'Editorial' },
] as const

export type GalleryExpiry = '7-days' | '14-days' | '30-days' | '60-days' | '90-days' | 'never'

export interface GalleryExpiryOption {
  id: GalleryExpiry
  label: string
}

export const GALLERY_EXPIRY_OPTIONS: GalleryExpiryOption[] = [
  { id: '7-days', label: '7 days' },
  { id: '14-days', label: '14 days' },
  { id: '30-days', label: '30 days' },
  { id: '60-days', label: '60 days' },
  { id: '90-days', label: '90 days' },
  { id: 'never', label: 'Never' },
] as const

export interface DeliveryDefaults {
  watermarkEnabled: boolean
  watermarkStyle: WatermarkStyle
  maxSelects: number
  galleryExpiry: GalleryExpiry
  galleryTheme: GalleryTheme
}

export interface AIPreferences {
  shootingStyles: ShootingStyle[]
  autoSortCategories: AutoSortCategory[]
  confidenceThreshold: number
  autoRejectRules: AutoRejectRule[]
  heroShotScoring: HeroShotScoring
  vibeKeywords: string[]
  delivery: DeliveryDefaults
}

export const DEFAULT_AI_PREFERENCES: AIPreferences = {
  shootingStyles: ['wedding', 'portrait'],
  autoSortCategories: [...DEFAULT_AUTO_SORT_CATEGORIES],
  confidenceThreshold: 75,
  autoRejectRules: [...DEFAULT_AUTO_REJECT_RULES],
  heroShotScoring: {
    sharpness: 80,
    composition: 60,
    expression: 70,
  },
  vibeKeywords: ['golden hour', 'candid', 'moody', 'warm tones'],
  delivery: {
    watermarkEnabled: true,
    watermarkStyle: 'diagonal-text',
    maxSelects: 50,
    galleryExpiry: '30-days',
    galleryTheme: 'minimal-dark',
  },
}
