'use strict'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: require('@sanity/demo/tailwind').theme,
  plugins: [require('@tailwindcss/typography')],
}
