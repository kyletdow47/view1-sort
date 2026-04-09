/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        purple: {
          300: "#c084fc",
          500: "#a855f7",
          700: "#7c3aed",
        },
        cyan: {
          300: "#67e8f9",
          500: "#06b6d4",
          700: "#0891b2",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "Inter", "sans-serif"],
        mono: ["'SF Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
