import { ProfileEditorView } from '@/components/features/settings/ProfileEditorView'
import { createClient } from '@/lib/supabase/server'

export default async function ProfileSettingsPage() {
  let initialDisplayName = ''
  let initialBusinessName = ''
  let initialAvatarUrl: string | null = null
  let initialWorkspaceId: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const [profileResult, workspaceResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name,avatar_url')
          .eq('id', user.id)
          .single(),
        supabase
          .from('workspaces')
          .select('id,name')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single(),
      ])

      if (profileResult.data) {
        initialDisplayName = profileResult.data.display_name ?? ''
        initialAvatarUrl = profileResult.data.avatar_url
      }
      if (workspaceResult.data) {
        initialBusinessName = workspaceResult.data.name
        initialWorkspaceId = workspaceResult.data.id
      }
    }
  } catch {
    // No auth or Supabase not configured — render with empty defaults
  }

  return (
    <ProfileEditorView
      initialDisplayName={initialDisplayName}
      initialBusinessName={initialBusinessName}
      initialAvatarUrl={initialAvatarUrl}
      initialWorkspaceId={initialWorkspaceId}
    />
  )
}
