import { SettingsNav } from '@/components/features/settings/SettingsNav'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row overflow-hidden">
      <SettingsNav />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
