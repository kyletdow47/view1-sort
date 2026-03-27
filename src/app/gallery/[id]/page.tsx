'use client'

import { use, useState } from 'react'
import {
  Bell,
  Maximize2,
  Camera,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react'

interface GalleryPageProps {
  params: Promise<{ id: string }>
}

const CATEGORIES = [
  { label: 'All Moments', count: 428 },
  { label: 'Ceremony', count: 86 },
  { label: 'Reception', count: 124 },
  { label: 'Portraits', count: 98 },
  { label: 'Behind the Scenes', count: 120 },
]

const NAV_TABS = ['Overview', 'Sorting', 'Selection', 'Delivery']

/* Deterministic placeholder colour from index */
function placeholderBg(i: number): string {
  const hues = [25, 180, 340, 50, 210, 290, 130, 10, 260, 160]
  return `hsl(${hues[i % hues.length]}, 22%, 22%)`
}

function PhotoCell({
  index,
  className = '',
}: {
  index: number
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl group cursor-pointer ${className}`}
      style={{ backgroundColor: placeholderBg(index) }}
    >
      {/* hover zoom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 scale-100 group-hover:scale-105 transition-transform duration-500" />
      {/* fullscreen icon */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 hover:text-white">
          <Maximize2 size={14} />
        </div>
      </div>
      {/* image number label */}
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-widest font-medium text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
          IMG_{String(1000 + index).padStart(4, '0')}
        </span>
      </div>
    </div>
  )
}

export default function GalleryPage({ params }: GalleryPageProps) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('Overview')
  const [activeCategory, setActiveCategory] = useState('All Moments')

  void id // consumed

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      {/* ── Sticky Top Nav ── */}
      <header className="sticky top-0 z-50 bg-[#1d1b1a]/90 backdrop-blur-md border-b border-[#534439]/40">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 h-14">
          {/* Left: logo + tabs */}
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold bg-gradient-to-br from-[#ffb780] to-[#d48441] bg-clip-text text-transparent">
              PhotoSorter
            </span>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-[#2c2928] text-[#ffb780]'
                      : 'text-[#a18d80] hover:text-[#d9c2b4] hover:bg-[#211f1e]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#a18d80] hidden sm:block cursor-pointer hover:text-[#d9c2b4] transition-colors">
              Export
            </span>
            <button className="bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-semibold text-sm px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
              Publish
            </button>
            <button className="relative p-2 text-[#a18d80] hover:text-[#d9c2b4] transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e7765f]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb780] to-[#d48441] flex items-center justify-center text-[#4e2600] text-xs font-bold">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative w-full" style={{ height: '870px' }}>
        {/* placeholder image background */}
        <div className="absolute inset-0 bg-[#211f1e]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 70%, hsl(25,30%,18%) 0%, #151312 80%)',
          }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151312] via-[#151312]/60 to-transparent" />

        {/* hero content */}
        <div className="relative h-full max-w-[1440px] mx-auto px-6 flex flex-col justify-end pb-16">
          <span className="text-[10px] uppercase tracking-widest font-medium text-[#ffb780] mb-3">
            COLLECTION 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
            Johnson Wedding
          </h1>
          <p className="max-w-xl text-[#d9c2b4] text-base leading-relaxed mb-8">
            A beautiful summer celebration at the Grand Estate. Capturing every
            precious moment from the morning preparations through the evening
            reception and sparkler send-off.
          </p>
          {/* Progress bar */}
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80]">
                Gallery Progress
              </span>
              <span className="text-sm font-medium text-[#ffb780]">
                85% Complete
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#2c2928] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441]"
                style={{ width: '85%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Chips ── */}
      <section className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.label
                  ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                  : 'bg-[#2c2928] text-[#d9c2b4] hover:bg-[#373433]'
              }`}
            >
              {cat.label}
              <span
                className={`text-xs ${
                  activeCategory === cat.label
                    ? 'text-[#4e2600]/70'
                    : 'text-[#a18d80]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Bento Photo Grid ── */}
      <section className="max-w-[1440px] mx-auto px-6 pb-8">
        {/* Row 1: large feature (2col x 2row) + vertical feature + 2 squares */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 mb-3" style={{ height: '560px' }}>
          {/* Large feature spanning 2 cols, 2 rows */}
          <div className="col-span-2 row-span-2">
            <PhotoCell index={0} className="w-full h-full" />
          </div>
          {/* Vertical feature spanning 1 col, 2 rows */}
          <div className="col-span-1 row-span-2">
            <PhotoCell index={1} className="w-full h-full" />
          </div>
          {/* Two stacked squares */}
          <div className="col-span-1 row-span-1">
            <PhotoCell index={2} className="w-full h-full" />
          </div>
          <div className="col-span-1 row-span-1">
            <PhotoCell index={3} className="w-full h-full" />
          </div>
        </div>

        {/* Row 2: 4 equal squares */}
        <div className="grid grid-cols-4 gap-3 mb-3" style={{ height: '260px' }}>
          {[4, 5, 6, 7].map((i) => (
            <PhotoCell key={i} index={i} className="w-full h-full" />
          ))}
        </div>

        {/* Row 3: wide panoramic + 2 squares */}
        <div className="grid grid-cols-4 gap-3 mb-3" style={{ height: '280px' }}>
          <div className="col-span-2">
            <PhotoCell index={8} className="w-full h-full" />
          </div>
          <PhotoCell index={9} className="w-full h-full" />
          <PhotoCell index={10} className="w-full h-full" />
        </div>

        {/* Row 4: 3 + 1 wide */}
        <div className="grid grid-cols-4 gap-3" style={{ height: '260px' }}>
          <PhotoCell index={11} className="w-full h-full" />
          <PhotoCell index={12} className="w-full h-full" />
          <div className="col-span-2">
            <PhotoCell index={13} className="w-full h-full" />
          </div>
        </div>
      </section>

      {/* ── Floating Paywall Bar ── */}
      <div className="sticky bottom-0 z-40">
        <div className="bg-[#1d1b1a]/95 backdrop-blur-md border-t border-[#534439]/40">
          <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
            {/* Left: avatar stack + info */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#1d1b1a] bg-gradient-to-br from-[#ffb780] to-[#d48441]"
                    style={{ zIndex: 4 - i }}
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#1d1b1a] bg-[#2c2928] flex items-center justify-center text-[10px] font-bold text-[#a18d80] z-0">
                  +420
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#e7e1df]">
                  Full Resolution Gallery
                </p>
                <p className="text-xs text-[#a18d80]">
                  428 Images &middot; 4.2 GB
                </p>
              </div>
            </div>
            {/* Right: buttons */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg border border-[#534439] text-sm font-medium text-[#d9c2b4] hover:bg-[#2c2928] transition-colors">
                Request Edits
              </button>
              <button className="bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Unlock Downloads ($450)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-[#1d1b1a] border-t border-[#534439]/40 mt-12">
        <div className="max-w-[1440px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Branding */}
            <div>
              <span className="text-xl font-bold bg-gradient-to-br from-[#ffb780] to-[#d48441] bg-clip-text text-transparent">
                PhotoSorter
              </span>
              <p className="text-sm text-[#a18d80] mt-3 leading-relaxed">
                Professional photo delivery and gallery management for modern
                photographers. Powered by AI sorting and seamless client
                experiences.
              </p>
            </div>

            {/* Project Details */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-4">
                Project Details
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#d9c2b4]">
                  <Calendar size={14} className="text-[#ffb780]" />
                  June 15, 2024
                </li>
                <li className="flex items-center gap-3 text-sm text-[#d9c2b4]">
                  <MapPin size={14} className="text-[#ffb780]" />
                  Grand Estate, Napa Valley, CA
                </li>
                <li className="flex items-center gap-3 text-sm text-[#d9c2b4]">
                  <Camera size={14} className="text-[#ffb780]" />
                  Sony A7IV + 24-70mm f/2.8 GM
                </li>
              </ul>
            </div>

            {/* Contact Studio */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-[#a18d80] mb-4">
                Contact Studio
              </h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-[#d9c2b4]">
                  <Mail size={14} className="text-[#ffb780]" />
                  studio@example.com
                </li>
                <li className="flex items-center gap-3 text-sm text-[#d9c2b4]">
                  <Phone size={14} className="text-[#ffb780]" />
                  +1 (555) 123-4567
                </li>
              </ul>
              <button className="flex items-center gap-2 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                Book a Session
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#534439]/40 mt-12 pt-6 text-center">
            <p className="text-xs text-[#a18d80]">
              &copy; 2024 PhotoSorter. All rights reserved. Images are
              copyright of the photographer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
