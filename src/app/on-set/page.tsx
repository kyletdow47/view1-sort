'use client'

import React, { useState } from 'react'
import {
  Camera,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  MapPin,
  Sun,
  Moon,
  Sunset,
  Users,
  Sparkles,
  ChevronRight,
  MoreVertical,
  Trash2,
  Bell,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ShotItem {
  id: string
  label: string
  category: string
  completed: boolean
  notes?: string
}

interface ShootSession {
  id: string
  project: string
  client: string
  location: string
  time: string
  type: 'wedding' | 'portrait' | 'commercial' | 'event'
  lightCondition: 'golden_hour' | 'midday' | 'overcast' | 'blue_hour' | 'indoor'
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_SESSION: ShootSession = {
  id: 'shoot-1',
  project: 'Johnson Wedding',
  client: 'Sarah & Mike Johnson',
  location: 'Malibu Beach, CA',
  time: '4:30 PM',
  type: 'wedding',
  lightCondition: 'golden_hour',
}

const SHOT_LIST_DEFAULTS: ShotItem[] = [
  { id: 's1', label: 'Bride getting ready — detail shots', category: 'Getting Ready', completed: true },
  { id: 's2', label: 'Groom with groomsmen — candid', category: 'Getting Ready', completed: true },
  { id: 's3', label: 'Ceremony wide establishing shot', category: 'Ceremony', completed: false },
  { id: 's4', label: 'Ring exchange close-up', category: 'Ceremony', completed: false },
  { id: 's5', label: 'First kiss', category: 'Ceremony', completed: false },
  { id: 's6', label: 'Couple portrait — golden hour beach', category: 'Portraits', completed: false },
  { id: 's7', label: 'Full wedding party group shot', category: 'Family', completed: false },
  { id: 's8', label: 'Reception table detail', category: 'Details', completed: false },
  { id: 's9', label: 'First dance wide + tight', category: 'Reception', completed: false },
  { id: 's10', label: 'Cake cutting', category: 'Reception', completed: false },
]

const LIGHT_CONFIG: Record<ShootSession['lightCondition'], { label: string; icon: React.ElementType; color: string; tip: string }> = {
  golden_hour: { label: 'Golden Hour', icon: Sun, color: 'text-amber-400', tip: 'Shoot into the sun for rim lighting. Watch for harsh shadows.' },
  midday:      { label: 'Midday', icon: Sun, color: 'text-yellow-400', tip: 'Seek open shade. Reflector recommended for portraits.' },
  overcast:    { label: 'Overcast', icon: Sun, color: 'text-sky-400', tip: 'Flat, soft light — great for skin tones. Slightly boost contrast in post.' },
  blue_hour:   { label: 'Blue Hour', icon: Moon, color: 'text-indigo-400', tip: 'Fast lens at f/1.8, bump ISO. Dramatic sky backgrounds.' },
  indoor:      { label: 'Indoor', icon: Sunset, color: 'text-orange-400', tip: 'Check for mixed color temps. Set custom WB to tungsten or use gels.' },
}

/* ─── Shot item row ──────────────────────────────────────────────────────── */

function ShotRow({
  shot,
  onToggle,
  onDelete,
}: {
  shot: ShotItem
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className={['flex items-center gap-3 py-3 border-b border-outline-variant/10 group transition-opacity', shot.completed ? 'opacity-50' : ''].join(' ')}>
      <button onClick={onToggle} className="flex-shrink-0">
        {shot.completed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          : <Circle className="w-5 h-5 text-on-surface-variant/30 hover:text-primary transition-colors" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={['text-sm font-mono', shot.completed ? 'line-through text-on-surface-variant/40' : 'text-on-surface'].join(' ')}>
          {shot.label}
        </p>
        <span className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest">{shot.category}</span>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-on-surface-variant/30 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function OnSetPage() {
  const [shots, setShots] = useState<ShotItem[]>(SHOT_LIST_DEFAULTS)
  const [newShot, setNewShot] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const session = MOCK_SESSION
  const light = LIGHT_CONFIG[session.lightCondition]

  const toggleShot = (id: string) =>
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)))

  const deleteShot = (id: string) =>
    setShots((prev) => prev.filter((s) => s.id !== id))

  const addShot = () => {
    if (!newShot.trim()) return
    setShots((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        label: newShot.trim(),
        category: activeCategory ?? 'General',
        completed: false,
      },
    ])
    setNewShot('')
  }

  const categories = [...new Set(shots.map((s) => s.category))]
  const filtered = activeCategory ? shots.filter((s) => s.category === activeCategory) : shots
  const completedCount = shots.filter((s) => s.completed).length
  const progress = Math.round((completedCount / shots.length) * 100)

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-outline-variant/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-headline font-bold text-on-surface">On-Set</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-surface-container transition-colors relative">
              <Bell className="w-5 h-5 text-on-surface-variant/60" />
            </button>
            <button className="p-2 rounded-xl hover:bg-surface-container transition-colors">
              <MoreVertical className="w-5 h-5 text-on-surface-variant/60" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* Session card */}
        <div className="bg-surface-container rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-headline font-extrabold tracking-tighter text-on-surface">
                {session.project}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant/60 font-mono">
                <Users className="w-3.5 h-3.5" />
                {session.client}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant/60 font-mono">
                <MapPin className="w-3.5 h-3.5" />
                {session.location}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-sm font-mono text-on-surface">
                <Clock className="w-4 h-4 text-primary" />
                {session.time}
              </div>
            </div>
          </div>

          {/* Light condition */}
          <div className={`flex items-start gap-3 p-3 bg-surface-container-high rounded-xl`}>
            <light.icon className={`w-5 h-5 ${light.color} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-xs font-mono font-bold ${light.color}`}>{light.label}</p>
              <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{light.tip}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Shot list</p>
            <span className="text-xs font-mono text-on-surface-variant/60">
              {completedCount} / {shots.length}
            </span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveCategory(null)}
            className={['flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all', !activeCategory ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'].join(' ')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={['flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all', activeCategory === cat ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Shot list */}
        <div className="bg-surface-container rounded-2xl px-4">
          {filtered.map((shot) => (
            <ShotRow
              key={shot.id}
              shot={shot}
              onToggle={() => toggleShot(shot.id)}
              onDelete={() => deleteShot(shot.id)}
            />
          ))}
        </div>

        {/* Add shot */}
        <div className="flex gap-2">
          <input
            value={newShot}
            onChange={(e) => setNewShot(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addShot()}
            placeholder="Add a shot..."
            className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={addShot}
            disabled={!newShot.trim()}
            className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-all flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          {[
            { label: 'AI Sort now', icon: Sparkles, href: '/dashboard/ai-sort', color: 'bg-primary/10 text-primary' },
            { label: 'View gallery', icon: Camera, href: '/dashboard/gallery', color: 'bg-surface-container text-on-surface' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`flex items-center gap-3 p-4 rounded-2xl ${action.color} font-headline font-bold text-sm transition-opacity hover:opacity-80`}
            >
              <action.icon className="w-5 h-5 flex-shrink-0" />
              {action.label}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
