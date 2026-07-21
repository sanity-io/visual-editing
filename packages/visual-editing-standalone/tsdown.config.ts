import {defineConfig} from '@sanity/tsdown-config'
import type {UserConfig} from 'tsdown'

export default defineConfig({
  tsconfig: 'tsconfig.dist.json',
  // The published artifact is browser-only, like `@sanity/visual-editing` itself.
  platform: 'browser',
  define: {'process.env.NODE_ENV': JSON.stringify('production')},
  deps: {
    // This package is deliberately self-contained: bundle every dependency,
    // including the lazy-loaded React runtime, into package-internal chunks.
    alwaysBundle: /./,
    onlyBundle: false,
    // Fail the build if any bare import were to leak into the output.
    onlyImport: [],
  },
}) satisfies Promise<UserConfig>
