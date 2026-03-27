'use client'

import { use, useState } from 'react'
import {
  Check,
  Copy,
  Archive,
  Save,
  X,
} from 'lucide-react'

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

const GALLERY_THEMES = [
  { id: 'dark-room', name: 'Dark Room', bg: '#151312', accent: '#ffb780' },
  { id: 'minimal-light', name: 'Minimal Light', bg: '#f5f0ec', accent: '#2c2928' },
  { id: 'editorial', name: 'Editorial', bg: '#1d1b1a', accent: '#95d1d1' },
  { id: 'amber-glow', name: 'Amber Glow', bg: '#211f1e', accent: '#d48441' },
]

export default function ProjectSettingsPage({ params }: SettingsPageProps) {
  const { id } = use(params)
  const [pricingModel, setPricingModel] = useState<'flat' | 'per-file'>('flat')
  const [previewAccess, setPreviewAccess] = useState(true)
  const [proofingAccess, setProofingAccess] = useState(true)
  const [deliveredAccess, setDeliveredAccess] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('dark-room')
  const [copied, setCopied] = useState(false)

  const magicLink = `https://view1.studio/g/${id}/preview?token=eyJhb...`

  const handleCopy = () => {
    navigator.clipboard.writeText(magicLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <p className="font-label text-[10px] uppercase tracking-widest text-[#d48441] mb-1">
          Settings
        </p>
        <h1 className="font-headline text-3xl font-bold text-[#e7e1df]">
          Workspace Configuration
        </h1>
        <p className="text-sm text-[#a18d80] mt-1">
          Manage project metadata, pricing, client access, and gallery appearance.
        </p>
      </div>

      {/* ── 12-col Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column (col-span-8) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Project Metadata Card */}
          <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6 space-y-5">
            <h2 className="font-headline text-base font-bold text-[#e7e1df]">
              Project Metadata
            </h2>

            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] block mb-1.5">
                  Client Name
                </label>
                <input
                  type="text"
                  defaultValue="Sarah & Michael Johnson"
                  className="w-full bg-[#211f1e] border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-[#e7e1df] placeholder-[#534439] focus:border-[#ffb780] focus:outline-none transition-colors"
                />
              </div>

              {/* Project Date */}
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] block mb-1.5">
                  Project Date
                </label>
                <input
                  type="text"
                  defaultValue="March 22, 2026"
                  className="w-full bg-[#211f1e] border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-[#e7e1df] placeholder-[#534439] focus:border-[#ffb780] focus:outline-none transition-colors"
                />
              </div>

              {/* Shoot Location */}
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] block mb-1.5">
                  Shoot Location
                </label>
                <input
                  type="text"
                  defaultValue="Villa Rosa, Sintra, Portugal"
                  className="w-full bg-[#211f1e] border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-[#e7e1df] placeholder-[#534439] focus:border-[#ffb780] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Pricing Configuration Card */}
          <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6 space-y-5">
            <h2 className="font-headline text-base font-bold text-[#e7e1df]">
              Pricing Configuration
            </h2>

            {/* Pricing model toggle cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Flat-Fee */}
              <button
                onClick={() => setPricingModel('flat')}
                className={`relative rounded-xl border p-5 text-left transition-colors ${
                  pricingModel === 'flat'
                    ? 'border-[#d48441] bg-[#d48441]/10'
                    : 'border-outline-variant bg-[#211f1e] hover:border-[#a18d80]'
                }`}
              >
                {pricingModel === 'flat' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#d48441] flex items-center justify-center">
                    <Check size={12} className="text-[#4e2600]" />
                  </div>
                )}
                <p className="font-headline text-sm font-bold text-[#e7e1df] mb-1">
                  Flat-Fee
                </p>
                <p className="font-headline text-2xl font-bold text-[#ffb780]">
                  $2,400
                </p>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mt-1">
                  Per Project
                </p>
              </button>

              {/* Per-File */}
              <button
                onClick={() => setPricingModel('per-file')}
                className={`relative rounded-xl border p-5 text-left transition-colors ${
                  pricingModel === 'per-file'
                    ? 'border-[#d48441] bg-[#d48441]/10'
                    : 'border-outline-variant bg-[#211f1e] hover:border-[#a18d80]'
                }`}
              >
                {pricingModel === 'per-file' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#d48441] flex items-center justify-center">
                    <Check size={12} className="text-[#4e2600]" />
                  </div>
                )}
                <p className="font-headline text-sm font-bold text-[#e7e1df] mb-1">
                  Per-File
                </p>
                <p className="font-headline text-2xl font-bold text-[#ffb780]">
                  $15
                </p>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mt-1">
                  Per File
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column (col-span-4) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Client Access Card */}
          <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6 space-y-5">
            <h2 className="font-headline text-base font-bold text-[#e7e1df]">
              Client Access
            </h2>

            <div className="space-y-4">
              {/* Preview Access */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e7e1df]">Preview Access</p>
                  <p className="text-[10px] text-[#a18d80]">
                    Client can view watermarked previews
                  </p>
                </div>
                <button
                  onClick={() => setPreviewAccess(!previewAccess)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    previewAccess ? 'bg-[#d48441]' : 'bg-[#373433]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      previewAccess ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Proofing */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e7e1df]">Proofing</p>
                  <p className="text-[10px] text-[#a18d80]">
                    Client can select favorites
                  </p>
                </div>
                <button
                  onClick={() => setProofingAccess(!proofingAccess)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    proofingAccess ? 'bg-[#d48441]' : 'bg-[#373433]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      proofingAccess ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Delivered */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e7e1df]">Delivered</p>
                  <p className="text-[10px] text-[#a18d80]">
                    Client can download final files
                  </p>
                </div>
                <button
                  onClick={() => setDeliveredAccess(!deliveredAccess)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    deliveredAccess ? 'bg-[#d48441]' : 'bg-[#373433]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      deliveredAccess ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Magic Link Invitation */}
          <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6 space-y-4">
            <h2 className="font-headline text-base font-bold text-[#e7e1df]">
              Magic Link Invitation
            </h2>
            <p className="text-xs text-[#a18d80]">
              Share this link with your client for instant gallery access.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#211f1e] border border-outline-variant rounded-xl px-3 py-2.5 overflow-hidden">
                <p className="text-xs text-[#a18d80] truncate font-label">
                  {magicLink}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 w-10 h-10 rounded-xl bg-[#211f1e] border border-outline-variant flex items-center justify-center text-[#d9c2b4] hover:text-[#ffb780] hover:border-[#ffb780]/40 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Gallery Theme Picker */}
          <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6 space-y-4">
            <h2 className="font-headline text-base font-bold text-[#e7e1df]">
              Gallery Theme
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {GALLERY_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative rounded-xl border p-3 transition-colors ${
                    selectedTheme === theme.id
                      ? 'border-[#d48441]'
                      : 'border-outline-variant hover:border-[#a18d80]'
                  }`}
                >
                  {/* Theme preview swatch */}
                  <div
                    className="w-full h-10 rounded-lg mb-2 flex items-end justify-end p-1.5"
                    style={{ backgroundColor: theme.bg }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                  <p className="text-[10px] text-[#e7e1df] font-label uppercase tracking-widest text-center">
                    {theme.name}
                  </p>
                  {selectedTheme === theme.id && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#d48441] flex items-center justify-center">
                      <Check size={10} className="text-[#4e2600]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant">
        <button className="flex items-center gap-2 rounded-xl border border-[#e7765f]/30 bg-[#e7765f]/10 px-5 py-2.5 text-sm text-[#ffb4a5] hover:bg-[#e7765f]/20 transition-colors">
          <Archive size={16} />
          Archive Project
        </button>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm text-[#a18d80] hover:text-[#e7e1df] hover:border-[#a18d80] transition-colors">
            <X size={16} />
            Discard Changes
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-6 py-2.5 text-sm font-bold text-[#4e2600] hover:opacity-90 transition-opacity">
            <Save size={16} />
            Save Configurations
          </button>
        </div>
      </div>
    </div>
  )
}
