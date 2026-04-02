'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FolderOpen,
  CreditCard,
  Star,
  MessageSquare,
  Settings,
  Crown,
  CheckCircle2,
  Clock,
  ExternalLink,
  Bell,
  BarChart3,
  Target,
  Zap,
  Users,
  FileText,
  Plus,
  Check,
  AlertCircle,
  Globe,
  Copy,
  Eye,
  TrendingUp,
  Camera,
  MapPin,
  Hash,
} from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TabId = 'overview' | 'projects' | 'invoices' | 'statistics' | 'tasks' | 'portal'
type ProjectStatus = 'completed' | 'in_progress' | 'delivered'
type InvoiceStatus = 'paid' | 'pending' | 'overdue'
type TaskPriority = 'high' | 'medium' | 'low'
type TaskFilter = 'all' | 'pending' | 'completed'

interface Project {
  id: string
  name: string
  status: ProjectStatus
  date: string
  photos: number
  amount: number
  type: string
}

interface Invoice {
  id: string
  number: string
  date: string
  project: string
  amount: number
  status: InvoiceStatus
}

interface Task {
  id: string
  description: string
  dueDate: string
  priority: TaskPriority
  completed: boolean
}

interface ActivityItem {
  id: string
  action: string
  detail: string
  time: string
  icon: 'eye' | 'credit' | 'check' | 'camera' | 'mail'
}

