/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          light: '#E6D5C3',
          DEFAULT: '#DCD7C9',
          dark: '#A27B5C'
        },
        darkgreen: {
          light: '#3F4F44',
          DEFAULT: '#2C392F',
          dark: '#232c25'
        },
        cyber: {
          dark: '#0a0e17',
          card: '#111827',
          accent: '#00f0ff',
          emerald: '#10b981',
          crimson: '#f43f5e',
          slate: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
