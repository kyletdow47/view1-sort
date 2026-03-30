'use client'

import { useEffect, useState } from 'react'

export type AppTheme = 'warm' | 'zinc' | 'mono'

const THEMES: { id: AppTheme; label: string; color: string }[] = [
  { id: 'warm', label: 'Warm / Stone',  color: '#D4915C' },
  { id: 'zinc', label: 'Zinc / Cool',   color: '#6366f1' },
  { id: 'mono', label: 'Monochrome',    color: '#C4C4C4' },
]

function applyTheme(theme: AppTheme) {
  if (theme === 'warm') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  try { localStorage.setItem('v1-theme', theme) } catch {}
}

export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<AppTheme>('warm')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('v1-theme') as AppTheme | null
      if (saved && THEMES.some(t => t.id === saved)) {
        setTheme(saved)
      }
    } catch {}
  }, [])

  const handleTheme = (t: AppTheme) => {
    setTheme(t)
    applyTheme(t)
  }

  if (!mounted) return null

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title="Switch theme">
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => handleTheme(t.id)}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
          className={`theme-dot theme-dot-${t.id} ${theme === t.id ? 'active' : 'opacity-50'}`}
          style={{ background: t.color }}
        />
      ))}
    </div>
  )
}
