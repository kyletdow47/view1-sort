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
  X,
  Heart,
  Star,
  Download,
  Tag,
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

interface PhotoData {
  index: number
  name: string
  category: string
  captureTime: string
  exposure: string
  iso: string
  focalLength: string
  camera: string
  hearts: number
  stars: number
  keywords: string[]
}

const PHOTO_DATA: PhotoData[] = [
  { index: 0, name: 'DSC_1000.JPG', category: 'Ceremony', captureTime: 'Jun 15 \u00b7 14:22:05', exposure: '1/250 \u00b7 f/2.8', iso: '400', focalLength: '85mm', camera: 'Sony A7IV', hearts: 12, stars: 4, keywords: ['Golden Hour', 'Vows', 'Emotion', 'Outdoor'] },
  { index: 1, name: 'DSC_1001.JPG', category: 'Portraits', captureTime: 'Jun 15 \u00b7 15:10:32', exposure: '1/500 \u00b7 f/1.8', iso: '200', focalLength: '50mm', camera: 'Sony A7IV', hearts: 24, stars: 8, keywords: ['Bokeh', 'Portrait', 'Smiling', 'Natural Light'] },
  { index: 2, name: 'DSC_1002.JPG', category: 'Details', captureTime: 'Jun 15 \u00b7 10:45:18', exposure: '1/125 \u00b7 f/4.0', iso: '800', focalLength: '100mm', camera: 'Sony A7IV', hearts: 6, stars: 2, keywords: ['Macro', 'Rings', 'Detail', 'Close-up'] },
  { index: 3, name: 'DSC_1003.JPG', category: 'Reception', captureTime: 'Jun 15 \u00b7 19:30:44', exposure: '1/60 \u00b7 f/2.0', iso: '1600', focalLength: '35mm', camera: 'Sony A7IV', hearts: 18, stars: 5, keywords: ['Dance', 'Party', 'Indoor', 'Low Light'] },
  { index: 4, name: 'DSC_1004.JPG', category: 'Ceremony', captureTime: 'Jun 15 \u00b7 14:05:12', exposure: '1/320 \u00b7 f/2.8', iso: '320', focalLength: '70mm', camera: 'Sony A7IV', hearts: 9, stars: 3, keywords: ['Aisle', 'Walking', 'Emotion', 'Outdoor'] },
  { index: 5, name: 'DSC_1005.JPG', category: 'Portraits', captureTime: 'Jun 15 \u00b7 16:22:08', exposure: '1/400 \u00b7 f/2.0', iso: '250', focalLength: '85mm', camera: 'Sony A7IV', hearts: 31, stars: 11, keywords: ['Couple', 'Golden Hour', 'Backlit', 'Romance'] },
  { index: 6, name: 'DSC_1006.JPG', category: 'Reception', captureTime: 'Jun 15 \u00b7 20:15:33', exposure: '1/80 \u00b7 f/2.8', iso: '2000', focalLength: '24mm', camera: 'Sony A7IV', hearts: 15, stars: 4, keywords: ['Toast', 'Speech', 'Indoor', 'Candid'] },
  { index: 7, name: 'DSC_1007.JPG', category: 'Behind the Scenes', captureTime: 'Jun 15 \u00b7 09:15:55', exposure: '1/200 \u00b7 f/3.5', iso: '500', focalLength: '35mm', camera: 'Sony A7IV', hearts: 7, stars: 1, keywords: ['Prep', 'Getting Ready', 'Candid', 'Morning'] },
  { index: 8, name: 'DSC_1008.JPG', category: 'Ceremony', captureTime: 'Jun 15 \u00b7 14:35:20', exposure: '1/250 \u00b7 f/2.8', iso: '400', focalLength: '70mm', camera: 'Sony A7IV', hearts: 20, stars: 7, keywords: ['Kiss', 'Outdoor', 'Celebration', 'Emotion'] },
  { index: 9, name: 'DSC_1009.JPG', category: 'Details', captureTime: 'Jun 15 \u00b7 11:02:40', exposure: '1/160 \u00b7 f/5.6', iso: '640', focalLength: '100mm', camera: 'Sony A7IV', hearts: 4, stars: 1, keywords: ['Flowers', 'Arrangement', 'Color', 'Detail'] },
  { index: 10, name: 'DSC_1010.JPG', category: 'Portraits', captureTime: 'Jun 15 \u00b7 15:45:10', exposure: '1/640 \u00b7 f/1.4', iso: '100', focalLength: '85mm', camera: 'Sony A7IV', hearts: 28, stars: 9, keywords: ['Solo', 'Bride', 'Natural Light', 'Elegant'] },
  { index: 11, name: 'DSC_1011.JPG', category: 'Reception', captureTime: 'Jun 15 \u00b7 21:00:15', exposure: '1/50 \u00b7 f/2.8', iso: '3200', focalLength: '24mm', camera: 'Sony A7IV', hearts: 22, stars: 6, keywords: ['Sparklers', 'Exit', 'Night', 'Celebration'] },
  { index: 12, name: 'DSC_1012.JPG', category: 'Behind the Scenes', captureTime: 'Jun 15 \u00b7 08:30:05', exposure: '1/160 \u00b7 f/4.0', iso: '800', focalLength: '50mm', camera: 'Sony A7IV', hearts: 5, stars: 2, keywords: ['Setup', 'Venue', 'Morning', 'Wide'] },
  { index: 13, name: 'DSC_1013.JPG', category: 'Ceremony', captureTime: 'Jun 15 \u00b7 14:50:38', exposure: '1/320 \u00b7 f/2.8', iso: '320', focalLength: '200mm', camera: 'Sony A7IV', hearts: 16, stars: 5, keywords: ['Crowd', 'Reaction', 'Candid', 'Tele'] },
]

