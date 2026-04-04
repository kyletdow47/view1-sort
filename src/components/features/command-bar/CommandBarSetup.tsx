'use client'

import type { ReactNode } from 'react'
import { CommandBarProvider } from './CommandBarProvider'

export function CommandBarSetup({ children }: { children: ReactNode }) {
  return <CommandBarProvider>{children}</CommandBarProvider>
}
