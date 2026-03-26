'use client'

import { User, ArrowLeft, FolderOpen, CreditCard, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ClientProfilePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Phase 2 Banner */}
      <div className="px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
        Phase 2 -- This feature is planned for the next release
      </div>

      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      {/* Client Info Card */}
      <section className="bg-surface rounded-xl border border-view1-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-background border-2 border-dashed border-view1-border flex items-center justify-center">
            <User className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-5 w-40 rounded bg-background border border-view1-border" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground/50">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> --</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined --</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-full bg-background border border-view1-border text-xs text-muted-foreground">
            Active
          </span>
        </div>
      </section>

      {/* Project History */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
          Project History
        </h2>
        <div className="flex flex-col items-center gap-2 py-8">
          <FolderOpen className="w-10 h-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No projects with this client yet</p>
        </div>
      </section>

      {/* Payment History */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          Payment History
        </h2>
        <div className="flex flex-col items-center gap-2 py-8">
          <CreditCard className="w-10 h-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No payments recorded</p>
        </div>
      </section>
    </div>
  )
}
