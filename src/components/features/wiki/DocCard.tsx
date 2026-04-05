import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { FileText, ArrowUpRight } from 'lucide-react'

interface DocCardProps {
  title: string
  description: string
  href?: string
  filePath?: string
  icon?: LucideIcon
  category?: string
  status?: 'complete' | 'draft' | 'planned'
  lastModified?: string
}

const statusStyles = {
  complete: 'text-emerald-400/70 bg-emerald-400/10',
  draft: 'text-amber-400/70 bg-amber-400/10',
  planned: 'text-white/30 bg-white/[0.05]',
}

const statusLabels = {
  complete: 'Complete',
  draft: 'Draft',
  planned: 'Planned',
}

export function DocCard({
  title,
  description,
  href,
  icon: Icon = FileText,
  category,
  status = 'complete',
  lastModified,
}: DocCardProps) {
  const content = (
    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/[0.08] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:border-white/[0.14] cursor-pointer before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:pointer-events-none">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.07]">
          <Icon className="h-4 w-4 text-violet-400/70" strokeWidth={1.75} />
        </div>
        <div className="flex items-center gap-2">
          {category && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide text-white/30 bg-white/[0.05]">
              {category}
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${statusStyles[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white/80 mb-1 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-xs text-white/40 leading-relaxed">{description}</p>

      {lastModified && (
        <p className="text-[11px] text-white/25 mt-3">Updated {lastModified}</p>
      )}

      {href && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-violet-400/60" />
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
