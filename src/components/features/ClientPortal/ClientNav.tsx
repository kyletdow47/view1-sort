'use client'

import { useState } from 'react'
import type { PhotographerBrand } from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PortalTab = 'My Galleries' | 'Documents' | 'Downloads'

interface ClientNavProps {
  brand: PhotographerBrand
  clientName: string
  clientInitial: string
  activeTab: PortalTab
  onTabChange: (tab: PortalTab) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TABS: PortalTab[] = ['My Galleries', 'Documents', 'Downloads']

export function ClientNav({
  brand,
  clientName,
  clientInitial,
  activeTab,
  onTabChange,
}: ClientNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-6 md:px-10 backdrop-blur-xl bg-white/[0.04] border-b border-white/[0.08]">
      {/* Left: Photographer brand */}
      <div className="flex items-center gap-2.5">
        {brand.avatarUrl ? (
          <img
            src={brand.avatarUrl}
            alt={brand.name}
            className="h-[30px] w-[30px] rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600">
            <span className="text-[11px] font-bold text-white">
              {brand.avatarInitials}
            </span>
          </div>
        )}
        <span className="font-headline text-[15px] font-bold text-white">
          {brand.name}
        </span>
      </div>

      {/* Center: Tab navigation */}
      <nav className="flex overflow-x-auto items-center gap-1 rounded-xl p-1 bg-white/[0.07] border border-white/[0.08]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white/[0.12] font-semibold text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Right: Client identity */}
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-[13px] text-white/70">
          {clientName}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-[12px] font-bold text-white ring-2 ring-white/20">
          {clientInitial}
        </div>
      </div>
    </header>
  )
}
