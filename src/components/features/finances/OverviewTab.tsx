'use client'

import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ExternalLink } from 'lucide-react'
import { StatCard } from './StatCard'

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 2400, income: 2210 },
  { month: 'Feb', revenue: 1398, income: 2290 },
  { month: 'Mar', revenue: 3200, income: 3200 },
  { month: 'Apr', revenue: 2780, income: 2000 },
  { month: 'May', revenue: 1890, income: 2181 },
  { month: 'Jun', revenue: 2390, income: 2500 },
  { month: 'Jul', revenue: 3490, income: 2100 },
  { month: 'Aug', revenue: 2400, income: 2900 },
  { month: 'Sep', revenue: 3200, income: 2800 },
  { month: 'Oct', revenue: 2780, income: 2200 },
  { month: 'Nov', revenue: 1890, income: 2100 },
  { month: 'Dec', revenue: 2390, income: 2500 },
]

const recentTransactions = [
  {
    id: 1,
    date: '2026-04-01',
    client: 'Sarah Johnson',
    project: 'Wedding Photography',
    amount: 2500,
    status: 'paid',
  },
  {
    id: 2,
    date: '2026-03-28',
    client: 'Michael Chen',
    project: 'Real Estate Portfolio',
    amount: 1800,
    status: 'pending',
  },
  {
    id: 3,
    date: '2026-03-25',
    client: 'Emma Davis',
    project: 'Event Photography',
    amount: 3200,
    status: 'paid',
  },
  {
    id: 4,
    date: '2026-03-20',
    client: 'James Wilson',
    project: 'Product Shoot',
    amount: 1200,
    status: 'overdue',
  },
  {
    id: 5,
    date: '2026-03-15',
    client: 'Lisa Anderson',
    project: 'Portrait Session',
    amount: 950,
    status: 'paid',
  },
]

const statCardData = [
  { label: 'Total Revenue (YTD)', value: '$24,850.00', change: '+12.5%' },
  { label: 'Outstanding', value: '$2,050.00', change: '2 invoices' },
  { label: 'This Month', value: '$8,470.00', change: '+8.2%' },
  { label: 'Avg Project Value', value: '$1,835.25', change: 'Last 30 days' },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-300',
    pending: 'bg-amber-500/20 text-amber-300',
    overdue: 'bg-red-500/20 text-red-300',
  }
  return styles[status] || styles.pending
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900 p-3">
        <p className="text-sm text-white">{payload[0].payload.month}</p>
        <p className="text-xs font-mono text-white/60">
          Revenue: ${(payload[0].value / 100).toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export function OverviewTab() {
  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + item.revenue, 0) / 100,
    []
  )

  const thisMonthRevenue = revenueData[revenueData.length - 1].revenue / 100

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCardData.map((stat, idx) => (
          <StatCard key={idx} label={stat.label} value={stat.value} detail={stat.change} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Revenue Overview (12 months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stripe Connect Status */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Stripe Connect</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/60">Account Status</p>
              <p className="mt-1 text-sm font-medium text-green-400">Connected</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Payout Schedule</p>
              <p className="mt-1 text-sm font-medium text-white">Every Wednesday</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Next Payout</p>
              <p className="mt-1 text-sm font-medium text-white">April 2, 2026</p>
            </div>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 text-sm text-blue-300 hover:bg-blue-500/30"
            >
              View in Stripe
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-semibold text-white">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left font-medium text-white/60">Date</th>
                <th className="px-4 py-3 text-left font-medium text-white/60">Client</th>
                <th className="px-4 py-3 text-left font-medium text-white/60">Project</th>
                <th className="px-4 py-3 text-right font-medium text-white/60">Amount</th>
                <th className="px-4 py-3 text-center font-medium text-white/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-white/80">{transaction.date}</td>
                  <td className="px-4 py-3 text-white">{transaction.client}</td>
                  <td className="px-4 py-3 text-white/80">{transaction.project}</td>
                  <td className="px-4 py-3 text-right font-mono text-white">${transaction.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
