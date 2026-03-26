'use client'

import { Pencil, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const columns = ['Client', 'Photos', 'Status', 'Price', 'Date']

export default function EditsPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Phase 2 Banner */}
      <div className="px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
        Phase 2 -- This feature is planned for the next release
      </div>

      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Pencil className="w-6 h-6 text-accent" />
          Edit Requests
        </h1>
        <p className="text-muted-foreground mt-1">Review and manage photo edit requests from clients</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface border border-view1-border opacity-50">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search edit requests...</span>
      </div>

      {/* Table */}
      <section className="bg-surface rounded-xl border border-view1-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-view1-border">
                {columns.map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Pencil className="w-12 h-12 text-muted-foreground/20" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">No edit requests yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Client edit requests will appear here once the gallery is published
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
