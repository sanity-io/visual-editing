import { defineCliConfig } from '@sanity/cli'

export default defineCliConfig({
  vite: (config) => ({
    ...config,

    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'apps-common/env': require.resolve('../common/src/env'),
        'apps-common/queries': require.resolve('../common/src/queries'),
        'apps-common/utils': require.resolve('../common/src/utils'),
        'apps-common': require.resolve('../common/src'),
        '@sanity/composer': require.resolve('../../packages/composer/src'),
      },
    },
  }),
})
