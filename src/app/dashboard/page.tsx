'use client'

import Link from 'next/link'
import {
  Plus,
  Camera,
  DollarSign,
  HardDrive,
  FolderOpen,
  CreditCard,
  LinkIcon,
  Eye,
  Upload,
  AlertTriangle,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react'

const MOCK_PROJECTS = [
  {
    id: 'demo-1',
    name: 'Johnson Wedding',
    preset: 'Wedding',
    status: 'Published',
    photoCount: 847,
    gradientFrom: '#3d2b1f',
    gradientTo: '#1f1510',
  },
  {
    id: 'demo-2',
    name: 'Oak Street Listing',
    preset: 'Real Estate',
    status: 'Draft',
    photoCount: 156,
    gradientFrom: '#1f2d3d',
    gradientTo: '#101820',
  },
  {
    id: 'demo-3',
    name: 'Portugal Travel Series',
    preset: 'Travel',
    status: 'Active',
    photoCount: 432,
    gradientFrom: '#2d3d1f',
    gradientTo: '#182010',
  },
  {
    id: 'demo-4',
    name: 'Acme Corp Headshots',
    preset: 'Corporate',
    status: 'Completed',
    photoCount: 64,
    gradientFrom: '#2b2b3d',
    gradientTo: '#151520',
  },
]

const STATUS_STYLES: Record<string, string> = {
  Published: 'bg-[#0c5252]/30 text-[#95d1d1]',
  Draft: 'bg-[#d48441]/20 text-[#ffb780]',
  Active: 'bg-[#0c5252]/30 text-[#95d1d1]',
  Completed: 'bg-[#534439]/40 text-[#d9c2b4]',
}

const RECENT_ACTIVITY = [
  {
    icon: CreditCard,
    text: 'Payment received from Sarah M.',
    detail: '$2,400.00',
    time: '2 hours ago',
    color: '#95d1d1',
  },
  {
    icon: Eye,
    text: 'Gallery viewed by client',
    detail: 'Johnson Wedding',
    time: '5 hours ago',
    color: '#ffb780',
  },
  {
    icon: DollarSign,
    text: 'Invoice sent',
    detail: 'Acme Corp — $1,200',
    time: 'Yesterday',
    color: '#95d1d1',
  },
  {
    icon: Upload,
    text: '156 files uploaded',
    detail: 'Oak Street Listing',
    time: 'Yesterday',
    color: '#d48441',
  },
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ── Hero + Quick Actions Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-[#534439]/40">
          {/* Background gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #2c2928 0%, #1d1b1a 40%, #211f1e 70%, #d48441 150%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#d48441]/10" />
          <div className="relative p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4] mb-1">
              Dashboard
            </p>
            <h1 className="font-headline text-3xl font-bold text-[#e7e1df] mb-1">
              Welcome back
            </h1>
            <p className="text-[#a18d80] text-sm mb-8">
              Here is what is happening across your projects today.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-1">
                  Total Revenue
                </p>
                <p className="font-headline text-2xl font-bold text-[#e7e1df]">
                  $12,450
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-1">
                  Active Storage
                </p>
                <p className="font-headline text-2xl font-bold text-[#e7e1df]">
                  84.2 GB
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#a18d80] mb-1">
                  Active Projects
                </p>
                <p className="font-headline text-2xl font-bold text-[#e7e1df]">
                  14
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6 flex flex-col gap-4">
          <h2 className="font-headline text-sm font-bold text-[#e7e1df]">
            Quick Actions
          </h2>

          <button className="w-full flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-4 py-3 text-[#4e2600] font-headline text-sm font-bold hover:opacity-90 transition-opacity">
            <Plus size={18} />
            New Project
          </button>

          <button className="w-full flex items-center gap-3 rounded-xl bg-[#211f1e] border border-outline-variant px-4 py-3 text-[#e7e1df] text-sm hover:bg-[#2c2928] transition-colors">
            <LinkIcon size={16} className="text-[#95d1d1]" />
            Send Booking Link
          </button>

          <button className="w-full flex items-center gap-3 rounded-xl bg-[#211f1e] border border-outline-variant px-4 py-3 text-[#e7e1df] text-sm hover:bg-[#2c2928] transition-colors">
            <CreditCard size={16} className="text-[#ffb780]" />
            Go to Stripe Connect
          </button>

          {/* Storage Alert */}
          <div className="mt-auto rounded-xl bg-[#d48441]/10 border border-[#d48441]/20 px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={16} className="text-[#ffb780] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#ffb780]">Storage at 84%</p>
              <p className="text-[10px] text-[#a18d80] mt-0.5">
                Consider archiving older projects to free space.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Project Overview + Activity Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-[#e7e1df]">
              Project Overview
            </h2>
            <Link
              href="/dashboard"
              className="text-xs text-[#ffb780] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_PROJECTS.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                className="group rounded-2xl border border-outline-variant bg-[#1d1b1a] overflow-hidden hover:border-[#ffb780]/40 transition-colors"
              >
                {/* Cover */}
                <div
                  className="h-32 flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})`,
                  }}
                >
                  <Camera className="text-[#a18d80]/30" size={40} />
                </div>
                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-headline text-sm font-bold text-[#e7e1df] truncate group-hover:text-[#ffb780] transition-colors">
                      {project.name}
                    </h3>
                    <span
                      className={`shrink-0 font-label text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLES[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[#a18d80]">
                    <span className="font-label text-[10px] uppercase tracking-widest">
                      {project.preset}
                    </span>
                    <span className="text-[#534439]">|</span>
                    <span className="flex items-center gap-1 text-xs">
                      <ImageIcon size={10} />
                      {project.photoCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Create New Gallery Card */}
            <button className="rounded-2xl border-2 border-dashed border-outline-variant bg-transparent min-h-[220px] flex flex-col items-center justify-center gap-3 text-[#a18d80] hover:text-[#ffb780] hover:border-[#ffb780]/40 transition-colors">
              <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center">
                <Plus size={24} />
              </div>
              <span className="font-headline text-sm font-bold">
                Create New Gallery
              </span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-outline-variant bg-[#1d1b1a] p-6">
          <h2 className="font-headline text-sm font-bold text-[#e7e1df] mb-5">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#e7e1df] truncate">{item.text}</p>
                  <p className="text-xs text-[#a18d80] truncate">{item.detail}</p>
                  <p className="font-label text-[10px] text-[#534439] mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
