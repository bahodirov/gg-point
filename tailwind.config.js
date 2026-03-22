/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        gaming: {
          bg:      '#080c18',
          surface: '#0d1426',
          card:    '#111c35',
          border:  '#1e3058',
          muted:   '#7c8db5',
        },
      },
      backgroundImage: {
        'gaming-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gaming-hero':     'linear-gradient(135deg, #080c18 0%, #0d1a3a 50%, #080c18 100%)',
      },
      boxShadow: {
        'glow-sm':     '0 0 10px rgba(59,130,246,0.25)',
        'glow':        '0 0 20px rgba(59,130,246,0.35)',
        'glow-lg':     '0 0 40px rgba(59,130,246,0.4)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':  '0 8px 40px rgba(59,130,246,0.2)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 15px rgba(59,130,246,0.3)' },
          '50%':     { boxShadow: '0 0 30px rgba(59,130,246,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
