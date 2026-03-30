import type { Config } from 'tailwindcss'

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
        // Theme-aware core surfaces via CSS custom properties (RGB tuples for opacity support)
        background:              'rgb(var(--tw-bg)           / <alpha-value>)',
        surface:                 'rgb(var(--tw-bg)           / <alpha-value>)',
        'surface-dim':           'rgb(var(--tw-bg)           / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--tw-surface-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--tw-surface-low)  / <alpha-value>)',
        'surface-container':     'rgb(var(--tw-surface)      / <alpha-value>)',
        'surface-container-high':'rgb(var(--tw-surface-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--tw-surface-highest) / <alpha-value>)',
        'surface-bright':        'rgb(var(--tw-surface-bright)/ <alpha-value>)',
        'surface-variant':       'rgb(var(--tw-surface-high) / <alpha-value>)',

        // Primary — theme-aware (amber warm / indigo zinc / silver mono)
        primary:                 'rgb(var(--tw-primary)       / <alpha-value>)',
        'primary-container':     'rgb(var(--tw-primary-c)     / <alpha-value>)',
        'on-primary':            'rgb(var(--tw-on-primary)    / <alpha-value>)',
        'on-primary-container':  'rgb(var(--tw-on-primary)    / <alpha-value>)',
        'primary-fixed':         'rgb(var(--tw-primary)       / <alpha-value>)',
        'primary-fixed-dim':     'rgb(var(--tw-primary)       / <alpha-value>)',

        // On-surface — theme-aware
        'on-surface':            'rgb(var(--tw-on-surface)    / <alpha-value>)',
        'on-surface-variant':    'rgb(var(--tw-on-surface-v)  / <alpha-value>)',
        'on-background':         'rgb(var(--tw-on-surface)    / <alpha-value>)',

        // Outline — theme-aware
        outline:                 'rgb(var(--tw-outline)       / <alpha-value>)',
        'outline-variant':       'rgb(var(--tw-outline-v)     / <alpha-value>)',

        // Accent — theme-aware
        accent:                  'rgb(var(--tw-accent)        / <alpha-value>)',
        'accent-hover':          'rgb(var(--tw-accent-hover)  / <alpha-value>)',

        // Non-theme-aware tokens (secondary, tertiary, error stay warm)
        secondary:              '#95d1d1',
        'secondary-container':  '#0c5252',
        'on-secondary':         '#003737',
        'on-secondary-container': '#87c3c2',

        tertiary:               '#ffb4a5',
        'tertiary-container':   '#e7765f',
        'on-tertiary':          '#611205',
        'on-tertiary-container':'#5f1104',

        error:                  '#ffb4ab',
        'error-container':      '#93000a',
        'on-error':             '#690005',
        'on-error-container':   '#ffdad6',

        // Legacy
        'surface-tint':         'rgb(var(--tw-primary)       / <alpha-value>)',
        'inverse-surface':      '#e7e1df',
        'inverse-on-surface':   '#32302f',
        'inverse-primary':      '#904d0b',
        muted:                  '#6b7280',
        'view1-border':         'rgb(var(--tw-outline-v)     / <alpha-value>)',
      },

      fontFamily: {
        // All font roles now map to Plus Jakarta Sans
        sans:     ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        headline: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body:     ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        label:    ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif:    ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },

      // Airy, correct border radii matching the Pencil design system
      borderRadius: {
        DEFAULT: '0.5rem',   //  8px — radius-sm
        sm:      '0.25rem',  //  4px
        md:      '0.75rem',  // 12px — radius-md
        lg:      '1rem',     // 16px — radius-lg
        xl:      '1.25rem',  // 20px
        '2xl':   '1.5rem',   // 24px
        '3xl':   '2rem',     // 32px
        full:    '9999px',
      },

      // Micro/medium elevation system
      boxShadow: {
        'elev-1': '0 1px 2px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.03)',
        'elev-2': '0 4px 12px rgb(0 0 0 / 0.5), 0 1px 3px rgb(0 0 0 / 0.3)',
        'elev-3': '0 8px 24px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.4)',
        'glow-primary': '0 0 20px rgb(var(--tw-primary) / 0.25)',
        'glow-accent':  '0 0 20px rgb(var(--tw-accent)  / 0.2)',
      },

      // Motion tokens
      transitionDuration: {
        micro:  '150',
        medium: '250',
        slow:   '400',
      },

      // Airy spacing additions
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
