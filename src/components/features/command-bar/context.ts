'use client'

import { createContext } from 'react'
import type { CommandBarContextValue } from '@/types/command-bar'

export const CommandBarContext = createContext<CommandBarContextValue | null>(null)
