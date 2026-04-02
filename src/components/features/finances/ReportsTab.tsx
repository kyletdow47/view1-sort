'use client'

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const monthlyIncomeData = [
  { month: 'Jan', income: 2210 },
  { month: 'Feb', income: 2290 },
  { month: 'Mar', income: 3200 },
  { month: 'Apr', income: 2000 },
  { month: 'May', income: 2181 },
  { month: 'Jun', income: 2500 },
  { month: 'Jul', income: 2100 },
  { month: 'Aug', income: 2900 },
  { month: 'Sep', income: 2800 },
  { month: 'Oct', income: 2200 },
  { month: 'Nov', income: 2100 },
  { month: 'Dec', income: 2500 },
]

const projectTypeData = [
  { name: 'Wedding', value: 8500, percentage: 34 },
  { name: 'Real Estate', value: 6200, percentage: 25 },
  { name: 'Events', value: 5800, percentage: 23 },
  { name: 'Portraits', value: 4350, percentage: 18 },
]

const topClientsData = [
  { name: 'Sarah Johnson', revenue: 8500 },
  { name: 'Michael Chen', revenue: 6200 },
  { name: 'Emma Davis', revenue: 5800 },
  { name: 'James Wilson', revenue: 4350 },
  { name: 'Lisa Anderson', revenue: 3950 },
]

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900 p-3">
        <p className="text-sm text-white">{payload[0].payload.month || payload[0].payload.name}</p>
        <p className="text-xs font-mono text-white/60">
          {payload[0].value > 100
            ? `$${(payload[0].value / 100).toFixed(2)}`
            : `${payload[0].value}%`}
        </p>
      </div>
    )
  }
  return null
}

export function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Income by Month */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-semibold text-white">Income by Month (12 months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyIncomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Income by Project Type & Top Clients */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Income by Project Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectTypeData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {projectTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {projectTypeData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                <span className="text-white/80">
                  {item.name} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients Table */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Top Clients by Revenue</h3>
          <div className="space-y-3">
            {topClientsData.map((client, idx) => {
              const maxRevenue = Math.max(...topClientsData.map((c) => c.revenue))
              const percentage = (client.revenue / maxRevenue) * 100
              return (
                <div key={client.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{client.name}</span>
                    <span className="font-mono text-sm text-white/80">${client.revenue.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        idx === 0
                          ? 'from-blue-500 to-blue-600'
                          : idx === 1
                          ? 'from-purple-500 to-purple-600'
                          : idx === 2
                          ? 'from-pink-500 to-pink-600'
                          : 'from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <p className="text-xs text-white/60">Total Revenue (YTD)</p>
          <p className="mt-2 font-mono text-xl font-bold text-white">$24,850.00</p>
          <p className="mt-1 text-xs text-green-400">↑ 12.5% vs last year</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <p className="text-xs text-white/60">Avg Project Value</p>
          <p className="mt-2 font-mono text-xl font-bold text-white">$1,835.25</p>
          <p className="mt-1 text-xs text-white/40">Last 30 days</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <p className="text-xs text-white/60">Total Projects</p>
          <p className="mt-2 font-mono text-xl font-bold text-white">17</p>
          <p className="mt-1 text-xs text-white/40">All time</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <p className="text-xs text-white/60">Avg Client Spend</p>
          <p className="mt-2 font-mono text-xl font-bold text-white">$1,462.94</p>
          <p className="mt-1 text-xs text-white/40">Per customer</p>
        </div>
      </div>
    </div>
  )
}
