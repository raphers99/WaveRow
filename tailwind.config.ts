import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1A3A2A',
          50:  '#E8F0EC',
          100: '#C5D9CC',
          200: '#9DC1AC',
          300: '#74A88B',
          400: '#4C9070',
          500: '#1A3A2A',
          600: '#163224',
          700: '#122A1E',
          800: '#0E2218',
          900: '#0A1A12',
        },
        mint: {
          DEFAULT: '#C8F5A0',
          50:  '#F4FDE8',
          100: '#E6FAC8',
          200: '#C8F5A0',
          300: '#A8EC74',
          400: '#88E348',
          500: '#6AD820',
          600: '#56AE1A',
          700: '#418413',
          800: '#2D5A0D',
          900: '#183006',
        },
        surface: '#F7F7F2',
        border: '#E8E8E0',
        charcoal: '#111111',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
