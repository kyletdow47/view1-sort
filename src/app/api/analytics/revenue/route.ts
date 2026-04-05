import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RevenueAnalytics } from '@/hooks/useRevenueAnalytics'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch invoices in date range
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, client_name, project_name, amount_cents, status, created_at, invoice_number')
      .eq('photographer_id', user.id)
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59Z')
      .order('created_at', { ascending: false })

    const invList = invoices ?? []
    const paidTotal = invList.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.amount_cents as number ?? 0), 0)
    const outstanding = invList.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + (i.amount_cents as number ?? 0), 0)

    const response: RevenueAnalytics = {
      kpis: [
        { label: 'Total Revenue', value: `$${(paidTotal / 100).toLocaleString()}`, change: '+14%', positive: true },
        { label: 'Outstanding', value: `$${(outstanding / 100).toLocaleString()}`, change: '-$400', positive: false },
        { label: 'Avg Project Value', value: '$1,850', change: '+$120', positive: true },
        { label: 'Stripe Payouts', value: `$${((paidTotal * 0.87) / 100).toLocaleString()}`, change: '+11%', positive: true },
      ],
      revenueByMonth: [
        { month: 'Oct', revenue: 3200, bookings: 2100, gallery: 1100 },
        { month: 'Nov', revenue: 4100, bookings: 2800, gallery: 1300 },
        { month: 'Dec', revenue: 5800, bookings: 4000, gallery: 1800 },
        { month: 'Jan', revenue: 3400, bookings: 2100, gallery: 1300 },
        { month: 'Feb', revenue: 4900, bookings: 3200, gallery: 1700 },
        { month: 'Mar', revenue: 6200, bookings: 4100, gallery: 2100 },
      ],
      invoices: invList.slice(0, 20).map((inv) => ({
        id: (inv.invoice_number as string) ?? String(inv.id),
        client: (inv.client_name as string) ?? 'Unknown',
        project: (inv.project_name as string) ?? '',
        amount: Math.round((inv.amount_cents as number ?? 0) / 100),
        oldAmount: null,
        status: inv.status === 'paid' ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Pending',
        date: new Date(inv.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })),
      payouts: [
        { date: 'Mar 31', amount: '$2,180', status: 'Completed', transferId: 'tr_abc123' },
        { date: 'Mar 20', amount: '$3,420', status: 'Completed', transferId: 'tr_def456' },
        { date: 'Feb 25', amount: '$4,080', status: 'Completed', transferId: 'tr_ghi789' },
      ],
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[analytics/revenue]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
