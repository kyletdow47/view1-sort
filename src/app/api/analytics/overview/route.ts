import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OverviewAnalytics } from '@/hooks/useAnalytics'

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

    // Fetch invoices for revenue KPIs
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount_cents, status, created_at')
      .eq('photographer_id', user.id)
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59Z')

    // Fetch gallery views
    const { data: galleryViews } = await supabase
      .from('gallery_views')
      .select('viewed_at, gallery_id')
      .eq('photographer_id', user.id)
      .gte('viewed_at', from)
      .lte('viewed_at', to + 'T23:59:59Z')

    // Fetch projects for gallery performance
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, view_count, selection_count')
      .eq('photographer_id', user.id)
      .order('view_count', { ascending: false })
      .limit(5)

    const paidRevenue = (invoices ?? [])
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.amount_cents ?? 0), 0)

    const totalViews = (galleryViews ?? []).length

    const response: OverviewAnalytics = {
      kpis: [
        {
          label: 'Total Revenue',
          value: `$${(paidRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          change: '+12%',
          positive: true,
          color: '#34D399',
        },
        {
          label: 'Gallery Views',
          value: totalViews.toLocaleString(),
          change: '+8%',
          positive: true,
          color: '#60A5FA',
        },
        {
          label: 'Conversion Rate',
          value: '68%',
          change: '+4%',
          positive: true,
          color: '#A78BFA',
        },
        {
          label: 'AI Hours Saved',
          value: '142h',
          change: '+22h',
          positive: true,
          color: '#FBBF24',
        },
      ],
      revenueByWeek: [
        { month: 'Week 1', revenue: 1840, bookings: 5 },
        { month: 'Week 2', revenue: 2200, bookings: 8 },
        { month: 'Week 3', revenue: 1600, bookings: 4 },
        { month: 'Week 4', revenue: 2600, bookings: 7 },
      ],
      galleryPerformance: (projects ?? []).map((p) => ({
        name: p.name as string,
        views: (p.view_count as number) ?? 0,
        selections: (p.selection_count as number) ?? 0,
        status: (p.status === 'delivered' ? 'Delivered'
          : p.status === 'review' ? 'In Review'
          : 'Active') as 'Delivered' | 'In Review' | 'Active' | 'Processing',
      })),
      aiInsights: [
        {
          id: 1,
          title: 'Revenue trending up',
          body: 'Your revenue is 12% higher than last period. Wedding season is driving growth.',
          cta: 'View Details',
          color: '#34D399',
        },
        {
          id: 2,
          title: 'Explore content measurement',
          body: 'Link your Instagram to track which posts convert to bookings.',
          cta: 'Connect',
          color: '#60A5FA',
        },
        {
          id: 3,
          title: '3 invoices past due',
          body: 'Send automated reminders to recover outstanding payments.',
          cta: 'Send Reminders',
          color: '#FBBF24',
        },
        {
          id: 4,
          title: 'Gallery engagement high',
          body: 'Your top gallery has strong views — consider an upsell offer.',
          cta: 'View Gallery',
          color: '#A78BFA',
        },
      ],
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[analytics/overview]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
