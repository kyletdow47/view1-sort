import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/features/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  // In demo mode, skip onboarding entirely — go straight to dashboard
  if (isDemo) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-10 text-center">
        <span className="text-2xl font-bold tracking-tight text-white">
          View1 <span className="text-accent">Studio</span>
        </span>
        <p className="text-muted text-sm mt-1">Let&apos;s get your workspace set up</p>
      </div>

      <OnboardingWizard />
    </div>
  )
}
