import {defineCliConfig} from '@sanity/cli'

export default defineCliConfig({
  reactStrictMode: true,
  vite: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'apps-common/env': require.resolve('../common/src/env'),
          'apps-common/queries': require.resolve('../common/src/queries'),
          'apps-common/utils': require.resolve('../common/src/utils'),
          'apps-common': require.resolve('../common/src'),
          '@sanity/presentation': require.resolve('../../packages/presentation/src'),
        },
      },
    }
  },
})
