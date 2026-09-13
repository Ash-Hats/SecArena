/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
