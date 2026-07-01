import sharedConfig from '@repo/eslint-config'
import storybook from 'eslint-plugin-storybook'

export default [
  {
    ignores: ['dist/**', 'dist-svelte/**', 'storybook-static/**', '.svelte-kit/**'],
  },
  ...sharedConfig,
  ...storybook.configs['flat/recommended'],
]
