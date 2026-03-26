'use client'

import { Send, ArrowLeft, CheckCircle2, Circle, Link as LinkIcon, Copy, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const checklistItems = [
  { label: 'Media uploaded', done: false, description: 'Add photos or videos to this project' },
  { label: 'Pricing configured', done: false, description: 'Set per-photo or package pricing' },
  { label: 'Gallery theme selected', done: false, description: 'Choose how the gallery looks' },
  { label: 'Client email set', done: false, description: 'Add your client\'s email for delivery' },
]

export default function PublishPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Send className="w-6 h-6 text-accent" />
          Publish Gallery
        </h1>
        <p className="text-muted-foreground mt-1">Review and publish your gallery for client viewing</p>
      </div>

      {/* Pre-publish Checklist */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Pre-publish Checklist</h2>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-background border border-view1-border"
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Link */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-muted-foreground" />
          Gallery Link
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-view1-border">
            <span className="text-sm text-muted-foreground/50">https://view1.studio/gallery/...</span>
          </div>
          <button
            disabled
            className="p-2.5 rounded-lg bg-background border border-view1-border opacity-50 cursor-not-allowed"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* Client Invite */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-muted-foreground" />
          Invite Client
        </h2>
        <div className="space-y-3">
          <div className="px-4 py-2.5 rounded-lg bg-background border border-view1-border opacity-60">
            <span className="text-sm text-muted-foreground">client@example.com</span>
          </div>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium opacity-40 cursor-not-allowed"
          >
            Send Invite Email
          </button>
        </div>
      </section>

      {/* Publish Button */}
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent/20 text-accent font-semibold text-base opacity-50 cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
        Publish Gallery
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Complete all checklist items to enable publishing
      </p>
    </div>
  )
}
