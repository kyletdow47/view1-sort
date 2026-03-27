'use client'

import { useState } from 'react'
import {
  Users,
  Mail,
  ChevronDown,
  Trash2,
  Clock,
  Check,
  Shield,
  Eye,
  Pencil,
  Crown,
  Send,
  Settings,
  X,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                   */
/* ------------------------------------------------------------------ */

type Role = 'owner' | 'editor' | 'viewer'

interface Member {
  id: string
  name: string
  initials: string
  email: string
  role: Role
  lastActive: string
}

interface PendingInvite {
  id: string
  email: string
  role: Role
  sentDate: string
}

const members: Member[] = [
  { id: 'm-001', name: 'Kyle Dow', initials: 'KD', email: 'kyle@aperturestudios.com', role: 'owner', lastActive: '2026-03-26' },
  { id: 'm-002', name: 'Maria Santos', initials: 'MS', email: 'maria@aperturestudios.com', role: 'editor', lastActive: '2026-03-25' },
  { id: 'm-003', name: 'Alex Chen', initials: 'AC', email: 'alex@aperturestudios.com', role: 'viewer', lastActive: '2026-03-20' },
]

const pendingInvites: PendingInvite[] = [
  { id: 'inv-001', email: 'jessica@freelance.com', role: 'editor', sentDate: '2026-03-24' },
]

const roleConfig: Record<Role, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  owner: { label: 'Owner', color: 'text-[#ffb780]', bg: 'bg-[#ffb780]/15', icon: Crown },
  editor: { label: 'Editor', color: 'text-[#95d1d1]', bg: 'bg-[#95d1d1]/15', icon: Pencil },
  viewer: { label: 'Viewer', color: 'text-[#d9c2b4]', bg: 'bg-[#d9c2b4]/15', icon: Eye },
}

const permissions = [
  { name: 'View projects', owner: true, editor: true, viewer: true },
  { name: 'Upload media', owner: true, editor: true, viewer: false },
  { name: 'Sort & categorize', owner: true, editor: true, viewer: false },
  { name: 'Edit photos', owner: true, editor: true, viewer: false },
  { name: 'Publish galleries', owner: true, editor: true, viewer: false },
  { name: 'Manage clients', owner: true, editor: false, viewer: false },
  { name: 'View finances', owner: true, editor: false, viewer: false },
  { name: 'Manage billing', owner: true, editor: false, viewer: false },
  { name: 'Invite members', owner: true, editor: false, viewer: false },
  { name: 'Workspace settings', owner: true, editor: false, viewer: false },
]

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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')
  const [workspaceName, setWorkspaceName] = useState('Aperture Studios')
  const [workspaceSlug, setWorkspaceSlug] = useState('aperture-studios')

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Users size={20} className="text-[#4e2600]" />
          </div>
          Team & Workspace
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage team members, roles, and workspace settings
        </p>
      </div>

      {/* Current Members */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Team Members
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">{members.length} members</span>
        </div>

        <div className="space-y-3">
          {members.map((member) => {
            const config = roleConfig[member.role]
            const RoleIcon = config.icon
            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/15"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {member.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-on-surface">{member.name}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <RoleIcon size={10} />
                        {config.label}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant/60">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant/40">
                    <Clock size={12} />
                    {new Date(member.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {member.role !== 'owner' && (
                    <button className="rounded-lg p-2 text-on-surface-variant/30 hover:text-[#e7765f] hover:bg-[#e7765f]/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Invite Member */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Send size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Invite Member
          </h2>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <SectionLabel>Email Address</SectionLabel>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full rounded-lg bg-surface-container pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="w-40 space-y-1.5">
            <SectionLabel>Role</SectionLabel>
            <div className="relative">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-5 py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90 whitespace-nowrap">
            <Send size={14} />
            Send Invite
          </button>
        </div>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-[#ffb780]" />
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Pending Invitations
            </h2>
          </div>

          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const config = roleConfig[invite.role]
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-dashed border-[#ffb780]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffb780]/10">
                      <Mail size={16} className="text-[#ffb780]/60" />
                    </div>
                    <div>
                      <span className="text-sm text-on-surface">{invite.email}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
                        <span className="text-[10px] text-on-surface-variant/40">
                          Sent {new Date(invite.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary transition-all">
                      Resend
                    </button>
                    <button className="rounded-lg p-1.5 text-on-surface-variant/30 hover:text-[#e7765f] hover:bg-[#e7765f]/10 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Role Permissions Matrix */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Role Permissions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left pb-3 pr-6">
                  <SectionLabel>Permission</SectionLabel>
                </th>
                <th className="pb-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Crown size={14} className="text-[#ffb780]" />
                    <SectionLabel>Owner</SectionLabel>
                  </div>
                </th>
                <th className="pb-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Pencil size={14} className="text-[#95d1d1]" />
                    <SectionLabel>Editor</SectionLabel>
                  </div>
                </th>
                <th className="pb-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Eye size={14} className="text-[#d9c2b4]" />
                    <SectionLabel>Viewer</SectionLabel>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr
                  key={perm.name}
                  className={idx < permissions.length - 1 ? 'border-b border-outline-variant/10' : ''}
                >
                  <td className="py-2.5 pr-6 text-sm text-on-surface">{perm.name}</td>
                  <td className="py-2.5 px-4 text-center">
                    {perm.owner ? (
                      <Check size={16} className="mx-auto text-emerald-400" />
                    ) : (
                      <span className="block h-0.5 w-4 mx-auto rounded bg-outline-variant/20" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {perm.editor ? (
                      <Check size={16} className="mx-auto text-emerald-400" />
                    ) : (
                      <span className="block h-0.5 w-4 mx-auto rounded bg-outline-variant/20" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {perm.viewer ? (
                      <Check size={16} className="mx-auto text-emerald-400" />
                    ) : (
                      <span className="block h-0.5 w-4 mx-auto rounded bg-outline-variant/20" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Workspace Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Settings size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Workspace Settings
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <SectionLabel>Workspace Name</SectionLabel>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <SectionLabel>Workspace Slug</SectionLabel>
            <div className="flex items-center rounded-lg bg-surface-container ring-1 ring-outline-variant/20">
              <span className="pl-4 text-sm text-on-surface-variant/40">view1.studio/</span>
              <input
                type="text"
                value={workspaceSlug}
                onChange={(e) => setWorkspaceSlug(e.target.value)}
                className="flex-1 bg-transparent px-1 py-2.5 text-sm text-on-surface outline-none"
              />
            </div>
          </div>
        </div>

        <button className="mt-4 rounded-xl bg-surface-container px-5 py-2.5 text-sm font-medium text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary transition-all">
          Save Changes
        </button>
      </Card>
    </div>
  )
}
