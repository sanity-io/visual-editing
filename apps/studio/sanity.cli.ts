import {defineCliConfig} from '@sanity/cli'

export default defineCliConfig({
  reactStrictMode: true,
  vite: (config) => {
    return {
      ...config,
      define: {
        ...config.define,
        // Speed up styled-components in dev mode: https://github.com/sanity-io/sanity/pull/7440
        'process.env.SC_DISABLE_SPEEDY': JSON.stringify('false'),
      },
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
