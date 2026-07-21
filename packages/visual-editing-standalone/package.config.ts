import baseConfig from '@repo/package.config'
import commonjs from '@rollup/plugin-commonjs'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  // The standalone build is deliberately self-contained. Dependencies are
  // build inputs only and must never remain as external runtime imports.
  external: () => [],
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  rollup: {
    ...baseConfig.rollup,
    plugins: (plugins) =>
      plugins.map((plugin) =>
        plugin.name === 'commonjs'
          ? commonjs({
              extensions: ['.js', '.mjs'],
              transformMixedEsModules: true,
            })
          : plugin,
      ),
    treeshake: {
      preset: 'smallest',
      manualPureFunctions: ['createElement', 'forwardRef', 'memo', 'styled'],
    },
  },
})
