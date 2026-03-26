'use client'

import { Settings, User, Mail, Building2, Lock, Camera } from 'lucide-react'

function DisabledField({ label, placeholder, icon: Icon }: { label: string; placeholder: string; icon: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-background border border-view1-border opacity-60">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{placeholder}</span>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account preferences</p>
      </div>

      {/* Avatar Section */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-background border-2 border-dashed border-view1-border flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium opacity-60 cursor-not-allowed"
            >
              Upload Photo
            </button>
            <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
          </div>
        </div>
      </section>

      {/* Profile Fields */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DisabledField label="Display Name" placeholder="Your Name" icon={User} />
          <DisabledField label="Business Name" placeholder="Studio Name" icon={Building2} />
        </div>
        <DisabledField label="Email Address" placeholder="you@example.com" icon={Mail} />
      </section>

      {/* Password */}
      <section className="bg-surface rounded-xl border border-view1-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <DisabledField label="Current Password" placeholder="********" icon={Lock} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DisabledField label="New Password" placeholder="********" icon={Lock} />
          <DisabledField label="Confirm Password" placeholder="********" icon={Lock} />
        </div>
        <button
          disabled
          className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium opacity-60 cursor-not-allowed"
        >
          Update Password
        </button>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Settings functionality coming soon
      </p>
    </div>
  )
}
