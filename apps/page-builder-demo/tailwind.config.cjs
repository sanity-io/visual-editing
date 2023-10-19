'use strict'

const { theme } = require('@sanity/demo/tailwind')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme,
  plugins: [require('@tailwindcss/typography')],
}
