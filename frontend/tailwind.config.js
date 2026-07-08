/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0d0d0d',
        'bg-surface': '#131313',
        'bg-elevated': '#1b1b1c',
        'text-primary': '#e5e2e1',
        'text-secondary': '#c4c7c7',
        'text-muted': '#8e9192',
        'border': '#4d4635',
        'accent-gold': '#eac249',
        'accent-blue': '#a5c8ff',
      },
    },
  },
  plugins: [],
}
