'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Palette, CreditCard, FolderOpen, ChevronRight, Check } from 'lucide-react'

const STEPS = [
  { title: 'Your Business', icon: Camera },
  { title: 'Specialty', icon: Palette },
  { title: 'Plan', icon: CreditCard },
  { title: 'First Project', icon: FolderOpen },
]

const SPECIALTIES = [
  { id: 'wedding', label: 'Wedding', emoji: '💒' },
  { id: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { id: 'portrait', label: 'Portrait', emoji: '📸' },
  { id: 'event', label: 'Event', emoji: '🎉' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'commercial', label: 'Commercial', emoji: '🏢' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  function handleNext() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-10 text-center">
        <span className="text-2xl font-bold tracking-tight text-white">
          View1 <span className="text-accent">Studio</span>
        </span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-accent text-black' :
              i === step ? 'bg-accent/20 text-accent border border-accent' :
              'bg-surface text-muted border border-view1-border'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? 'bg-accent' : 'bg-view1-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="w-full max-w-md bg-surface border border-view1-border rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{STEPS[step].title}</h2>
          <p className="text-muted text-sm mt-1">
            {step === 0 && 'Tell us about your photography business'}
            {step === 1 && 'What type of photography do you specialize in?'}
            {step === 2 && 'Choose a plan that fits your needs'}
            {step === 3 && 'Create your first project to get started'}
          </p>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Kyle Dow"
                className="w-full bg-background border border-view1-border rounded-lg px-3 py-2.5 text-white placeholder-muted text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Business Name</label>
              <input
                type="text"
                placeholder="View1 Media"
                className="w-full bg-background border border-view1-border rounded-lg px-3 py-2.5 text-white placeholder-muted text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {SPECIALTIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecialty(s.id)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  selectedSpecialty === s.id
                    ? 'border-accent bg-accent/10'
                    : 'border-view1-border hover:border-accent/40'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <p className="text-sm font-medium text-white mt-2">{s.label}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {[
              { name: 'Free', price: '$0', desc: '3 projects, 5 GB', selected: true },
              { name: 'Pro', price: '$39/mo', desc: 'Unlimited, 100 GB', selected: false },
              { name: 'Business', price: '$79/mo', desc: 'Teams, 500 GB', selected: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                  plan.selected ? 'border-accent bg-accent/10' : 'border-view1-border hover:border-accent/40'
                }`}
              >
                <div>
                  <p className="text-white font-medium">{plan.name}</p>
                  <p className="text-muted text-xs">{plan.desc}</p>
                </div>
                <span className="text-white font-semibold">{plan.price}</span>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Project Name</label>
              <input
                type="text"
                placeholder="My First Shoot"
                className="w-full bg-background border border-view1-border rounded-lg px-3 py-2.5 text-white placeholder-muted text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Preset</label>
              <select className="w-full bg-background border border-view1-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent">
                <option>Real Estate</option>
                <option>Wedding</option>
                <option>Travel</option>
                <option>General</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-accent text-black font-semibold rounded-lg py-2.5 text-sm hover:bg-green-300 transition-colors"
        >
          {step === 3 ? 'Get Started' : 'Continue'}
          <ChevronRight size={16} />
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full text-sm text-muted hover:text-white transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}
