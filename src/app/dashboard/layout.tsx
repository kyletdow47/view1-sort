import { DashboardClientLayout } from '@/components/features/workspace/DashboardClientLayout'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
