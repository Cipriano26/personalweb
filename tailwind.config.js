/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class-based dark mode so JS can toggle it dynamically
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/preline/dist/*.js"
  ],
  theme: {
    extend: {
      colors: {
        // map some semantic colors to CSS variables so they switch with the .dark class
        'bg-primary': 'var(--color-bg)',
        'text-primary': 'var(--color-text)'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}