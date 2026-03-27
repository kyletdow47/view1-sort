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
  CreditCard as CardIcon,
} from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                   */
/* ------------------------------------------------------------------ */

interface Project {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'delivered'
  date: string
  photos: number
  amount: number
}

interface Payment {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'refunded'
  project: string
  method: string
}

const client = {
  name: 'Sarah Mitchell',
  initials: 'SM',
  email: 'sarah.mitchell@gmail.com',
  phone: '+1 (555) 234-8901',
  tier: 'VIP',
  joinedDate: '2025-09-14',
  totalSpent: 2450,
  projectCount: 5,
  lastActive: '2026-03-22',
}

const projects: Project[] = [
  { id: 'p-001', name: 'Engagement Shoot - Central Park', status: 'completed', date: '2025-11-20', photos: 342, amount: 650 },
  { id: 'p-002', name: 'Wedding Day - The Plaza', status: 'delivered', date: '2026-01-15', photos: 1204, amount: 1200 },
  { id: 'p-003', name: 'Anniversary Portrait Session', status: 'in_progress', date: '2026-03-18', photos: 86, amount: 350 },
]

const payments: Payment[] = [
  { id: 'pay-001', date: '2025-11-22', amount: 650, status: 'paid', project: 'Engagement Shoot', method: 'Visa ****4242' },
  { id: 'pay-002', date: '2026-01-18', amount: 800, status: 'paid', project: 'Wedding Day', method: 'Visa ****4242' },
  { id: 'pay-003', date: '2026-02-01', amount: 400, status: 'paid', project: 'Wedding Day (Edits)', method: 'Visa ****4242' },
  { id: 'pay-004', date: '2026-03-20', amount: 350, status: 'pending', project: 'Anniversary Portrait', method: 'Pending' },
]

const preferences = {
  communication: 'Email',
  notifications: true,
  savedPayment: 'Visa ending in 4242',
  preferredDelivery: 'Online Gallery',
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}>
      {children}
    </div>
  )
}

const projectStatusColors: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  in_progress: 'bg-[#ffb780]/15 text-[#ffb780]',
  delivered: 'bg-[#95d1d1]/15 text-[#95d1d1]',
}

const paymentStatusColors: Record<string, string> = {
  paid: 'text-emerald-400',
  pending: 'text-[#ffb780]',
  refunded: 'text-[#ffb4a5]',
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ClientProfilePage() {
  const [note, setNote] = useState('Prefers morning sessions. Likes candid, natural-light shots. Very responsive via email. Has referred 2 other clients.')

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      {/* Client Header */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffb780] to-[#d48441] text-xl font-bold text-[#4e2600]">
              {client.initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-headline text-2xl font-extrabold text-on-surface">
                  {client.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ffb780]/15 px-3 py-1 text-xs font-bold text-[#ffb780]">
                  <Crown size={12} />
                  {client.tier}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-on-surface-variant/50" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-on-surface-variant/50" />
                  {client.phone}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-on-surface-variant/50">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Client since {new Date(client.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Last active {new Date(client.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-on-surface">{client.projectCount}</p>
              <SectionLabel>Projects</SectionLabel>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-primary">${client.totalSpent.toLocaleString()}</p>
              <SectionLabel>Total Spent</SectionLabel>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* ====== LEFT COLUMN (8) ====== */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Project History */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <FolderOpen size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Project History
              </h2>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/15 hover:border-outline-variant/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
                      <FolderOpen size={16} className="text-on-surface-variant/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{project.name}</p>
                      <p className="text-xs text-on-surface-variant/50">
                        {new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot; {project.photos} photos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-on-surface">${project.amount}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${projectStatusColors[project.status]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <button className="rounded-lg p-1.5 text-on-surface-variant/30 hover:text-on-surface transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment History */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Payment History
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left pb-3 pr-4">
                      <SectionLabel>Date</SectionLabel>
                    </th>
                    <th className="text-left pb-3 pr-4">
                      <SectionLabel>Project</SectionLabel>
                    </th>
                    <th className="text-left pb-3 pr-4">
                      <SectionLabel>Method</SectionLabel>
                    </th>
                    <th className="text-right pb-3 pr-4">
                      <SectionLabel>Amount</SectionLabel>
                    </th>
                    <th className="text-right pb-3">
                      <SectionLabel>Status</SectionLabel>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-outline-variant/10 last:border-0">
                      <td className="py-3 pr-4 text-sm text-on-surface-variant">
                        {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 pr-4 text-sm text-on-surface">{payment.project}</td>
                      <td className="py-3 pr-4 text-sm text-on-surface-variant/60">{payment.method}</td>
                      <td className="py-3 pr-4 text-right text-sm font-bold text-on-surface">${payment.amount}</td>
                      <td className={`py-3 text-right text-xs font-medium capitalize ${paymentStatusColors[payment.status]}`}>
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ====== RIGHT COLUMN (4) ====== */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Client Preferences */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Settings size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-on-surface">
                Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-on-surface-variant/50" />
                  <span className="text-sm text-on-surface-variant">Communication</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{preferences.communication}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-on-surface-variant/50" />
                  <span className="text-sm text-on-surface-variant">Notifications</span>
                </div>
                <span className={`text-sm font-medium ${preferences.notifications ? 'text-emerald-400' : 'text-on-surface-variant/50'}`}>
                  {preferences.notifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardIcon size={14} className="text-on-surface-variant/50" />
                  <span className="text-sm text-on-surface-variant">Payment</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{preferences.savedPayment}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} className="text-on-surface-variant/50" />
                  <span className="text-sm text-on-surface-variant">Delivery</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{preferences.preferredDelivery}</span>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-on-surface">
                Private Notes
              </h2>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="w-full rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50 resize-none"
              placeholder="Add private notes about this client..."
            />
            <button className="mt-3 w-full rounded-xl bg-surface-container py-2.5 text-sm font-medium text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary transition-all">
              Save Notes
            </button>
          </Card>

          {/* Quick Actions */}
          <Card>
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="mt-3 space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <Mail size={16} className="text-primary shrink-0" />
                Send Email
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <FolderOpen size={16} className="text-primary shrink-0" />
                Create Project
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <Star size={16} className="text-primary shrink-0" />
                Change Tier
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
