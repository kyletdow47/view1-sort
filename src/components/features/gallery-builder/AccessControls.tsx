'use client'

import { Eye, EyeOff, Lock, Download, Heart, MessageSquare } from 'lucide-react'
import type { GalleryAccessConfig } from '@/types/gallery-builder'

interface AccessControlsProps {
  config: GalleryAccessConfig
  onChange: (config: GalleryAccessConfig) => void
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
        <Icon size={14} className="text-white/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white">{label}</p>
        <p className="text-[10px] text-white/40 leading-tight">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`
          relative w-9 h-5 rounded-full transition-colors shrink-0
          ${enabled ? 'bg-[#5749F4]' : 'bg-white/10'}
        `}
      >
        <div className={`
          absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
          ${enabled ? 'left-[18px]' : 'left-0.5'}
        `} />
      </button>
    </div>
  )
}

export function AccessControls({ config, onChange }: AccessControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-white">Access & Permissions</h3>

      {/* Password Protection */}
      <ToggleRow
        icon={Lock}
        label="Password Protected"
        description="Require a password to view gallery"
        enabled={config.passwordProtected}
        onToggle={() => onChange({ ...config, passwordProtected: !config.passwordProtected })}
      />

      {config.passwordProtected && (
        <div className="relative ml-11">
          <input
            type={config.passwordProtected ? 'text' : 'password'}
            value={config.password}
            onChange={(e) => onChange({ ...config, password: e.target.value })}
            placeholder="Enter gallery password"
            className="w-full px-3 py-1.5 text-xs bg-white/[0.06] border border-white/10
              rounded-lg text-white placeholder:text-white/30 outline-none
              focus:border-[#5749F4]/50 transition-colors"
          />
        </div>
      )}

      {/* Expiry Date */}
      <div className="ml-11">
        <label className="text-[10px] text-white/40 mb-1 block">Expiry Date (optional)</label>
        <input
          type="date"
          value={config.expiresAt ?? ''}
          onChange={(e) => onChange({ ...config, expiresAt: e.target.value || null })}
          className="w-full px-3 py-1.5 text-xs bg-white/[0.06] border border-white/10
            rounded-lg text-white/80 outline-none focus:border-[#5749F4]/50
            transition-colors [color-scheme:dark]"
        />
      </div>

      <div className="border-t border-white/[0.06] my-1" />

      {/* Client Permissions */}
      <ToggleRow
        icon={Download}
        label="Allow Downloads"
        description="Clients can download full-res photos"
        enabled={config.allowDownloads}
        onToggle={() => onChange({ ...config, allowDownloads: !config.allowDownloads })}
      />

      <ToggleRow
        icon={Heart}
        label="Allow Favorites"
        description="Clients can heart their favorite shots"
        enabled={config.allowFavorites}
        onToggle={() => onChange({ ...config, allowFavorites: !config.allowFavorites })}
      />

      <ToggleRow
        icon={MessageSquare}
        label="Allow Comments"
        description="Clients can leave comments on photos"
        enabled={config.allowComments}
        onToggle={() => onChange({ ...config, allowComments: !config.allowComments })}
      />
    </div>
  )
}
