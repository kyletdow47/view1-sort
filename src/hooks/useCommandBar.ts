'use client'

import { useContext } from 'react'
import { CommandBarContext } from '@/components/features/command-bar/context'

export function useCommandBar() {
  const ctx = useContext(CommandBarContext)
  if (!ctx) {
    throw new Error('useCommandBar must be used inside CommandBarProvider')
  }
  return ctx
}
