/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#609dc9',
          500: '#3c81b2',
          600: '#2c6795',
          700: '#24537a',
          800: '#1e4362',
          900: '#0f2744',
          950: '#0a192f',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      }
    },
  },
  plugins: [],
}
