/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
}