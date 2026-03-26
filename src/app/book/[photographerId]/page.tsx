'use client'

import { Camera, Calendar, MapPin, MessageSquare, DollarSign } from 'lucide-react'

const samplePackages = [
  { name: 'Essential', duration: '2 hours', price: '$350', description: '50 edited photos' },
  { name: 'Standard', duration: '4 hours', price: '$650', description: '150 edited photos' },
  { name: 'Premium', duration: 'Full day', price: '$1,200', description: '300+ edited photos' },
]

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Phase 2 Banner */}
        <div className="px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium">
          Phase 2 -- This feature is planned for the next release
        </div>

        {/* Photographer Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Photographer Name</h1>
            <p className="text-gray-500 text-sm mt-1">Wedding &amp; Event Photography</p>
          </div>
        </div>

        {/* Packages */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {samplePackages.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-xl border border-gray-200 p-4 text-center space-y-2 hover:border-emerald-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                <p className="text-2xl font-bold text-emerald-600">{pkg.price}</p>
                <p className="text-xs text-gray-500">{pkg.duration}</p>
                <p className="text-xs text-gray-400">{pkg.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Booking Form */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Book a Session</h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Your Name</label>
              <div className="px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-400">Full name</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-400">you@example.com</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Preferred Date
              </label>
              <div className="px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-400">Select a date</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                Location
              </label>
              <div className="px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-400">City or venue name</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                Additional Notes
              </label>
              <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 min-h-[80px]">
                <span className="text-sm text-gray-400">Tell us about your event or vision...</span>
              </div>
            </div>
          </div>

          <button
            disabled
            className="w-full px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-semibold text-base opacity-60 cursor-not-allowed"
          >
            Book Now
          </button>
        </section>

        <p className="text-center text-xs text-gray-400">
          Powered by View1 Studio
        </p>
      </div>
    </div>
  )
}
