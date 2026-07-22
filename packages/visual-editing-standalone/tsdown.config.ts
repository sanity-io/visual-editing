import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig, type UserConfig} from 'tsdown'

export default mergeConfig(
  await defineConfig({
    tsconfig: 'tsconfig.dist.json',
    // The published artifact is browser-only, like `@sanity/visual-editing` itself.
    platform: 'browser',
    // Fold production branches (React, styled-components, motion, etc.) so the
    // subsequent treeshake pass can drop development-only code.
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.DEV': 'false',
      'import.meta.env.PROD': 'true',
      'import.meta.env.MODE': JSON.stringify('production'),
    },
    deps: {
      // This package is deliberately self-contained: bundle every dependency,
      // including the lazy-loaded React runtime, into package-internal chunks.
      alwaysBundle: /./,
      onlyBundle: false,
      // Fail the build if any bare import were to leak into the output.
      onlyImport: [],
    },
  }),
  {
    // Mirror `@sanity/visual-editing`'s `preset: 'smallest'` + pure React/styled
    // helpers so unused lodash/rxjs/motion/icon exports can be eliminated from
    // the fully-bundled standalone artifact.
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      propertyWriteSideEffects: false,
      unknownGlobalSideEffects: false,
      manualPureFunctions: [
        'createElement',
        'cloneElement',
        'createContext',
        'forwardRef',
        'lazy',
        'memo',
        'startTransition',
        'styled',
        'css',
        'keyframes',
        'createGlobalStyle',
      ],
    },
    // `@sanity/tsdown-config` leaves mangle/codegen off for typical libraries;
    // this package ships a self-contained browser bundle, so enable both.
    minify: {
      compress: true,
      mangle: true,
      codegen: true,
    },
  },
) satisfies UserConfig
