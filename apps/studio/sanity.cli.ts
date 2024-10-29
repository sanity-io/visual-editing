import {defineCliConfig} from '@sanity/cli'
import viteReact from '@vitejs/plugin-react'

const ReactCompilerConfig = {
  target: '18',
}

export default defineCliConfig({
  reactStrictMode: true,
  vite: (config) => {
    const [, ...plugins] = config.plugins || []
    return {
      ...config,
      plugins: [
        viteReact({babel: {plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]]}}),
        ...plugins,
      ],
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
