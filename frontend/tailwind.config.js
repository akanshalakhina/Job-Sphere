/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f6fa',
          100: '#e9ecf5',
          200: '#cbd4e9',
          300: '#9cb0d8',
          400: '#6485c2',
          500: '#3f5ea7',
          600: '#314987',
          700: '#283c70',
          800: '#1b294e',
          900: '#121829',
          950: '#0b0f19',
        },
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c5d7fc',
          300: '#9bbaf9',
          400: '#6a93f5',
          500: '#3b6beb',
          600: '#254deb',
          700: '#1d3ad7',
          800: '#1e31af',
          900: '#1e2e8a',
          950: '#111b54',
          DEFAULT: '#3b6beb',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'laser': 'laser 3s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'gradient-y': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'top center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'bottom center' },
        },
        'gradient-xy': {
          '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left top' },
          '50%': { 'background-size': '400% 400%', 'background-position': 'right bottom' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        laser: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' }
        }
      }
    },
  },
  plugins: [],
}