interface Booking {
  id: string
  name: string
  date: string
  time: string
  location: string
  type: string
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const client = {
  name: 'Sarah Mitchell',
  initials: 'SM',
  email: 'sarah.mitchell@gmail.com',
  phone: '+1 (555) 234-8901',
  tier: 'VIP' as const,
  joinedDate: '2024-09-14',
  lastActive: '2026-03-27',
  totalSpent: 8750,
  projectCount: 12,
  avgProjectValue: 729,
  satisfaction: 4.9,
  responseTime: '< 2 hours',
  preferredContact: 'Email',
  referrals: 4,
}

const projects: Project[] = [
  { id: 'p-001', name: 'Engagement Shoot — Central Park', status: 'completed', date: '2025-04-12', photos: 342, amount: 650, type: 'Engagement' },
  { id: 'p-002', name: 'Wedding Day — The Plaza Hotel', status: 'completed', date: '2025-06-28', photos: 1847, amount: 2400, type: 'Wedding' },
  { id: 'p-003', name: 'Family Portraits — Riverside', status: 'completed', date: '2025-09-05', photos: 186, amount: 450, type: 'Portrait' },
  { id: 'p-004', name: 'Holiday Mini Session', status: 'completed', date: '2025-12-14', photos: 94, amount: 250, type: 'Mini Session' },
  { id: 'p-005', name: 'Anniversary Portraits — Brooklyn Bridge', status: 'delivered', date: '2026-02-08', photos: 278, amount: 550, type: 'Portrait' },
  { id: 'p-006', name: 'Spring Family Session', status: 'in_progress', date: '2026-03-22', photos: 412, amount: 500, type: 'Family' },
  { id: 'p-007', name: 'Newborn Session — Home Studio', status: 'completed', date: '2025-08-19', photos: 156, amount: 800, type: 'Newborn' },
  { id: 'p-008', name: 'Maternity Shoot — Botanical Garden', status: 'completed', date: '2025-07-10', photos: 203, amount: 600, type: 'Maternity' },
  { id: 'p-009', name: 'Corporate Headshots — Mitchell & Co', status: 'completed', date: '2025-11-02', photos: 48, amount: 350, type: 'Corporate' },
]

const invoices: Invoice[] = [
  { id: 'inv-001', number: 'INV-2025-0042', date: '2025-04-14', project: 'Engagement Shoot — Central Park', amount: 650, status: 'paid' },
  { id: 'inv-002', number: 'INV-2025-0067', date: '2025-06-30', project: 'Wedding Day — The Plaza Hotel', amount: 2400, status: 'paid' },
  { id: 'inv-003', number: 'INV-2025-0089', date: '2025-07-12', project: 'Maternity Shoot — Botanical Garden', amount: 600, status: 'paid' },
  { id: 'inv-004', number: 'INV-2025-0101', date: '2025-08-21', project: 'Newborn Session — Home Studio', amount: 800, status: 'paid' },
  { id: 'inv-005', number: 'INV-2025-0115', date: '2025-09-07', project: 'Family Portraits — Riverside', amount: 450, status: 'paid' },
  { id: 'inv-006', number: 'INV-2025-0134', date: '2025-11-04', project: 'Corporate Headshots — Mitchell & Co', amount: 350, status: 'paid' },
  { id: 'inv-007', number: 'INV-2025-0156', date: '2025-12-16', project: 'Holiday Mini Session', amount: 250, status: 'paid' },
  { id: 'inv-008', number: 'INV-2026-0012', date: '2026-02-10', project: 'Anniversary Portraits — Brooklyn Bridge', amount: 550, status: 'paid' },
  { id: 'inv-009', number: 'INV-2026-0031', date: '2026-03-24', project: 'Spring Family Session', amount: 500, status: 'pending' },
  { id: 'inv-010', number: 'INV-2026-0035', date: '2026-03-01', project: 'Retouching Add-on — Wedding', amount: 200, status: 'overdue' },
]

const tasks: Task[] = [
  { id: 't-001', description: 'Deliver final Spring Family Session gallery', dueDate: '2026-04-01', priority: 'high', completed: false },
  { id: 't-002', description: 'Follow up on overdue retouching invoice', dueDate: '2026-03-30', priority: 'high', completed: false },
  { id: 't-003', description: 'Send anniversary album proof for approval', dueDate: '2026-04-05', priority: 'medium', completed: false },
  { id: 't-004', description: 'Schedule summer session consultation call', dueDate: '2026-04-10', priority: 'low', completed: false },
  { id: 't-005', description: 'Upload wedding highlight reel to portal', dueDate: '2026-03-20', priority: 'medium', completed: true },
  { id: 't-006', description: 'Send holiday mini session thank-you card', dueDate: '2025-12-20', priority: 'low', completed: true },
]

const activities: ActivityItem[] = [
  { id: 'a-001', action: 'Gallery Viewed', detail: 'Spring Family Session — viewed 47 photos', time: '2 hours ago', icon: 'eye' },
  { id: 'a-002', action: 'Payment Received', detail: '$550 for Anniversary Portraits', time: '2 days ago', icon: 'credit' },
  { id: 'a-003', action: 'Project Delivered', detail: 'Anniversary Portraits — 278 photos delivered', time: '5 days ago', icon: 'check' },
  { id: 'a-004', action: 'Booking Confirmed', detail: 'Spring Family Session — Mar 22, 10:00 AM', time: '1 week ago', icon: 'camera' },
  { id: 'a-005', action: 'Message Sent', detail: 'Re: Session outfit recommendations', time: '1 week ago', icon: 'mail' },
]

const upcomingBookings: Booking[] = [
  { id: 'b-001', name: 'Summer Beach Session', date: '2026-06-15', time: '7:00 AM', location: 'Jones Beach, Long Island', type: 'Family' },
  { id: 'b-002', name: 'Back-to-School Portraits', date: '2026-08-25', time: '4:00 PM', location: 'Prospect Park, Brooklyn', type: 'Portrait' },
]

const revenueByMonth = [
  { month: 'Apr', amount: 650 },
  { month: 'Jun', amount: 2400 },
  { month: 'Jul', amount: 600 },
  { month: 'Aug', amount: 800 },
  { month: 'Sep', amount: 450 },
  { month: 'Nov', amount: 350 },
  { month: 'Dec', amount: 250 },
  { month: 'Feb', amount: 550 },
  { month: 'Mar', amount: 700 },
]

const projectTypeBreakdown = [
  { type: 'Wedding', count: 1, revenue: 2400 },
  { type: 'Portrait', count: 3, revenue: 1450 },
  { type: 'Family', count: 1, revenue: 500 },
  { type: 'Newborn', count: 1, revenue: 800 },
  { type: 'Maternity', count: 1, revenue: 600 },
  { type: 'Engagement', count: 1, revenue: 650 },
  { type: 'Corporate', count: 1, revenue: 350 },
  { type: 'Mini Session', count: 1, revenue: 250 },
]

/* ------------------------------------------------------------------ */
/*  Style helpers                                                      */
/* ------------------------------------------------------------------ */

const projectStatusColors: Record<ProjectStatus, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  in_progress: 'bg-amber-500/15 text-amber-400',
  delivered: 'bg-teal-500/15 text-teal-400',
}

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  paid: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  overdue: 'bg-red-500/15 text-red-400',
}

