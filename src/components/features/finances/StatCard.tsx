'use client'

interface StatCardProps {
  label: string
  value: string
  detail: string
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]">
      <p className="text-xs font-medium text-white/60">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-mono text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="mt-2 text-xs text-white/40">{detail}</p>
    </div>
  )
}
