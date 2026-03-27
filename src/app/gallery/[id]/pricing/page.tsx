'use client'

import { use, useState } from 'react'
import {
  Camera,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  DollarSign,
  Globe,
  Package,
  HelpCircle,
} from 'lucide-react'

interface PricingPageProps {
  params: Promise<{ id: string }>
}

const NAV_TABS = ['Overview', 'Sorting', 'Selection', 'Delivery']

const CONVERSIONS = [
  { symbol: '\u20AC', amount: '2,208', currency: 'EUR' },
  { symbol: '\u00A3', amount: '1,896', currency: 'GBP' },
  { symbol: '\u00A5', amount: '358,800', currency: 'JPY' },
]

const PACKAGES = [
  {
    name: 'Gallery Access',
    price: '$2,400',
    description: 'Full gallery with all delivered photos',
    active: true,
  },
  {
    name: 'Individual Photos',
    price: '$25/each',
    description: 'Purchase individual high-resolution photos',
    active: true,
  },
  {
    name: 'Print Store',
    price: 'Coming Soon',
    description: 'Order professional prints and albums',
    active: false,
  },
]

const PAYMENT_METHODS = ['Visa', 'Mastercard', 'Amex']

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'When will I be charged?',
    answer:
      'Payment is processed immediately upon clicking "Proceed to Payment." You will receive a confirmation email with your receipt and download instructions within minutes.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'Refund requests are handled on a case-by-case basis within 14 days of purchase. Please contact your photographer directly to discuss any concerns about your order.',
  },
  {
    question: 'How do I download my photos?',
    answer:
      'After payment is confirmed, you will receive a download link via email. You can also access your photos from the gallery Delivery tab at any time. Downloads are available in full resolution.',
  },
]

export default function PricingPage({ params }: PricingPageProps) {
  const { id } = use(params)
  const [activeTab] = useState('Delivery')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  function toggleFaq(index: number) {
    setExpandedFaq((prev) => (prev === index ? null : index))
  }

  return (
    <div className="min-h-screen bg-[#151312]">
      {/* Top Nav */}
      <nav className="border-b border-[#534439]/30 bg-[#1d1b1a]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
              <Camera size={16} className="text-[#4e2600]" />
            </div>
            <span className="text-sm font-bold text-[#e7e1df]">PhotoSorter</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  tab === activeTab
                    ? 'bg-[#ffb780]/15 text-[#ffb780]'
                    : 'text-[#d9c2b4]/60 hover:text-[#d9c2b4]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-extrabold italic text-[#e7e1df]">
            Gallery Pricing
          </h1>
          <p className="mt-1 text-sm text-[#d9c2b4]/70">Johnson Wedding</p>
        </div>

        {/* Primary Price */}
        <div className="mb-8 rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6 text-center">
          <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
            Gallery Price
          </span>
          <div className="mt-3 flex items-baseline justify-center gap-1">
            <DollarSign size={28} className="text-[#ffb780]" />
            <span className="text-5xl font-extrabold text-[#e7e1df]">2,400</span>
            <span className="ml-1 text-lg font-medium text-[#d9c2b4]/60">USD</span>
          </div>
        </div>

        {/* Currency Conversions */}
        <div className="mb-8 rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-[#95d1d1]/60" />
            <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
              Approximate Conversions
            </span>
          </div>
          <div className="space-y-3">
            {CONVERSIONS.map((conv) => (
              <div
                key={conv.currency}
                className="flex items-baseline justify-between rounded-xl bg-[#211f1e] px-4 py-3"
              >
                <span className="text-sm text-[#d9c2b4]/50">
                  {'\u2248'} {conv.symbol}
                  {conv.amount}
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/40">
                  {conv.currency}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-[#a18d80]/50 text-center">
            Exchange rates are approximate and updated daily
          </p>
        </div>

        {/* Package Options */}
        <div className="mb-8 rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-[#ffb780]/60" />
            <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
              Package Options
            </span>
          </div>
          <div className="space-y-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`flex items-center justify-between rounded-xl px-4 py-4 transition-colors ${
                  pkg.active
                    ? 'bg-[#211f1e] hover:bg-[#2c2928]'
                    : 'bg-[#211f1e]/50 opacity-50'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[#e7e1df]">{pkg.name}</p>
                  <p className="mt-0.5 text-[11px] text-[#d9c2b4]/50">{pkg.description}</p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    pkg.active ? 'text-[#ffb780]' : 'text-[#a18d80]/40'
                  }`}
                >
                  {pkg.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proceed to Payment */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <a
            href={`/gallery/${id}/cart`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-3.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90"
          >
            <CreditCard size={16} />
            Proceed to Payment
            <ExternalLink size={14} />
          </a>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#d9c2b4]/40">Accepted:</span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-md border border-[#534439]/30 bg-[#211f1e] px-2.5 py-1 text-[10px] font-medium text-[#d9c2b4]/60"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={16} className="text-[#ffb4a5]/60" />
            <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
              Frequently Asked Questions
            </span>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="rounded-xl bg-[#211f1e] overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#2c2928]"
                >
                  <span className="text-sm font-medium text-[#e7e1df]">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp size={16} className="text-[#a18d80]/60" />
                  ) : (
                    <ChevronDown size={16} className="text-[#a18d80]/60" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="border-t border-[#534439]/20 px-4 py-3">
                    <p className="text-xs leading-relaxed text-[#d9c2b4]/60">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
