/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0b0f14',
          secondary: '#121820',
          elevated: '#1a222d',
        },
        card: {
          surface: '#1a222d',
          border: '#2a3646',
          hover: '#222d3d',
        },
        accent: {
          emerald: '#10b981',
          emeraldHover: '#059669',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          orange: '#f59e0b',
          red: '#ef4444',
        },
        text: {
          primary: '#f8fafc',
          silver: '#94a3b8',
          muted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
};

