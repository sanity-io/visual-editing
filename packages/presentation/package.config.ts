import { defineConfig } from '@sanity/pkg-utils'

import baseConfig from '../../package.config'

export default defineConfig({
  ...baseConfig,
  external: ['@sanity/ui', 'react', 'react-dom', 'sanity', 'styled-components'],
})
