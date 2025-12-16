// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': { /* primary ranglarini tasdiqlang */
          500: '#3b82f6', 
          600: '#2563eb',
          700: '#1d4ed8',
        },
        'gray': {
           50: '#f9fafb',
           100: "#f3f4f6",
           900: '#111827',
           // qolgan ranglar
        }
      }
    },
  },
  plugins: [],
}