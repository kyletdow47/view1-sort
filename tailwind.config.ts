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
        // Core surfaces (dark → light)
        background: '#151312',
        surface: '#151312',
        'surface-dim': '#151312',
        'surface-container-lowest': '#100e0d',
        'surface-container-low': '#1d1b1a',
        'surface-container': '#211f1e',
        'surface-container-high': '#2c2928',
        'surface-container-highest': '#373433',
        'surface-bright': '#3b3937',
        'surface-variant': '#373433',

        // Primary (amber/copper)
        primary: '#ffb780',
        'primary-container': '#d48441',
        'on-primary': '#4e2600',
        'on-primary-container': '#4d2500',
        'primary-fixed': '#ffdcc4',
        'primary-fixed-dim': '#ffb780',

        // Secondary (teal)
        secondary: '#95d1d1',
        'secondary-container': '#0c5252',
        'on-secondary': '#003737',
        'on-secondary-container': '#87c3c2',
        'secondary-fixed': '#b1eeed',
        'secondary-fixed-dim': '#95d1d1',

        // Tertiary (coral/red)
        tertiary: '#ffb4a5',
        'tertiary-container': '#e7765f',
        'on-tertiary': '#611205',
        'on-tertiary-container': '#5f1104',
        'tertiary-fixed': '#ffdad3',
        'tertiary-fixed-dim': '#ffb4a5',

        // Error
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        // On-surface
        'on-surface': '#e7e1df',
        'on-surface-variant': '#d9c2b4',
        'on-background': '#e7e1df',

        // Outline
        outline: '#a18d80',
        'outline-variant': '#534439',

        // Inverse
        'inverse-surface': '#e7e1df',
        'inverse-on-surface': '#32302f',
        'inverse-primary': '#904d0b',

        // Surface tint
        'surface-tint': '#ffb780',

        // Legacy aliases
        accent: '#D4915C',
        'accent-hover': '#E0A06E',
        muted: '#6b7280',
        'view1-border': '#2a2a35',
      },
      fontFamily: {
        headline: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        label: ['var(--font-space-grotesk)', 'Space Grotesk', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        mono: ['var(--font-space-grotesk)', 'Space Grotesk', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
    },
  },
  plugins: [],
}
export default config
