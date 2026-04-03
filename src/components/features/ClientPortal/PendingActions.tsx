'use client'

import { CreditCard, FileText, AlertCircle } from 'lucide-react'
import type { PendingAction } from '@/types/client-portal'
import type { LucideIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  PendingAction['type'],
  { Icon: LucideIcon; accent: string }
> = {
  invoice: { Icon: CreditCard, accent: '#FBBF24' },
  contract: { Icon: FileText, accent: '#60A5FA' },
  questionnaire: { Icon: AlertCircle, accent: '#A78BFA' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PendingActionsProps {
  actions: PendingAction[]
}

export function PendingActions({ actions }: PendingActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const { Icon, accent } = TYPE_CONFIG[action.type]
        return (
          <a
            key={action.id}
            href={action.href}
            className="group flex flex-1 min-w-[200px] items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-md transition-all hover:scale-[1.01]"
            style={{
              background: `linear-gradient(180deg, ${accent}14 0%, ${accent}08 100%)`,
              border: `1px solid ${accent}33`,
            }}
          >
            <Icon
              className="h-4 w-4 shrink-0"
              style={{ color: accent }}
            />
            <span className="flex-1 text-[13px] font-medium text-white/85">
              {action.label}
            </span>
            <span
              className="shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity group-hover:opacity-80"
              style={{
                background: `${accent}30`,
                border: `1px solid ${accent}50`,
              }}
            >
              {action.action}
            </span>
          </a>
        )
      })}
    </div>
  )
}
