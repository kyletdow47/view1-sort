'use client'

import { Pencil, ArrowLeft, ImageIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function EditRequestPage() {
  const params = useParams()
  const galleryId = params.id as string

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Phase 2 Banner */}
      <div className="px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
        Phase 2 -- This feature is planned for the next release
      </div>

      <Link
        href={`/gallery/${galleryId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Pencil className="w-6 h-6 text-accent" />
          Request Edits
        </h1>
        <p className="text-muted-foreground mt-1">Select photos and describe the edits you would like</p>
      </div>

      {/* Photo Selection */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Select Photos</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-background border border-dashed border-view1-border flex items-center justify-center"
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
            </div>
          ))}
          <button
            disabled
            className="aspect-square rounded-lg border-2 border-dashed border-view1-border flex items-center justify-center opacity-40 cursor-not-allowed"
          >
            <Plus className="w-8 h-8 text-muted-foreground/30" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center">Click photos in the gallery to add them here</p>
      </section>

      {/* Notes */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Edit Notes</h2>
        <div className="px-4 py-3 rounded-lg bg-background border border-view1-border min-h-[120px] opacity-50">
          <span className="text-sm text-muted-foreground">
            Describe the edits you would like (e.g., color correction, cropping, retouching)...
          </span>
        </div>
      </section>

      {/* Submit */}
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent/20 text-accent font-semibold text-base opacity-50 cursor-not-allowed"
      >
        <Pencil className="w-5 h-5" />
        Submit Edit Request
      </button>
    </div>
  )
}
