import {defineCliConfig} from '@sanity/cli'

export default defineCliConfig({
  reactStrictMode: true,
  reactCompiler: {target: '19'},
  vite: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@sanity/presentation': require.resolve('../../packages/presentation/src'),
        },
        dedupe: [...(config.resolve?.dedupe || []), 'sanity'],
      },
      server: {
        ...config.server,
        watch: {
          ...config.server?.watch,
          ignored: ['!**/node_modules/@repo/sanity-schema/**'],
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: [...(config.optimizeDeps?.exclude || []), '@repo/sanity-schema'],
        include: [
          ...(config.optimizeDeps?.include || []),
          '@sanity/assist',
          '@sanity/color-input',
          '@sanity/mutator',
        ],
      },
    }
  },
})
