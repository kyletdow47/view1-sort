'use client'

import { Check } from 'lucide-react'
import type { GalleryThemeOption, ThemePreview } from '@/types/gallery-builder'

const THEMES: ThemePreview[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dramatic dark gallery with light text',
    bgColor: '#0A0A0A',
    textColor: '#FFFFFF',
    accentColor: '#5749F4',
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white gallery with dark text',
    bgColor: '#FFFFFF',
    textColor: '#1A1A1A',
    accentColor: '#5749F4',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Borderless layout with generous spacing',
    bgColor: '#F5F5F0',
    textColor: '#333333',
    accentColor: '#888888',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style with serif headings',
    bgColor: '#1A1916',
    textColor: '#E8E4DD',
    accentColor: '#D4A574',
  },
]

interface ThemePickerProps {
  activeTheme: GalleryThemeOption
  onThemeChange: (theme: GalleryThemeOption) => void
}

export function ThemePicker({ activeTheme, onThemeChange }: ThemePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-white">Gallery Theme</h3>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`
                relative flex flex-col rounded-xl overflow-hidden border-2 transition-all
                ${isActive
                  ? 'border-[#5749F4] ring-1 ring-[#5749F4]/30'
                  : 'border-white/10 hover:border-white/20'}
              `}
            >
              {/* Theme preview swatch */}
              <div
                className="h-16 flex items-end p-2"
                style={{ backgroundColor: theme.bgColor }}
              >
                {/* Mini preview grid */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: `${theme.textColor}20` }}
                    />
                  ))}
                </div>
                <div
                  className="ml-auto text-[8px] font-medium"
                  style={{ color: theme.textColor }}
                >
                  Aa
                </div>
              </div>

              {/* Theme info */}
              <div className="p-2 bg-white/[0.04]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-white">{theme.name}</span>
                  {isActive && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#5749F4] flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/50 mt-0.5 leading-tight">
                  {theme.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
