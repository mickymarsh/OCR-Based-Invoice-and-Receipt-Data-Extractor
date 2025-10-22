/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slower': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slowest': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite',
        'float-medium': 'float 7s ease-in-out infinite',
        'star-fall': 'starFall 15s linear infinite',
        'star-fall-fast': 'starFall 10s linear infinite',
        'star-fall-long': 'starFall 20s linear infinite',
        'star-fall-reverse': 'starFallReverse 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        starFall: {
          '0%': { transform: 'translateY(-100vh)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateY(100vh)', opacity: 0 },
        },
        starFallReverse: {
          '0%': { transform: 'translateY(100vh)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateY(-100vh)', opacity: 0 },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'budget-blue': '#2563eb',
        'budget-purple': '#7c3aed',
        'budget-emerald': '#10b981',
        'budget-indigo': '#4f46e5',
        'budget-lime': '#C1E899',
        'budget-brown': '#9A6735',
        'budget-mint': '#E6F0DC',
        'budget-green': '#55883B',
      },
    },
  },
  plugins: [],
}