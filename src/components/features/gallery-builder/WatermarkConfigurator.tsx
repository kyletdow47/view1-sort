'use client'

import { Upload, RotateCcw } from 'lucide-react'
import type { WatermarkConfig, WatermarkPosition } from '@/types/gallery-builder'

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: 'TL' },
  { id: 'top-center', label: 'TC' },
  { id: 'top-right', label: 'TR' },
  { id: 'center', label: 'C' },
  { id: 'bottom-left', label: 'BL' },
  { id: 'bottom-center', label: 'BC' },
  { id: 'bottom-right', label: 'BR' },
]

interface WatermarkConfiguratorProps {
  config: WatermarkConfig
  onChange: (config: WatermarkConfig) => void
}

export function WatermarkConfigurator({ config, onChange }: WatermarkConfiguratorProps) {
  const handleLogoUpload = () => {
    // TODO: Integrate with Cloudflare Images upload API
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/svg+xml'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        onChange({ ...config, logoUrl: url, enabled: true })
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Watermark</h3>
        <button
          onClick={() => onChange({ ...config, enabled: !config.enabled })}
          className={`
            relative w-9 h-5 rounded-full transition-colors
            ${config.enabled ? 'bg-[#5749F4]' : 'bg-white/10'}
          `}
        >
          <div className={`
            absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
            ${config.enabled ? 'left-[18px]' : 'left-0.5'}
          `} />
        </button>
      </div>

      {config.enabled && (
        <div className="flex flex-col gap-3">
          {/* Logo Upload */}
          <button
            onClick={handleLogoUpload}
            className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-white/20
              bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-white/60 hover:text-white/80"
          >
            {config.logoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-xs">Change logo</span>
                <RotateCcw size={12} className="ml-auto" />
              </>
            ) : (
              <>
                <Upload size={16} />
                <span className="text-xs">Upload logo (PNG or SVG)</span>
              </>
            )}
          </button>

          {/* Position Grid */}
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">Position</label>
            <div className="grid grid-cols-3 gap-1 w-fit">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => onChange({ ...config, position: pos.id })}
                  className={`
                    w-8 h-8 rounded text-[10px] font-medium transition-all
                    ${config.position === pos.id
                      ? 'bg-[#5749F4] text-white'
                      : 'bg-white/[0.06] text-white/40 hover:bg-white/10 hover:text-white/60'}
                  `}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-white/60">Size</label>
              <span className="text-xs text-white/40">{config.size}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={config.size}
              onChange={(e) => onChange({ ...config, size: Number(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-full appearance-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#5749F4]
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-white/60">Opacity</label>
              <span className="text-xs text-white/40">{config.opacity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={config.opacity}
              onChange={(e) => onChange({ ...config, opacity: Number(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-full appearance-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#5749F4]
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}
