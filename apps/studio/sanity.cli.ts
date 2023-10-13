import { defineCliConfig } from '@sanity/cli'

export default defineCliConfig({
  vite: (config) => ({
    ...config,

    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@sanity/composer': require.resolve('../../packages/composer/src'),
      },
    },
  }),
})
