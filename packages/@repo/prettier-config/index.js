const preset = require('@sanity/prettier-config')

/** @type {import("prettier").Config} */
const config = {
  ...preset,
  plugins: [
    ...preset.plugins,
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-astro',
    'prettier-plugin-svelte',
    'prettier-plugin-tailwindcss',
  ],
}

module.exports = config
