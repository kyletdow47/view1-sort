'use client'

import { Bell } from 'lucide-react'

// TODO: Build full notifications settings panel with email/push toggles
// once Resend email integration is set up (see BUILD-STATE.md Known Missing Infrastructure)

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Notifications</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your email and push notification preferences
        </p>
      </div>

      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
          <Bell size={24} className="text-on-surface-variant/50" />
        </div>
        <div>
          <p className="font-semibold text-on-surface">Notification settings coming soon</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Email and push notification controls will be available once email delivery (Resend) is
            configured.
          </p>
        </div>
      </div>
    </div>
  )
}
