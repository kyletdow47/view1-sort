// Gallery Builder types for the split-panel gallery configuration interface

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface WatermarkConfig {
  enabled: boolean
  logoUrl: string | null
  position: WatermarkPosition
  size: number // 1-100 percentage
  opacity: number // 0-100
}

export interface GalleryAccessConfig {
  passwordProtected: boolean
  password: string
  expiresAt: string | null
  allowDownloads: boolean
  allowFavorites: boolean
  allowComments: boolean
}

export interface GalleryBuilderState {
  selectedPhotoIds: Set<string>
  theme: GalleryThemeOption
  watermark: WatermarkConfig
  access: GalleryAccessConfig
  title: string
  description: string
}

export type GalleryThemeOption = 'dark' | 'light' | 'minimal' | 'editorial'

export interface ThemePreview {
  id: GalleryThemeOption
  name: string
  description: string
  bgColor: string
  textColor: string
  accentColor: string
}