const MOCK_COMMENTS = [
  {
    name: 'Sarah Johnson (Client)',
    time: '2h ago',
    text: 'This is absolutely gorgeous! Can we get a few extra edits on this one?',
    isStudio: false,
  },
  {
    name: 'Alex Rivera (Studio)',
    time: '1h ago',
    text: "Of course! I'll add it to the retouching queue. Should be ready by tomorrow.",
    isStudio: true,
  },
  {
    name: 'Mike Johnson (Client)',
    time: '45m ago',
    text: 'Thank you so much, we love how these are turning out!',
    isStudio: false,
  },
]

/* Deterministic placeholder colour from index */
function placeholderBg(i: number): string {
  const hues = [25, 180, 340, 50, 210, 290, 130, 10, 260, 160]
  return `hsl(${hues[i % hues.length]}, 22%, 22%)`
}

function PhotoCell({
  index,
  className = '',
  isSelected,
  onClick,
}: {
  index: number
  className?: string
  isSelected?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl group cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-[#ffb780] ring-offset-2 ring-offset-[#151312]' : ''
      } ${className}`}
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
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null)

  void id // consumed

  const handlePhotoClick = (index: number) => {
    const photo = PHOTO_DATA.find((p) => p.index === index)
    if (photo) {
      setSelectedPhoto((prev) => (prev?.index === index ? null : photo))
    }
  }

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      {/* -- Sticky Top Nav -- */}
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

      {/* -- Hero Section -- */}
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

      {/* -- Category Filter Chips -- */}
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

      {/* -- Main Content: Grid + Inspector -- */}
      <section className="max-w-[1440px] mx-auto px-6 pb-8">
        <div className={`flex gap-6 ${selectedPhoto ? '' : ''}`}>
          {/* Photo Grid - shrinks when inspector is open */}
          <div className={`transition-all duration-500 ${selectedPhoto ? 'flex-1 min-w-0' : 'w-full'}`}>
            {/* Row 1: large feature (2col x 2row) + vertical feature + 2 squares */}
            <div
              className={`grid grid-rows-2 gap-3 mb-3 ${
                selectedPhoto ? 'grid-cols-3' : 'grid-cols-4'
              }`}
              style={{ height: selectedPhoto ? '480px' : '560px' }}
            >
              {/* Large feature spanning 2 cols, 2 rows */}
              <div className="col-span-2 row-span-2">
                <PhotoCell
                  index={0}
                  className="w-full h-full"
                  isSelected={selectedPhoto?.index === 0}
                  onClick={() => handlePhotoClick(0)}
                />
              </div>
              {/* Vertical feature spanning 1 col, 2 rows */}
              {!selectedPhoto && (
                <div className="col-span-1 row-span-2">
                  <PhotoCell
                    index={1}
                    className="w-full h-full"
                    isSelected={false}
                    onClick={() => handlePhotoClick(1)}
                  />
                </div>
              )}
              {/* Two stacked squares */}
              <div className="col-span-1 row-span-1">
                <PhotoCell
                  index={2}
                  className="w-full h-full"
                  isSelected={selectedPhoto?.index === 2}
                  onClick={() => handlePhotoClick(2)}
                />
              </div>
              <div className="col-span-1 row-span-1">
                <PhotoCell
                  index={3}
                  className="w-full h-full"
                  isSelected={selectedPhoto?.index === 3}
                  onClick={() => handlePhotoClick(3)}
                />
              </div>
            </div>

            {/* Row 2: equal squares */}
            <div
              className={`grid gap-3 mb-3 ${selectedPhoto ? 'grid-cols-3' : 'grid-cols-4'}`}
              style={{ height: selectedPhoto ? '220px' : '260px' }}
            >
              {(selectedPhoto ? [4, 5, 6] : [4, 5, 6, 7]).map((i) => (
                <PhotoCell
                  key={i}
                  index={i}
                  className="w-full h-full"
                  isSelected={selectedPhoto?.index === i}
                  onClick={() => handlePhotoClick(i)}
                />
              ))}
            </div>

            {/* Row 3: wide panoramic + squares */}
            <div
              className={`grid gap-3 mb-3 ${selectedPhoto ? 'grid-cols-3' : 'grid-cols-4'}`}
              style={{ height: selectedPhoto ? '240px' : '280px' }}
            >
              <div className="col-span-2">
                <PhotoCell
                  index={8}
                  className="w-full h-full"
                  isSelected={selectedPhoto?.index === 8}
                  onClick={() => handlePhotoClick(8)}
                />
              </div>
              <PhotoCell
                index={9}
                className="w-full h-full"
                isSelected={selectedPhoto?.index === 9}
                onClick={() => handlePhotoClick(9)}
              />
              {!selectedPhoto && (
                <PhotoCell
                  index={10}
                  className="w-full h-full"
                  isSelected={false}
                  onClick={() => handlePhotoClick(10)}
                />
              )}
            </div>

            {/* Row 4 */}
            <div
              className={`grid gap-3 ${selectedPhoto ? 'grid-cols-3' : 'grid-cols-4'}`}
              style={{ height: selectedPhoto ? '220px' : '260px' }}
            >
              <PhotoCell
                index={11}
                className="w-full h-full"
                isSelected={selectedPhoto?.index === 11}
                onClick={() => handlePhotoClick(11)}
              />
              {!selectedPhoto && (
                <PhotoCell
                  index={12}
                  className="w-full h-full"
                  isSelected={false}
                  onClick={() => handlePhotoClick(12)}
                />
              )}
              <div className="col-span-2">
                <PhotoCell
                  index={13}
                  className="w-full h-full"
                  isSelected={selectedPhoto?.index === 13}
                  onClick={() => handlePhotoClick(13)}
                />
              </div>
            </div>
          </div>

          {/* -- Inspector Panel -- */}
          {selectedPhoto && (
            <aside className="w-[350px] flex-shrink-0">
              <div className="bg-[#1d1b1a] rounded-3xl border border-[#534439]/30 overflow-hidden sticky top-20">
                {/* Image preview */}
                <div
                  className="aspect-square relative"
                  style={{ backgroundColor: placeholderBg(selectedPhoto.index) }}
                >
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Image number overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] uppercase tracking-widest font-medium text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                      IMG_{String(1000 + selectedPhoto.index).padStart(4, '0')}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-420px)] overflow-y-auto">
                  {/* Filename + category */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-[#e7e1df]">
                        {selectedPhoto.name}
                      </h3>
                      <p className="text-[10px] font-mono text-[#a18d80]/60 uppercase tracking-widest">
                        {selectedPhoto.captureTime}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#ffb780]/10 text-[#ffb780] text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                      {selectedPhoto.category}
                    </span>
                  </div>

                  {/* EXIF Data 2x2 grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#151312] p-3 rounded-xl border border-[#534439]/20">
                      <p className="text-[9px] font-mono text-[#a18d80]/60 uppercase tracking-widest mb-1">
                        Exposure
                      </p>
                      <p className="text-xs font-mono font-bold text-[#e7e1df]">
                        {selectedPhoto.exposure}
                      </p>
                    </div>
                    <div className="bg-[#151312] p-3 rounded-xl border border-[#534439]/20">
                      <p className="text-[9px] font-mono text-[#a18d80]/60 uppercase tracking-widest mb-1">
                        ISO
                      </p>
                      <p className="text-xs font-mono font-bold text-[#e7e1df]">
                        {selectedPhoto.iso}
                      </p>
                    </div>
                    <div className="bg-[#151312] p-3 rounded-xl border border-[#534439]/20">
                      <p className="text-[9px] font-mono text-[#a18d80]/60 uppercase tracking-widest mb-1">
                        Focal Length
                      </p>
                      <p className="text-xs font-mono font-bold text-[#e7e1df]">
                        {selectedPhoto.focalLength}
                      </p>
                    </div>
                    <div className="bg-[#151312] p-3 rounded-xl border border-[#534439]/20">
                      <p className="text-[9px] font-mono text-[#a18d80]/60 uppercase tracking-widest mb-1">
                        Camera
                      </p>
                      <p className="text-xs font-mono font-bold text-[#e7e1df]">
                        {selectedPhoto.camera}
                      </p>
                    </div>
                  </div>

                  {/* Client Reactions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono text-[#a18d80]/60 uppercase tracking-widest font-bold">
                        Client Reactions
                      </p>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-2 py-1 bg-[#373433]/60 hover:bg-[#ffb780]/10 hover:text-[#ffb780] rounded-md border border-[#534439]/20 transition-all group">
                          <Heart className="w-3 h-3 group-hover:fill-[#ffb780]" />
                          <span className="text-[9px] font-mono font-bold">
                            {selectedPhoto.hearts}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 bg-[#373433]/60 hover:bg-[#95d1d1]/10 hover:text-[#95d1d1] rounded-md border border-[#534439]/20 transition-all group">
                          <Star className="w-3 h-3 group-hover:fill-[#95d1d1]" />
                          <span className="text-[9px] font-mono font-bold">
                            {selectedPhoto.stars}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collaboration Thread */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono text-[#a18d80]/60 uppercase tracking-widest font-bold">
                      Collaboration Thread
                    </p>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {MOCK_COMMENTS.map((comment, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border space-y-1 ${
                            comment.isStudio
                              ? 'bg-[#ffb780]/5 border-[#ffb780]/10'
                              : 'bg-[#151312] border-[#534439]/20'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                  comment.isStudio
                                    ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                                    : 'bg-[#2c2928] text-[#d9c2b4]'
                                }`}
                              >
                                {comment.name.charAt(0)}
                              </div>
                              <span className="text-[9px] font-bold text-[#ffb780]">
                                {comment.name}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono text-[#a18d80]/60">
                              {comment.time}
                            </span>
                          </div>
                          <p className="text-xs text-[#d9c2b4]/80 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full bg-[#151312] border border-[#534439]/30 rounded-xl pl-4 pr-10 py-2 text-xs text-[#e7e1df] placeholder:text-[#a18d80]/40 focus:outline-none focus:ring-2 focus:ring-[#ffb780]/20 transition-all"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#ffb780] hover:bg-[#ffb780]/10 rounded-lg transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Keywords */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono text-[#a18d80]/60 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> AI Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.keywords.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-[#373433]/60 text-[9px] font-mono font-bold uppercase tracking-widest rounded-full border border-[#534439]/20 text-[#d9c2b4]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-[#534439]/20">
                    <button className="flex-1 py-3 bg-[#2c2928] hover:bg-[#373433] rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-[#d9c2b4] transition-all">
                      Edit Metadata
                    </button>
                    <button className="flex-1 py-3 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-1.5">
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* -- Floating Paywall Bar -- */}
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

      {/* -- Footer -- */}
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
