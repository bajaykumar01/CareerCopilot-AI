/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66f5',
          600: '#2544d9',
          700: '#1c31b3',
          800: '#1b2991',
          900: '#1b2673',
        }
      }
    },
  },
  plugins: [],
}
