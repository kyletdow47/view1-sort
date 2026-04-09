'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditRequestsPanel } from '@/components/features/workspace/EditRequestsPanel'

export default function EditsPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Project
      </Link>

      <EditRequestsPanel projectId={projectId} />
    </div>
  )
}
