'use client'

import { useRouter } from 'next/navigation'
import { Plus, Upload, Send, FileText } from 'lucide-react'

interface QuickAction {
  label: string
  icon: React.ElementType
  href: string
  gradient: string
}

const actions: QuickAction[] = [
  {
    label: 'New Project',
    icon: Plus,
    href: '/dashboard/projects?new=1',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    label: 'Upload Photos',
    icon: Upload,
    href: '/dashboard/projects',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    label: 'Send Gallery',
    icon: Send,
    href: '/dashboard/gallery',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    label: 'Create Invoice',
    icon: FileText,
    href: '/dashboard/finances?new-invoice=1',
    gradient: 'from-violet-500 to-violet-600',
  },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.1]"
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b ${action.gradient}`}
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[13px] font-medium text-white/80 transition-colors group-hover:text-white">
              {action.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
