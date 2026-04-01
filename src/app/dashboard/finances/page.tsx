'use client'

import { useState } from 'react'
import { DollarSign, FileText, BarChart3 } from 'lucide-react'
import { OverviewTab } from '@/components/features/finances/OverviewTab'
import { InvoicesTab } from '@/components/features/finances/InvoicesTab'
import { ReportsTab } from '@/components/features/finances/ReportsTab'

type TabType = 'overview' | 'invoices' | 'reports'

const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'invoices', label: 'Invoices', icon: <FileText className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
]

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-900 to-slate-950 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Finances</h1>
        <p className="mt-2 text-sm text-white/60">Revenue tracking, invoicing, and income reports</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-4 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-white'
                : 'border-b-2 border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  )
}
