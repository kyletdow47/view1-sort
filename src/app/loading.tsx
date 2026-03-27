import { Spinner } from '@/components/common'

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
