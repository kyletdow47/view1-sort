import { notFound } from 'next/navigation'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/features/gallery/CheckoutForm'
import type { Project } from '@/types/supabase'

interface CheckoutPageProps {
  params: Promise<{ id: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: projectData } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!projectData) notFound()
  const project = projectData as Project

  if (project.pricing_model === 'free') notFound()

  // Fetch photographer name via workspace → profile
  let photographerName = 'Photographer'
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id, name')
    .eq('id', project.workspace_id)
    .single()

  if (workspace) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', workspace.owner_id)
      .single()
    photographerName = profile?.display_name ?? workspace.name ?? photographerName
  }

  return (
    <div className="min-h-screen bg-[#151312] text-[#e7e1df]">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#534439]/30 bg-[#151312]/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Camera size={15} className="text-[#4e2600]" />
          </div>
          <span className="font-headline font-black text-lg tracking-tighter text-[#ffb780]">
            View1 Sort
          </span>
        </div>
        <div className="w-[120px]" />
      </header>

      <main>
        <CheckoutForm
          project={project}
          projectId={id}
          photographerName={photographerName}
        />
      </main>
    </div>
  )
}
