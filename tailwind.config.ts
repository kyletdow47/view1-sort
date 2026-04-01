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
        outline:          t('--t-outline'),
        'outline-variant': t('--t-outline-variant'),

        // ── Accent / Primary ─────────────────────────────────────────────
        primary:           t('--t-primary'),
        'primary-dim':     t('--t-primary-dim'),
        'on-primary':      t('--t-on-primary'),

        // Legacy aliases kept for backward compatibility
        accent:            t('--t-primary'),
        'accent-hover':    t('--t-primary-dim'),
        'view1-border':    t('--t-outline-variant'),
        muted:             t('--t-on-surface-variant'),

        // ── Status colors (theme-independent) ────────────────────────────
        error:   '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },

      fontFamily: {
        // Plus Jakarta Sans is the ONLY font. All aliases point here.
        sans:     ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        body:     ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        headline: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        label:    ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        mono:     ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },

      borderRadius: {
        DEFAULT: '0.375rem',
        sm:  '0.25rem',
        md:  '0.375rem',
        lg:  '0.5rem',
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
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
        marquee:  'marquee 30s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'scroll-bg': 'scroll-bg 60s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
