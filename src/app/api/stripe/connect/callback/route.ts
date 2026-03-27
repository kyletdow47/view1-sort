import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const settingsUrl = `${appUrl}/dashboard/settings/connect`

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${appUrl}/auth/login`)
    }

    // Redirect back to the settings page with a success indicator
    return NextResponse.redirect(`${settingsUrl}?connected=true`)
  } catch {
    return NextResponse.redirect(`${settingsUrl}?error=callback_failed`)
  }
}
