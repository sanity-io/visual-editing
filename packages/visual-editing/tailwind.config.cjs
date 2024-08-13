'use strict'

const {theme} = require('@sanity/demo/tailwind')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/stories/**/*.{ts,tsx}'],
  darkMode: 'selector',
  theme,
  plugins: [require('@tailwindcss/typography')],
}
