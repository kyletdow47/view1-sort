'use client'

import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <MessageSquare className="h-8 w-8 text-white/60" />
      </div>
      <h1 className="text-2xl font-bold text-white">Messages</h1>
      <p className="max-w-md text-sm text-white/50">
        Client conversations and inquiries will appear here.
      </p>
    </div>
  )
}
