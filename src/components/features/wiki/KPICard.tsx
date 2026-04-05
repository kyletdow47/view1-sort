import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  source: 'Supabase' | 'Stripe' | 'Asana' | 'Manual'
  icon: LucideIcon
  trend?: 'up' | 'down' | 'flat'
  trendLabel?: string
  description?: string
}

const sourceColors: Record<KPICardProps['source'], string> = {
  Supabase: 'text-emerald-400/70 bg-emerald-400/10',
  Stripe: 'text-violet-400/70 bg-violet-400/10',
  Asana: 'text-amber-400/70 bg-amber-400/10',
  Manual: 'text-white/30 bg-white/[0.05]',
}

export function KPICard({ label, value, source, icon: Icon, trend, trendLabel, description }: KPICardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:border-white/[0.14] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08]">
          <Icon className="h-4 w-4 text-violet-400" strokeWidth={1.75} />
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${sourceColors[source]}`}>
          {source}
        </span>
      </div>

      <div className="mt-1">
        <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent font-display">
          {value}
        </p>
        <p className="text-sm text-white/50 mt-0.5">{label}</p>
        {description && <p className="text-xs text-white/30 mt-1">{description}</p>}
      </div>

      {trend && trendLabel && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
          {trend === 'flat' && <Minus className="h-3.5 w-3.5 text-white/30" />}
          <span className={`text-xs ${trend === 'up' ? 'text-emerald-400/80' : trend === 'down' ? 'text-red-400/80' : 'text-white/30'}`}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}
