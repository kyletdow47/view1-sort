'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  Lock,
  Unlock,
  CreditCard,
  Package,
  Image as ImageIcon,
  Check,
  ChevronRight,
  DollarSign,
  Star,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type PricingModel = 'free' | 'per_photo' | 'package'

interface PricingConfig {
  model: PricingModel
  perPhotoCents: number
  packages: DownloadPackage[]
  freePhotoLimit: number // 0 = no free photos
}

interface DownloadPackage {
  id: string
  name: string
  photoCount: number | 'all'
  priceCents: number
  popular?: boolean
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const DEFAULT_PACKAGES: DownloadPackage[] = [
  { id: 'pkg-5', name: 'Starter', photoCount: 5, priceCents: 1500, popular: false },
  { id: 'pkg-20', name: 'Value Pack', photoCount: 20, priceCents: 4500, popular: true },
  { id: 'pkg-all', name: 'Full Gallery', photoCount: 'all', priceCents: 12000, popular: false },
]

const MOCK_DOWNLOAD_LOG = [
  { id: 'd1', clientName: 'Sarah Johnson', photoCount: 20, totalCents: 4500, at: '2 hours ago', status: 'paid' },
  { id: 'd2', clientName: 'Sarah Johnson', photoCount: 3, totalCents: 4500, at: '1 hour ago', status: 'paid' },
]

/* ─── Pricing model card ─────────────────────────────────────────────────── */

function ModelCard({
  id,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  id: PricingModel
  title: string
  description: string
  icon: React.ElementType
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all w-full',
        selected ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/40',
      ].join(' ')}
    >
      <div className={['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', selected ? 'bg-primary/20' : 'bg-surface-container'].join(' ')}>
        <Icon className={['w-5 h-5', selected ? 'text-primary' : 'text-on-surface-variant/50'].join(' ')} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-headline font-bold text-on-surface">{title}</p>
          {selected && <Check className="w-4 h-4 text-primary" />}
        </div>
        <p className="text-xs text-on-surface-variant/60 mt-0.5">{description}</p>
      </div>
    </button>
  )
}

/* ─── Per-photo pricing ──────────────────────────────────────────────────── */

