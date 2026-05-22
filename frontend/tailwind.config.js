/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',      // Dynamic Main Background
        'bg-secondary': 'var(--bg-secondary)',  // Dynamic Secondary Background
        card: 'var(--card)',            // Dynamic Card Background
        'card-hover': 'var(--card-hover)',     // Dynamic Hover Card Background
        border: 'var(--border)',          // Dynamic Standard SaaS Border
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        primary: {
          DEFAULT: '#3B82F6',       // Primary Accent Blue
          hover: '#2563EB',
          purple: '#8B5CF6',        // Secondary Accent Purple
        },
        accent: {
          violet: '#8B5CF6',        // Purple accent
          emerald: '#22C55E',       // Success Green
          amber: '#F59E0B',         // Warning Orange
          rose: '#EF4444',          // Danger Red
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
