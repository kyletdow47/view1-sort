import { DashboardClientLayout } from '@/components/features/workspace/DashboardClientLayout'

// Force dynamic rendering so Supabase auth is never executed at build time.
// All dashboard pages are authenticated and must not be statically prerendered.
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
