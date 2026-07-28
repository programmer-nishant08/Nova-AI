/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0A0A0F',
          surface: '#14141F',
          card: '#1A1A2E',
          border: '#2A2A4A',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          pink: '#F472B6',
          text: '#E2E8F0',
          'text-dim': '#6B7280',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F472B6 0%, #8B5CF6 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-purple': '0 0 40px rgba(139, 92, 246, 0.15)',
        'glow-cyan': '0 0 40px rgba(6, 182, 212, 0.15)',
        'glow-pink': '0 0 40px rgba(244, 114, 182, 0.15)',
      },
    },
  },
  plugins: [],
}