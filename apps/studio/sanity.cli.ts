import {defineCliConfig} from '@sanity/cli'

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
        '@sanity/presentation': require.resolve('../../packages/presentation/src'),
        'sanity/_internal': require.resolve('sanity/_internal'),
        'sanity/cli': require.resolve('sanity/cli'),
        'sanity/desk': require.resolve('sanity/desk'),
        'sanity/router': require.resolve('sanity/router'),
        'sanity/structure': require.resolve('sanity/structure'),
        'sanity': require.resolve('sanity'),
        'styled-components': require.resolve('styled-components'),
      },
    },
  }),
})
