import { WikiTabs } from '@/components/features/wiki/WikiTabs'
import { MarkdownDoc } from '@/components/features/wiki/MarkdownDoc'
import { Cpu } from 'lucide-react'

export const metadata = { title: 'Product & Tech — View1 Bible' }

export default function ProductPage() {
  const tabs = [
    { id: 'spec', label: 'Product Spec', content: <MarkdownDoc filePath="SPEC.md" /> },
    { id: 'state', label: 'Build State', content: <MarkdownDoc filePath="STATE.md" /> },
    { id: 'buildlog', label: 'Build Log', content: <MarkdownDoc filePath="BUILD-STATE.md" /> },
    {
      id: 'arch',
      label: 'Architecture',
      content: <MarkdownDoc filePath="docs/strategy/ARCHITECTURE-DECISIONS.md" />,
    },
  ]

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-violet-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400/70">
            Product & Tech
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">How We Build</h1>
        <p className="text-white/40 text-sm">
          The full product specification, live build state, change log, and architecture decisions.
        </p>
      </div>

      <WikiTabs tabs={tabs} defaultTab="spec" />
    </div>
  )
}
