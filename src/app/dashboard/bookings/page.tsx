'use client'

import { CalendarDays, Plus, Search } from 'lucide-react'

const columns = ['Date', 'Client', 'Type', 'Status', 'Amount']

export default function BookingsPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Phase 2 Banner */}
      <div className="px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
        Phase 2 -- This feature is planned for the next release
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-accent" />
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past bookings</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium opacity-60 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface border border-view1-border opacity-50">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search bookings...</span>
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
                    <CalendarDays className="w-12 h-12 text-muted-foreground/20" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">No bookings yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Bookings will appear here when clients book through your page
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
