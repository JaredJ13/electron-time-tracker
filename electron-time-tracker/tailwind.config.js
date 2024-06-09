/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lobster: ['Lobster', 'sans-serif'],
        robotoCondensed: ['Roboto Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

