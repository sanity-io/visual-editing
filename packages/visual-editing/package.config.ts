import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  // `@sanity/visual-editing` isn't designed to be server side rendered
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
    // Since we embed `styled-components` as an implementation detail, setting this to a different value ensures userland won't see "multiple versions of styled-components`"" warnings
    // https://github.com/styled-components/styled-components/blob/6f6db180bd0ec89bd4342dc4b8f1eae0b34d8dca/packages/styled-components/src/constants.ts#L4-L8
    'process.env.SC_ATTR': 'data-styled-sanity',
  },
  rollup: {
    treeshake: {
      preset: 'smallest',
      manualPureFunctions: ['createElement', 'forwardRef', 'memo', 'styled'],
    },
  },
})
