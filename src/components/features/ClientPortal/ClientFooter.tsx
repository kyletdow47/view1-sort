import { Mail, Phone, Globe } from 'lucide-react'
import type { PhotographerBrand } from '@/types/client-portal'

// ---------------------------------------------------------------------------
// Component — footer shown on client portal (frame 4lzWb)
// ---------------------------------------------------------------------------

interface ClientFooterProps {
  brand: PhotographerBrand
}

export function ClientFooter({ brand }: ClientFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="flex flex-col items-center gap-2 border-t border-white/[0.06] pt-4 pb-6">
      <span className="text-[13px] font-medium text-white/70">
        {brand.name}
      </span>

      <div className="flex items-center gap-4">
        {brand.contactEmail && (
          <a
            href={`mailto:${brand.contactEmail}`}
            className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors"
          >
            <Mail className="h-3 w-3" />
            {brand.contactEmail}
          </a>
        )}
        {brand.contactPhone && (
          <a
            href={`tel:${brand.contactPhone}`}
            className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors"
          >
            <Phone className="h-3 w-3" />
            {brand.contactPhone}
          </a>
        )}
      </div>

      <p className="text-[11px] text-white/30">
        &copy; {currentYear} {brand.name}. All rights reserved.
      </p>
    </footer>
  )
}
