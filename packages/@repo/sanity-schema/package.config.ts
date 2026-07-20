import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  strictOptions: {
    noSanityClientPeerDependency: 'off',
    noSanityUiPeerDependency: 'off',
    noReactDependency: 'off',
    noSanityIconsPeerDependency: 'off',
    noRxjsPeerDependency: 'off',
  },
})
