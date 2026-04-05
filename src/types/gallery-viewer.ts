// =============================================================================
// Gallery Viewer — Types
// Used by src/components/features/client-portal/GalleryViewer.tsx
// =============================================================================

import type { GalleryTheme } from './supabase'

/**
 * Client access level for a gallery.
 * - preview: watermarked images, no download
 * - proofing: full-res view only, no download
 * - delivered: full-res + download allowed
 */
export type GalleryAccessLevel = 'preview' | 'proofing' | 'delivered'

/** A category pill derived from media ai_category grouping */
export interface GalleryCategory {
  name: string
  count: number
}

/** Theme tokens for GalleryViewer UI */
export interface GalleryViewerTheme {
  bg: string
  heroBg: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  muted: string
  accent: string
  accentText: string
  pill: string
  pillActive: string
  pillActiveText: string
  pillHover: string
  badge: string
  imgPlaceholder: string
  overlay: string
  navBg: string
}

export const GALLERY_VIEWER_THEMES: Record<GalleryTheme, GalleryViewerTheme> = {
  dark: {
    bg: '#0c0c0e',
    heroBg: 'rgba(12,12,14,0.82)',
    surface: '#16161a',
    surfaceHover: '#1e1e24',
    border: 'rgba(255,255,255,0.08)',
    text: '#f0f0f0',
    muted: '#8a8a8a',
    accent: '#5749F4',
    accentText: '#ffffff',
    pill: 'rgba(255,255,255,0.08)',
    pillActive: '#5749F4',
    pillActiveText: '#ffffff',
    pillHover: 'rgba(255,255,255,0.14)',
    badge: 'rgba(255,255,255,0.15)',
    imgPlaceholder: '#1a1a1e',
    overlay: 'rgba(0,0,0,0.55)',
    navBg: 'rgba(12,12,14,0.92)',
  },
  light: {
    bg: '#f9fafb',
    heroBg: 'rgba(249,250,251,0.90)',
    surface: '#ffffff',
    surfaceHover: '#f3f4f6',
    border: 'rgba(0,0,0,0.08)',
    text: '#111827',
    muted: '#6b7280',
    accent: '#2563eb',
    accentText: '#ffffff',
    pill: 'rgba(0,0,0,0.06)',
    pillActive: '#111827',
    pillActiveText: '#ffffff',
    pillHover: 'rgba(0,0,0,0.10)',
    badge: 'rgba(0,0,0,0.10)',
    imgPlaceholder: '#e5e7eb',
    overlay: 'rgba(0,0,0,0.35)',
    navBg: 'rgba(249,250,251,0.95)',
  },
  minimal: {
    bg: '#ffffff',
    heroBg: 'rgba(255,255,255,0.94)',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    border: 'rgba(0,0,0,0.06)',
    text: '#1f2937',
    muted: '#9ca3af',
    accent: '#111827',
    accentText: '#ffffff',
    pill: '#f3f4f6',
    pillActive: '#111827',
    pillActiveText: '#ffffff',
    pillHover: '#e5e7eb',
    badge: '#e5e7eb',
    imgPlaceholder: '#f3f4f6',
    overlay: 'rgba(0,0,0,0.30)',
    navBg: 'rgba(255,255,255,0.97)',
  },
  editorial: {
    bg: '#1c1917',
    heroBg: 'rgba(12,10,9,0.88)',
    surface: '#292524',
    surfaceHover: '#3c3330',
    border: 'rgba(255,255,255,0.08)',
    text: '#fafaf9',
    muted: '#78716c',
    accent: '#e7c08a',
    accentText: '#1c1917',
    pill: 'rgba(255,255,255,0.06)',
    pillActive: '#e7c08a',
    pillActiveText: '#1c1917',
    pillHover: 'rgba(255,255,255,0.12)',
    badge: 'rgba(255,255,255,0.12)',
    imgPlaceholder: '#292524',
    overlay: 'rgba(0,0,0,0.55)',
    navBg: 'rgba(12,10,9,0.94)',
  },
}

/** Access level display config */
export const ACCESS_LEVEL_CONFIG: Record<
  GalleryAccessLevel,
  { label: string; description: string; color: string }
> = {
  preview: {
    label: 'Watermarked Preview',
    description: 'Images include a watermark. Purchase to download originals.',
    color: '#f59e0b',
  },
  proofing: {
    label: 'Proofing View',
    description: 'Full-resolution viewing. Contact your photographer to purchase downloads.',
    color: '#3b82f6',
  },
  delivered: {
    label: 'Full Access',
    description: 'Downloads enabled. Save your photos.',
    color: '#22c55e',
  },
}
