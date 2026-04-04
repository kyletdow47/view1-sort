'use client'

import { useState, useCallback, useMemo } from 'react'
import { ArrowLeft, Send, Save } from 'lucide-react'
import Link from 'next/link'

import { PhotoSelector } from './PhotoSelector'
import { ThemePicker } from './ThemePicker'
import { WatermarkConfigurator } from './WatermarkConfigurator'
import { AccessControls } from './AccessControls'
import { GalleryPreviewPanel } from './GalleryPreviewPanel'

import type { Media, Project } from '@/types/supabase'
import type {
  GalleryThemeOption,
  WatermarkConfig,
  GalleryAccessConfig,
} from '@/types/gallery-builder'

type BuilderSection = 'photos' | 'theme' | 'watermark' | 'access'

const SECTIONS: { id: BuilderSection; label: string }[] = [
  { id: 'photos', label: 'Photos' },
  { id: 'theme', label: 'Theme' },
  { id: 'watermark', label: 'Watermark' },
  { id: 'access', label: 'Access' },
]

export interface GalleryBuilderViewProps {
  project: Project
  media: Media[]
}

export function GalleryBuilderView({ project, media }: GalleryBuilderViewProps) {
  // Active section in left panel
  const [activeSection, setActiveSection] = useState<BuilderSection>('photos')

  // Gallery state
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    () => new Set(media.map((m) => m.id)),
  )
  const [theme, setTheme] = useState<GalleryThemeOption>(project.gallery_theme ?? 'dark')
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    logoUrl: null,
    position: 'bottom-right',
    size: 15,
    opacity: 60,
  })
  const [access, setAccess] = useState<GalleryAccessConfig>({
    passwordProtected: false,
    password: '',
    expiresAt: null,
    allowDownloads: true,
    allowFavorites: true,
    allowComments: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Selected photos for preview
  const selectedPhotos = useMemo(
    () => media.filter((m) => selectedPhotoIds.has(m.id)),
    [media, selectedPhotoIds],
  )

  // Handlers
  const handleTogglePhoto = useCallback((id: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedPhotoIds(new Set(media.map((m) => m.id)))
  }, [media])

  const handleDeselectAll = useCallback(() => {
    setSelectedPhotoIds(new Set())
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // TODO: Save gallery builder state to Supabase
      // POST /api/projects/[id]/gallery-config with theme, watermark, access, selectedPhotoIds
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      console.error('Failed to save gallery config:', err)
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handlePublish = useCallback(() => {
    // TODO: Navigate to publish wizard with current gallery config
    window.location.href = `/dashboard/project/${project.id}/publish`
  }, [project.id])

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]
        bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/project/${project.id}`}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">Gallery Builder</h1>
            <p className="text-[10px] text-white/40">{project.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-white/[0.06] border border-white/10 text-white/80
              hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium
              bg-[#5749F4] text-white hover:bg-[#5749F4]/80 transition-colors"
          >
            <Send size={12} />
            Publish Gallery
          </button>
        </div>
      </div>

      {/* Split Panel Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Controls Panel */}
        <div className="w-[340px] shrink-0 border-r border-white/[0.06] flex flex-col
          bg-white/[0.02] lg:w-[380px]">
          {/* Section Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex-1 py-2.5 text-xs font-medium transition-colors border-b-2
                  ${activeSection === section.id
                    ? 'text-white border-[#5749F4]'
                    : 'text-white/40 border-transparent hover:text-white/60'}
                `}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto p-4
            scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeSection === 'photos' && (
              <PhotoSelector
                media={media}
                selectedIds={selectedPhotoIds}
                onToggle={handleTogglePhoto}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
            )}
            {activeSection === 'theme' && (
              <ThemePicker
                activeTheme={theme}
                onThemeChange={setTheme}
              />
            )}
            {activeSection === 'watermark' && (
              <WatermarkConfigurator
                config={watermark}
                onChange={setWatermark}
              />
            )}
            {activeSection === 'access' && (
              <AccessControls
                config={access}
                onChange={setAccess}
              />
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="flex-1 min-w-0 bg-black/20">
          <GalleryPreviewPanel
            title={project.name}
            selectedPhotos={selectedPhotos}
            theme={theme}
            watermark={watermark}
          />
        </div>
      </div>
    </div>
  )
}
