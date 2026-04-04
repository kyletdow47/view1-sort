import { DashboardClientLayout } from '@/components/features/workspace/DashboardClientLayout'
import { CommandBarSetup } from '@/components/features/command-bar'

// Force dynamic rendering so Supabase auth is never executed at build time.
// All dashboard pages are authenticated and must not be statically prerendered.
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CommandBarSetup>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </CommandBarSetup>
  )
}
