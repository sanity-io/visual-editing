import { defineConfig } from '@sanity/pkg-utils'

import baseConfig from '../../package.config'

export default defineConfig({
  ...baseConfig,
  // `@sanity/overlays` isn't designed to be server side rendered
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  external: (prev) => [
    ...prev.filter(
      (dep) => dep !== '@sanity/ui' && dep !== 'styled-components',
    ),
    // deps used by '@sanity/ui',
    '@floating-ui/react-dom',
    '@sanity/color',
    '@sanity/icons',
    // 'framer-motion', commented out as it creates a junk import
    'react-refractor',
    'react-is',

    // deps used by 'styled-components',
    '@emotion/is-prop-valid',
    '@emotion/unitless',
    // 'shallowequal', commented out as it creates a junk import
    'stylis',
    'tslib',
  ],
})
