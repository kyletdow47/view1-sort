'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'zinc' | 'stone' | 'mono'

const STORAGE_KEY = 'v1-theme'
const DEFAULT_THEME: Theme = 'zinc'

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const resolved = stored ?? DEFAULT_THEME
    setThemeState(resolved)
    applyTheme(resolved)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }, [])

  return { theme, setTheme }
}
