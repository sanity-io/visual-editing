import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  extract: {enabled: false, checkTypes: false},
  tsconfig: 'tsconfig.build.json',
  dts: 'rolldown',
  strictOptions: {
    // `@sanity/client`, `rxjs`, `@sanity/ui` and `@sanity/icons` are
    // intentionally peer dependencies across these packages, to avoid
    // bundling/duplicating singletons that need to be shared with the
    // consuming application.
    noSanityClientPeerDependency: 'off',
    noRxjsPeerDependency: 'off',
    noSanityUiPeerDependency: 'off',
    noSanityIconsPeerDependency: 'off',
  },
})