function PerPhotoPricing({
  config,
  onChange,
}: {
  config: PricingConfig
  onChange: (c: PricingConfig) => void
}) {
  const cents = config.perPhotoCents
  const dollars = (cents / 100).toFixed(2)

  return (
    <div className="space-y-4 p-5 bg-surface-container rounded-2xl">
      <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Price per photo</p>
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 font-mono text-sm">$</span>
          <input
            type="number"
            value={dollars}
            min="0.50"
            step="0.50"
            onChange={(e) => onChange({ ...config, perPhotoCents: Math.round(Number(e.target.value) * 100) })}
            className="pl-7 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-mono text-on-surface w-28 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <span className="text-xs font-mono text-on-surface-variant/50">per photo</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Free preview limit</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={config.freePhotoLimit}
            min="0"
            max="50"
            onChange={(e) => onChange({ ...config, freePhotoLimit: Number(e.target.value) })}
            className="px-3 py-2.5 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-mono text-on-surface w-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs font-mono text-on-surface-variant/50">
            {config.freePhotoLimit === 0 ? 'No free photos' : `first ${config.freePhotoLimit} photos free`}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Package pricing ────────────────────────────────────────────────────── */

function PackagePricing({
  config,
  onChange,
}: {
  config: PricingConfig
  onChange: (c: PricingConfig) => void
}) {
  const updatePkg = (id: string, field: 'priceCents' | 'photoCount', value: number | 'all') => {
    onChange({
      ...config,
      packages: config.packages.map((p) => p.id === id ? { ...p, [field]: value } : p),
    })
  }

  return (
    <div className="space-y-3 p-5 bg-surface-container rounded-2xl">
      <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Packages</p>
      {config.packages.map((pkg) => (
        <div key={pkg.id} className={['flex items-center gap-3 p-3 rounded-xl border transition-all', pkg.popular ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/20'].join(' ')}>
          {pkg.popular && (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-headline font-bold text-on-surface">{pkg.name}</p>
            <p className="text-[10px] font-mono text-on-surface-variant/50">
              {pkg.photoCount === 'all' ? 'All photos' : `${pkg.photoCount} photos`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant/50 font-mono text-sm">$</span>
            <input
              type="number"
              value={(pkg.priceCents / 100).toFixed(2)}
              min="1"
              step="0.50"
              onChange={(e) => updatePkg(pkg.id, 'priceCents', Math.round(Number(e.target.value) * 100))}
              className="px-2 py-1.5 bg-surface-container-high border border-outline-variant/20 rounded-lg text-sm font-mono text-on-surface w-20 focus:outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function DownloadsPage() {
  const params = useParams<{ id: string }>()
  const [config, setConfig] = useState<PricingConfig>({
    model: 'free',
    perPhotoCents: 150,
    packages: DEFAULT_PACKAGES,
    freePhotoLimit: 0,
  })
  const [saved, setSaved] = useState(false)

  const totalRevenue = MOCK_DOWNLOAD_LOG.reduce((sum, d) => sum + d.totalCents, 0)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <Download className="w-8 h-8 text-primary" />
            Download & Payment Gate
          </h1>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            Control how clients download photos and configure pricing.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/project/${params.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Project
          </Link>
          <button
            onClick={save}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {saved ? <Check className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save pricing'}
          </button>
        </div>
      </div>

      {/* Revenue summary (if any activity) */}
      {MOCK_DOWNLOAD_LOG.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total revenue', value: `$${(totalRevenue / 100).toFixed(2)}`, color: 'text-emerald-400' },
            { label: 'Downloads', value: MOCK_DOWNLOAD_LOG.reduce((s, d) => s + d.photoCount, 0), color: 'text-on-surface' },
            { label: 'Transactions', value: MOCK_DOWNLOAD_LOG.length, color: 'text-on-surface' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container rounded-2xl p-5">
              <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Pricing model */}
        <div className="space-y-5">
          <h2 className="text-sm font-mono uppercase tracking-widest text-on-surface-variant/50">Pricing model</h2>

          <div className="space-y-3">
            <ModelCard
              id="free"
              title="Free delivery"
              description="All selected photos are free to download after project is complete."
              icon={Unlock}
              selected={config.model === 'free'}
              onSelect={() => setConfig((c) => ({ ...c, model: 'free' }))}
            />
            <ModelCard
              id="per_photo"
              title="Pay per photo"
              description="Client pays per photo they want to download."
              icon={ImageIcon}
              selected={config.model === 'per_photo'}
              onSelect={() => setConfig((c) => ({ ...c, model: 'per_photo' }))}
            />
            <ModelCard
              id="package"
              title="Download packages"
              description="Offer bundled packages (e.g. 5, 20, or all photos)."
              icon={Package}
              selected={config.model === 'package'}
              onSelect={() => setConfig((c) => ({ ...c, model: 'package' }))}
            />
          </div>

          {/* Per-photo settings */}
          {config.model === 'per_photo' && (
            <PerPhotoPricing config={config} onChange={setConfig} />
          )}

          {/* Package settings */}
          {config.model === 'package' && (
            <PackagePricing config={config} onChange={setConfig} />
          )}

          {/* Stripe note */}
          {config.model !== 'free' && (
            <div className="flex items-start gap-2 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono font-bold text-amber-400">Stripe Connect required</p>
                <p className="text-[10px] font-mono text-on-surface-variant/60 mt-0.5">
                  Connect your Stripe account in Settings → Connect to enable paid downloads.
                </p>
                <Link
                  href="/dashboard/settings/connect"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-primary mt-1 hover:underline"
                >
                  Connect Stripe <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: Download log */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-on-surface-variant/50">Download activity</h2>

          {MOCK_DOWNLOAD_LOG.length === 0 ? (
            <div className="bg-surface-container rounded-2xl p-8 text-center">
              <Download className="w-10 h-10 text-on-surface-variant/20 mx-auto mb-2" />
              <p className="text-sm font-mono text-on-surface-variant/40">No downloads yet</p>
            </div>
          ) : (
            <div className="bg-surface-container rounded-2xl overflow-hidden">
              {MOCK_DOWNLOAD_LOG.map((d, i) => (
                <div
                  key={d.id}
                  className={['flex items-center gap-4 px-5 py-4', i !== 0 ? 'border-t border-outline-variant/10' : ''].join(' ')}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-bold text-on-surface">{d.clientName}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant/50">
                      {d.photoCount} photos · {d.at}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-emerald-400">
                      ${(d.totalCents / 100).toFixed(2)}
                    </p>
                    <span className="text-[9px] font-mono text-emerald-400/60 uppercase tracking-widest">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Client-facing preview */}
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Client sees</p>
            <div className="bg-surface-container rounded-2xl p-5 space-y-3 border border-outline-variant/10">
              {config.model === 'free' && (
                <div className="flex items-center gap-3">
                  <Unlock className="w-5 h-5 text-emerald-400" />
                  <p className="text-sm text-on-surface">All photos available for free download</p>
                </div>
              )}
              {config.model === 'per_photo' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <p className="text-sm text-on-surface">
                      ${(config.perPhotoCents / 100).toFixed(2)} per photo
                    </p>
                  </div>
                  {config.freePhotoLimit > 0 && (
                    <p className="text-xs text-on-surface-variant/50 pl-8">
                      First {config.freePhotoLimit} photos free
                    </p>
                  )}
                </div>
              )}
              {config.model === 'package' && (
                <div className="space-y-2">
                  {config.packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pkg.popular && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        <p className="text-sm font-mono text-on-surface">{pkg.name}</p>
                        <span className="text-[10px] font-mono text-on-surface-variant/40">
                          ({pkg.photoCount === 'all' ? 'all photos' : `${pkg.photoCount} photos`})
                        </span>
                      </div>
                      <p className="text-sm font-mono font-bold text-on-surface">
                        ${(pkg.priceCents / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
