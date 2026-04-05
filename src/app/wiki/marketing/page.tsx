import { WikiTabs } from '@/components/features/wiki/WikiTabs'
import { MarkdownDoc } from '@/components/features/wiki/MarkdownDoc'
import { Megaphone } from 'lucide-react'

export const metadata = { title: 'Marketing & GTM — View1 Bible' }

export default function MarketingPage() {
  const tabs = [
    {
      id: 'gtm',
      label: 'GTM Plan',
      content: <MarkdownDoc filePath="docs/marketing/GTM-LAUNCH-PLAN.md" />,
    },
    {
      id: 'strategy',
      label: 'Marketing Strategy',
      content: <MarkdownDoc filePath="docs/marketing/MARKETING-STRATEGY.md" />,
    },
    {
      id: 'content',
      label: 'Content Batch 001',
      content: <MarkdownDoc filePath="docs/marketing/content-batch-001.md" />,
    },
  ]

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="h-4 w-4 text-amber-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400/70">
            Marketing & GTM
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">How We Grow</h1>
        <p className="text-white/40 text-sm">
          Go-to-market plan, brand strategy, content calendar, and the full launch playbook.
        </p>
      </div>

      <WikiTabs tabs={tabs} defaultTab="gtm" />
    </div>
  )
}
