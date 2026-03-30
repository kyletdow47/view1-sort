'use client'

import { useTheme, type Theme } from '@/hooks/useTheme'

const THEMES: { value: Theme; label: string; swatch: string }[] = [
  { value: 'zinc', label: 'Zinc',  swatch: '#6366f1' },
  { value: 'stone', label: 'Stone', swatch: '#d97706' },
  { value: 'mono', label: 'Mono',  swatch: '#ffffff' },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1.5" aria-label="Theme switcher">
      {THEMES.map(({ value, label, swatch }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={`${label} theme`}
          aria-pressed={theme === value}
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
            theme === value
              ? 'scale-110 border-on-surface/40 ring-2 ring-primary/60'
              : 'border-on-surface/10 opacity-50 hover:opacity-80'
          }`}
          style={{ background: swatch }}
        />
      ))}
    </div>
  )
}
