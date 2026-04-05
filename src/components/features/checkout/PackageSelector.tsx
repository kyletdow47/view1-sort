'use client'

import { Check } from 'lucide-react'
import type { CheckoutPackage } from '@/types/checkout'

interface PackageSelectorProps {
  packages: CheckoutPackage[]
  selectedPackageId: string | null
  onSelect: (packageId: string) => void
}

export function PackageSelector({
  packages,
  selectedPackageId,
  onSelect,
}: PackageSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/40">
        Choose a Package
      </h3>
      <div className="flex flex-col gap-3">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onSelect(pkg.id)}
              className={[
                'group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-[#5749F4] bg-[#5749F4]/10'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]',
                pkg.highlight && !isSelected
                  ? 'ring-1 ring-[#5749F4]/30'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Selection indicator */}
              <div
                className={[
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-[#5749F4] bg-[#5749F4]'
                    : 'border-white/25 bg-transparent',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>

              {/* Package info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-white/90">
                    {pkg.name}
                  </span>
                  <span
                    className={[
                      'shrink-0 font-mono text-[15px] font-bold',
                      isSelected ? 'text-white' : 'text-white/70',
                    ].join(' ')}
                  >
                    {pkg.priceLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-white/45">{pkg.description}</p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {pkg.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1 text-[11px] text-white/50"
                    >
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular badge */}
              {pkg.highlight && (
                <span className="absolute -top-2 right-4 rounded-full bg-[#5749F4] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Popular
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
