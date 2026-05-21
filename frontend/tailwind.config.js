/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // deep rich black
        card: '#18181b', // sleek charcoal
        border: '#27272a', // standard zinc-800
        primary: {
          DEFAULT: '#6366f1', // neon indigo
          hover: '#4f46e5',
        },
        accent: {
          violet: '#8b5cf6', // neon violet
          emerald: '#10b981', // emerald green
          amber: '#f59e0b', // warning amber
          rose: '#f43f5e', // alert rose
        }
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
