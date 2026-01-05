import {defineCliConfig} from '@sanity/cli'

export default defineCliConfig({
  api: {projectId: 'hiomol4a', dataset: 'development'},
  reactStrictMode: true,
  reactCompiler: {target: '19'},
  deployment: {appId: 'kp75luobnkn8sgzxcjran97e', autoUpdates: true},
  studioHost: 'visual-editing-test',
  vite: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
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
