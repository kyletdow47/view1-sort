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
      },

      animation: {
        marquee:   'marquee 30s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
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
