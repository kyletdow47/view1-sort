'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CommandBar } from './CommandBar'
import { CommandBarContext } from './context'

export { CommandBarContext }

export function CommandBarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openCommandBar = useCallback(() => setOpen(true), [])
  const closeCommandBar = useCallback(() => setOpen(false), [])
  const toggleCommandBar = useCallback(() => setOpen((o) => !o), [])

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (modifier && e.key === 'k') {
        e.preventDefault()
        toggleCommandBar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleCommandBar])

  return (
    <CommandBarContext.Provider value={{ open, openCommandBar, closeCommandBar, toggleCommandBar }}>
      {children}
      <CommandBar />
    </CommandBarContext.Provider>
  )
}
