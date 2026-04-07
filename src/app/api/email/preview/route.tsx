import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import { WaitlistConfirmationEmail } from '@/lib/email/templates/waitlist-confirmation'
import { WaitlistCommunityEmail } from '@/lib/email/templates/waitlist-community'
import { WaitlistLaunchEmail } from '@/lib/email/templates/waitlist-launch'

/**
 * GET /api/email/preview?template=waitlist-confirmation
 *
 * Dev-only route to preview email templates in the browser.
 * Query params:
 *   - template: waitlist-confirmation | waitlist-community | waitlist-launch
 *   - name: optional recipient name
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const { searchParams } = request.nextUrl
  const template = searchParams.get('template') ?? 'waitlist-confirmation'
  const name = searchParams.get('name') ?? 'Kyle'

  let element: React.ReactElement

  switch (template) {
    case 'waitlist-confirmation':
      element = <WaitlistConfirmationEmail name={name} />
      break
    case 'waitlist-community':
      element = <WaitlistCommunityEmail name={name} />
      break
    case 'waitlist-launch':
      element = <WaitlistLaunchEmail name={name} accessUrl="https://view1sort.com/auth/signup" />
      break
    default:
      return NextResponse.json(
        { error: `Unknown template: ${template}`, available: ['waitlist-confirmation', 'waitlist-community', 'waitlist-launch'] },
        { status: 400 }
      )
  }

  const html = await render(element)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
