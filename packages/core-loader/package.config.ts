import { defineConfig } from '@sanity/pkg-utils'

import baseConfig from '../../package.config'

export default defineConfig({
  ...baseConfig,
  extract: {
    ...baseConfig.extract,
    bundledPackages: [
      ...(baseConfig.extract?.bundledPackages || []),
      'nanostores',
    ],
  },
})
