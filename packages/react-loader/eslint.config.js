import sharedConfig from '@repo/eslint-config'

export default [
  {
    ignores: ['dist/**'],
  },
  ...sharedConfig,
]
