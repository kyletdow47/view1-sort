export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: '#050508' }}
    >
      {/* Metallic rainbow mesh gradient — matches dashboard shell */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 55% at 0% 0%,   rgba(245,158,11,0.22) 0%, transparent 65%)',
            'radial-gradient(ellipse 65% 55% at 100% 15%, rgba(59,130,246,0.20) 0%, transparent 60%)',
            'radial-gradient(ellipse 70% 55% at 55% 100%,rgba(168,85,247,0.22) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 45% at 95% 85%,  rgba(236,72,153,0.18) 0%, transparent 55%)',
          ].join(','),
        }}
      />
      {children}
    </div>
  )
}
