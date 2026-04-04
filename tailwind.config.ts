import type { Config } from 'tailwindcss'

// Helper: Tailwind CSS variable token with opacity support
const t = (name: string) => `rgb(var(${name}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic surface tokens ──────────────────────────────────────
        background:                   t('--t-bg'),
        surface:                      t('--t-surface'),
        'surface-low':                t('--t-surface-low'),
        'surface-container':          t('--t-surface-container'),
        'surface-container-low':      t('--t-surface-low'),
        'surface-container-lowest':   t('--t-surface-low'),
        'surface-container-high':     t('--t-surface-high'),
        'surface-container-highest':  t('--t-surface-highest'),

        // ── Text / on-surface ─────────────────────────────────────────────
        'on-surface':         t('--t-on-surface'),
        'on-surface-variant': t('--t-on-surface-variant'),
        'on-background':      t('--t-on-surface'),

        // ── Borders ──────────────────────────────────────────────────────
        outline:           t('--t-outline'),
        'outline-variant': t('--t-outline-variant'),

        // ── Accent / Primary ─────────────────────────────────────────────
        primary:           t('--t-primary'),
        'primary-dim':     t('--t-primary-dim'),
        'on-primary':      t('--t-on-primary'),

        // Accent muted (indigo-300 for subtle text/icons)
        'accent-muted':    t('--t-accent-muted'),

        // Legacy aliases kept for backward compatibility
        accent:            t('--t-primary'),
        'accent-hover':    t('--t-primary-dim'),
        'view1-border':    t('--t-outline-variant'),
        muted:             t('--t-on-surface-variant'),

        // ── Status colors (theme-independent) ────────────────────────────
        error:   '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',

        // ── Chart / data-visualisation palette ───────────────────────────
        'chart-emerald':     'var(--chart-emerald)',
        'chart-violet':      'var(--chart-violet)',
        'chart-amber':       'var(--chart-amber)',
        'chart-red':         'var(--chart-red)',
        'chart-blue':        'var(--chart-blue)',
        'chart-orange':      'var(--chart-orange)',
        'chart-teal':        'var(--chart-teal)',
        'chart-purple':      'var(--chart-purple)',
        'chart-gold':        'var(--chart-gold)',
        'chart-coral':       'var(--chart-coral)',
        'chart-mint':        'var(--chart-mint)',
        'chart-deep-purple': 'var(--chart-deep-purple)',
        'chart-tangerine':   'var(--chart-tangerine)',
        'chart-cyan':        'var(--chart-cyan)',
        'chart-indigo':      'var(--chart-indigo)',
        'chart-rose':        'var(--chart-rose)',
        'chart-dark-teal':   'var(--chart-dark-teal)',
        'chart-pink':        'var(--chart-pink)',
        'chart-soft-indigo': 'var(--chart-soft-indigo)',

        // ── Brand accent palette ─────────────────────────────────────────
        'brand-teal':   'var(--brand-teal)',
        'brand-coral':  'var(--brand-coral)',
        'brand-peach':  'var(--brand-peach)',
        'brand-amber':  'var(--brand-amber)',
        'brand-sienna': 'var(--brand-sienna)',
        'brand-dark':   'var(--brand-dark)',
      },

      backgroundImage: {
        // Metallic rainbow CTA — amber → pink → violet (Pencil primary gradient)
        'cta':    'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
        'cta-r':  'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)',
        // Rainbow border gradient (matches Pencil frame strokes)
        'rainbow-border': 'linear-gradient(135deg, #F59E0B 0%, #3B82F6 25%, #A855F7 50%, #EC4899 75%, #F59E0B 100%)',
      },

      fontFamily: {
        // Inter: body, UI elements
        sans:     ['var(--font-inter)', 'Inter', 'sans-serif'],
        body:     ['var(--font-inter)', 'Inter', 'sans-serif'],
        label:    ['var(--font-inter)', 'Inter', 'sans-serif'],
        // Geist: headings, display
        headline: ['var(--font-geist)', 'Geist', 'sans-serif'],
        display:  ['var(--font-geist)', 'Geist', 'sans-serif'],
        // Geist Mono: code, data
        mono:     ['var(--font-geist-mono)', 'Geist Mono', 'monospace'],
      },

      // Pencil design system radii: soft, airy borders
      borderRadius: {
        DEFAULT: '0.5rem',   //  8px — Pencil radius-sm
        sm:  '0.25rem',      //  4px
        md:  '0.75rem',      // 12px — Pencil radius-md
        lg:  '1rem',         // 16px — Pencil radius-lg
        xl:  '1.25rem',      // 20px
        '2xl': '1.5rem',     // 24px
        '3xl': '2rem',       // 32px
        full: '9999px',
      },

      // Micro/medium elevation system
      boxShadow: {
        'elev-1': '0 1px 2px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.03)',
        'elev-2': '0 4px 12px rgb(0 0 0 / 0.5), 0 1px 3px rgb(0 0 0 / 0.3)',
        'elev-3': '0 8px 24px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.4)',
        'glow-primary': '0 0 20px rgb(var(--t-primary) / 0.25)',
      },

      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scroll-bg': {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },

      animation: {
        marquee:     'marquee 30s linear infinite',
        'fade-in':   'fade-in 0.2s ease-out',
        'scroll-bg': 'scroll-bg 60s linear infinite',
      },

      // Airy spacing additions
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      // Motion tokens
      transitionDuration: {
        micro:  '150',
        medium: '250',
        slow:   '400',
      },
    },
  },
  plugins: [],
}

export default config
