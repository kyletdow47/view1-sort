'use client'

import { Palette, Check } from 'lucide-react'

const themes = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek dark background with high contrast',
    colors: { bg: '#0C0C0E', surface: '#1a1a1f', accent: '#4ADE80' },
    selected: true,
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white background, classic feel',
    colors: { bg: '#FAFAFA', surface: '#FFFFFF', accent: '#22C55E' },
    selected: false,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Stripped-down, focus on imagery',
    colors: { bg: '#F5F5F0', surface: '#EBEBDF', accent: '#8B8B73' },
    selected: false,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style layout with typography',
    colors: { bg: '#1C1917', surface: '#292524', accent: '#F59E0B' },
    selected: false,
  },
]

export default function ThemesPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Palette className="w-6 h-6 text-accent" />
          Gallery Themes
        </h1>
        <p className="text-muted-foreground mt-1">Choose how your client galleries look and feel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            disabled
            className={`relative rounded-xl border p-4 text-left transition-colors cursor-not-allowed ${
              theme.selected
                ? 'border-accent bg-accent/5'
                : 'border-view1-border bg-surface hover:border-accent/30'
            }`}
          >
            {/* Theme Preview */}
            <div
              className="h-32 rounded-lg mb-3 border border-view1-border/50 overflow-hidden"
              style={{ backgroundColor: theme.colors.bg }}
            >
              <div className="p-3 space-y-2">
                <div
                  className="h-3 w-20 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-8 rounded"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{theme.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
              </div>
              {theme.selected && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Theme customization coming soon. More themes will be available on Pro and Studio plans.
      </p>
    </div>
  )
}