const priorityColors: Record<TaskPriority, string> = {
  high: 'bg-red-500/15 text-red-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-blue-500/15 text-blue-400',
}

const activityIcons: Record<ActivityItem['icon'], typeof Eye> = {
  eye: Eye,
  credit: CreditCard,
  check: CheckCircle2,
  camera: Camera,
  mail: Mail,
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-outline-variant/40 bg-surface-container p-6 ${className}`}>
      {children}
    </div>
  )
}

function StatBox({ label, value, icon: Icon, accent = false }: { label: string; value: string; icon: typeof Star; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4">
      <Icon size={14} className="text-on-surface/40 mb-1" />
      <p className={`text-xl font-extrabold ${accent ? 'text-primary' : 'text-on-surface'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-on-surface/50 font-medium">{label}</p>
    </div>
  )
}

function TabButton({ id, label, active, onClick }: { id: TabId; label: string; active: boolean; onClick: (id: TabId) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-on-surface/50 hover:text-on-surface/80 hover:bg-on-surface/5'
      }`}
    >
      {label}
    </button>
  )
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Star; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={18} className="text-primary" />
      <h2 className="font-bold text-lg text-on-surface">{children}</h2>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab Content Components                                             */
/* ------------------------------------------------------------------ */

function OverviewTab({ note, setNote }: { note: string; setNote: (v: string) => void }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left column */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Recent Activity */}
        <Card>
          <SectionTitle icon={Clock}>Recent Activity</SectionTitle>
          <div className="relative space-y-0">
            {activities.map((item, idx) => {
              const IconComp = activityIcons[item.icon]
              return (
                <div key={item.id} className="flex gap-4 relative">
                  {/* Timeline line */}
                  {idx < activities.length - 1 && (
                    <div className="absolute left-[15px] top-[34px] bottom-0 w-px bg-surface-highest/40" />
                  )}
                  {/* Icon bubble */}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-highest/30 border border-outline-variant/40">
                    <IconComp size={14} className="text-primary" />
                  </div>
                  {/* Content */}
                  <div className="pb-6 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{item.action}</p>
                    <p className="text-xs text-on-surface/50 mt-0.5">{item.detail}</p>
                    <p className="text-[10px] text-on-surface/30 mt-1">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Upcoming Shoots */}
        <Card>
          <SectionTitle icon={Camera}>Upcoming Shoots</SectionTitle>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl bg-background p-4 border border-outline-variant/30 hover:border-outline-variant/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Camera size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{booking.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-on-surface/50">
                        <Calendar size={11} />
                        {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-on-surface/50">
                        <Clock size={11} />
                        {booking.time}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-on-surface/50">
                        <MapPin size={11} />
                        {booking.location}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                  {booking.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right column */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Quick Stats */}
        <Card>
          <SectionTitle icon={Zap}>Quick Stats</SectionTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-on-surface/40" />
                <span className="text-sm text-on-surface/70">Avg Response Time</span>
              </div>
              <span className="text-sm font-medium text-on-surface">{client.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-on-surface/40" />
                <span className="text-sm text-on-surface/70">Preferred Contact</span>
              </div>
              <span className="text-sm font-medium text-on-surface">{client.preferredContact}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-on-surface/40" />
                <span className="text-sm text-on-surface/70">Referrals Given</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{client.referrals}</span>
            </div>
          </div>
        </Card>

        {/* Private Notes */}
        <Card>
          <SectionTitle icon={MessageSquare}>Private Notes</SectionTitle>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/30 outline-none ring-1 ring-outline-variant/40 focus:ring-primary/50 resize-none transition-all"
            placeholder="Add private notes about this client..."
          />
          <button className="mt-3 w-full rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/20 transition-all">
            Save Notes
          </button>
        </Card>

        {/* Quick Actions */}
        <Card>
          <SectionTitle icon={Zap}>Quick Actions</SectionTitle>
          <div className="space-y-2">
            {[
              { icon: Mail, label: 'Send Email' },
              { icon: FolderOpen, label: 'Create Project' },
              { icon: Camera, label: 'Schedule Shoot' },
              { icon: FileText, label: 'Generate Invoice' },
            ].map((action) => (
              <button
                key={action.label}
                className="flex w-full items-center gap-3 rounded-xl bg-background px-4 py-3 text-sm text-on-surface border border-outline-variant/20 hover:border-outline-variant/50 hover:bg-background/80 transition-all"
              >
                <action.icon size={16} className="text-primary shrink-0" />
                {action.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ProjectsTab() {
  return (
    <div>
      <SectionTitle icon={FolderOpen}>Projects</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-outline-variant/30 bg-surface-container overflow-hidden hover:border-outline-variant/60 transition-all group"
          >
            {/* Thumbnail placeholder */}
            <div className="h-36 bg-gradient-to-br from-surface-highest/20 to-background flex items-center justify-center relative">
              <Camera size={32} className="text-on-surface/10" />
              <div className="absolute top-3 right-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${projectStatusColors[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] text-on-surface/40">
                <Hash size={10} />
                {project.id}
              </div>
            </div>
            {/* Card body */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-on-surface/40">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Camera size={11} />
                  {project.photos}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/20">
                <span className="text-xs text-on-surface/40">{project.type}</span>
                <span className="text-sm font-bold text-on-surface">${project.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InvoicesTab() {
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  return (
    <Card>
      <SectionTitle icon={FileText}>Invoices</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30">
              {['Invoice #', 'Date', 'Project', 'Amount', 'Status', ''].map((h) => (
                <th key={h} className={`pb-3 pr-4 text-[10px] uppercase tracking-widest text-on-surface/40 font-medium ${h === 'Amount' ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-outline-variant/15 last:border-0 hover:bg-on-surface/[0.02] transition-colors">
                <td className="py-3.5 pr-4 text-sm font-mono text-on-surface/70">{inv.number}</td>
                <td className="py-3.5 pr-4 text-sm text-on-surface/50">
                  {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-3.5 pr-4 text-sm text-on-surface max-w-[240px] truncate">{inv.project}</td>
                <td className="py-3.5 pr-4 text-sm font-bold text-on-surface text-right">${inv.amount.toLocaleString()}</td>
                <td className="py-3.5 pr-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${invoiceStatusColors[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-3.5">
                  <button className="rounded-lg p-1.5 text-on-surface/20 hover:text-on-surface/60 transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-wrap gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mb-1">Total Paid</p>
          <p className="text-lg font-bold text-emerald-400">${totalPaid.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mb-1">Pending</p>
          <p className="text-lg font-bold text-amber-400">${totalPending.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mb-1">Overdue</p>
          <p className="text-lg font-bold text-red-400">${totalOverdue.toLocaleString()}</p>
        </div>
        <div className="ml-auto">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mb-1">Grand Total</p>
          <p className="text-lg font-bold text-on-surface">${(totalPaid + totalPending + totalOverdue).toLocaleString()}</p>
        </div>
      </div>
    </Card>
  )
}

function StatisticsTab() {
  const maxRevenue = Math.max(...revenueByMonth.map((r) => r.amount))
  const maxTypeRevenue = Math.max(...projectTypeBreakdown.map((t) => t.revenue))

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lifetime Value', value: '$8,750', icon: TrendingUp, detail: 'Since Sep 2024' },
          { label: 'Avg Project Size', value: '$729', icon: Target, detail: '12 projects' },
          { label: 'Projects / Year', value: '7.5', icon: BarChart3, detail: 'Annualized' },
          { label: 'Payment Speed', value: '2 days', icon: Zap, detail: 'Avg time to pay' },
        ].map((stat) => (
          <Card key={stat.label} className="!p-5 text-center">
            <stat.icon size={20} className="text-primary mx-auto mb-3" />
            <p className="text-2xl font-extrabold text-on-surface">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mt-1">{stat.label}</p>
            <p className="text-[10px] text-on-surface/25 mt-0.5">{stat.detail}</p>
          </Card>
        ))}
      </div>

      {/* Revenue by month */}
      <Card>
        <SectionTitle icon={BarChart3}>Revenue by Month</SectionTitle>
        <div className="flex items-end gap-2 h-48 mt-4">
          {revenueByMonth.map((item) => {
            const pct = (item.amount / maxRevenue) * 100
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-on-surface/50 font-medium">${item.amount}</span>
                <div className="w-full relative" style={{ height: '140px' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary/60 to-primary/20 transition-all hover:from-primary/80 hover:to-primary/40"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-on-surface/30">{item.month}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Project type breakdown */}
      <Card>
        <SectionTitle icon={Camera}>Project Type Breakdown</SectionTitle>
        <div className="space-y-4 mt-2">
          {projectTypeBreakdown
            .sort((a, b) => b.revenue - a.revenue)
            .map((item) => {
              const pct = (item.revenue / maxTypeRevenue) * 100
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-on-surface/80">{item.type}</span>
                    <span className="text-sm font-bold text-on-surface">${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-on-surface/25 mt-1">{item.count} project{item.count > 1 ? 's' : ''}</p>
                </div>
              )
            })}
        </div>
      </Card>
    </div>
  )
}

function TasksTab() {
  const [taskList, setTaskList] = useState<Task[]>(tasks)
  const [filter, setFilter] = useState<TaskFilter>('all')

  const toggleTask = (id: string) => {
    setTaskList((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const filtered = taskList.filter((t) => {
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <SectionTitle icon={CheckCircle2}>Tasks</SectionTitle>
        <div className="flex items-center gap-2">
          {/* Filter pills */}
          {(['all', 'pending', 'completed'] as TaskFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-primary/15 text-primary'
                  : 'text-on-surface/40 hover:text-on-surface/60 hover:bg-on-surface/5'
              }`}
            >
              {f}
            </button>
          ))}
          <button className="ml-2 flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/20 transition-all">
            <Plus size={12} />
            Add Task
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 rounded-xl p-4 border transition-all ${
              task.completed
                ? 'bg-background/50 border-outline-variant/15'
                : 'bg-background border-outline-variant/30 hover:border-outline-variant/50'
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                task.completed
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'border-outline-variant/50 hover:border-primary/50'
              }`}
            >
              {task.completed && <Check size={12} />}
            </button>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${task.completed ? 'text-on-surface/30 line-through' : 'text-on-surface'}`}>
                {task.description}
              </p>
              <p className="text-[10px] text-on-surface/25 mt-0.5 flex items-center gap-1">
                <Calendar size={9} />
                Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Priority */}
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider shrink-0 ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-on-surface/30 text-sm">
            No {filter !== 'all' ? filter : ''} tasks found.
          </div>
        )}
      </div>
    </Card>
  )
}

function PortalTab() {
  const [portalEnabled, setPortalEnabled] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Globe size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Client Portal</h3>
            <p className="text-sm text-on-surface/50 mt-1 leading-relaxed">
              Create a dedicated dashboard for this client where they can view their galleries,
              download photos, check invoice status, and communicate with you directly.
              The portal is password-protected and branded with your studio identity.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-outline-variant/30">
          <div>
            <p className="text-sm font-medium text-on-surface">Enable Client Portal</p>
            <p className="text-xs text-on-surface/40 mt-0.5">Client will receive an email invitation</p>
          </div>
          <button
            onClick={() => setPortalEnabled(!portalEnabled)}
            className={`relative w-12 h-6 rounded-full transition-all ${
              portalEnabled ? 'bg-primary' : 'bg-surface-highest/50'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-on-surface shadow-md transition-all ${
                portalEnabled ? 'left-[26px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Portal Preview */}
      <Card className={portalEnabled ? '' : 'opacity-50 pointer-events-none'}>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle icon={Eye}>Portal Preview</SectionTitle>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/20 transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Portal Link'}
          </button>
        </div>

        {/* Mock portal sections */}
        <div className="rounded-xl border border-outline-variant/30 bg-background p-5 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/30 mb-3">What Sarah will see</p>

          {/* Galleries */}
          <div className="rounded-lg bg-surface-container p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen size={14} className="text-primary" />
              <span className="text-sm font-medium text-on-surface">My Galleries</span>
            </div>
            <div className="flex gap-2">
              {['Spring Family Session', 'Anniversary Portraits', 'Wedding Day'].map((g) => (
                <div key={g} className="flex-1 rounded-lg bg-background p-2.5 border border-outline-variant/15">
                  <div className="h-12 rounded bg-surface-highest/10 mb-2 flex items-center justify-center">
                    <Camera size={14} className="text-on-surface/10" />
                  </div>
                  <p className="text-[10px] text-on-surface/40 truncate">{g}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-lg bg-surface-container p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-primary" />
              <span className="text-sm font-medium text-on-surface">My Invoices</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface/40">INV-2026-0031</span>
                <span className="text-amber-400">Pending — $500</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface/40">INV-2026-0012</span>
                <span className="text-emerald-400">Paid — $550</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="rounded-lg bg-surface-container p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-primary" />
              <span className="text-sm font-medium text-on-surface">Messages</span>
            </div>
            <p className="text-xs text-on-surface/30">Direct messaging with your photographer</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ClientProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [note, setNote] = useState(
    'Prefers morning sessions — golden hour is her favorite. Likes candid, natural-light shots with minimal posing. Very responsive via email (usually replies within an hour). Has referred 4 other clients. Interested in booking a summer beach session for the whole family. VIP pricing agreed at 15% discount on packages over $500.'
  )

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'portal', label: 'Client Portal' },
  ]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface/40 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      {/* ============ HEADER CARD ============ */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Avatar + info */}
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-brand-amber to-brand-sienna text-2xl font-extrabold text-brand-dark shadow-lg shadow-primary/10">
              {client.initials}
            </div>

            <div>
              {/* Name + VIP */}
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-on-surface">{client.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  <Crown size={12} />
                  {client.tier}
                </span>
              </div>

              {/* Contact row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-on-surface/60">
                  <Mail size={14} className="text-on-surface/30" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-on-surface/60">
                  <Phone size={14} className="text-on-surface/30" />
                  {client.phone}
                </span>
              </div>

              {/* Dates row */}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-on-surface/35">
                  <Calendar size={12} />
                  Client since {new Date(client.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 text-xs text-on-surface/35">
                  <Clock size={12} />
                  Last active {new Date(client.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Stats row */}
          <div className="flex items-center gap-0 divide-x divide-outline-variant/30 border border-outline-variant/20 rounded-xl bg-background py-4 px-2 shrink-0">
            <StatBox label="Projects" value={String(client.projectCount)} icon={FolderOpen} />
            <StatBox label="Total Spent" value={`$${client.totalSpent.toLocaleString()}`} icon={CreditCard} accent />
            <StatBox label="Avg Value" value={`$${client.avgProjectValue}`} icon={Target} />
            <StatBox label="Satisfaction" value={`${client.satisfaction}/5`} icon={Star} accent />
          </div>
        </div>
      </Card>

      {/* ============ TAB NAVIGATION ============ */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container p-1.5">
        {tabs.map((tab) => (
          <TabButton key={tab.id} id={tab.id} label={tab.label} active={activeTab === tab.id} onClick={setActiveTab} />
        ))}
      </div>

      {/* ============ TAB CONTENT ============ */}
      <div>
        {activeTab === 'overview' && <OverviewTab note={note} setNote={setNote} />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'portal' && <PortalTab />}
      </div>
    </div>
  )
}
