import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig, type UserConfig} from 'tsdown'

/**
 * The bundled declarations re-export types from `@sanity/visual-editing`, whose type graph
 * transitively visits `rxjs` (via `@sanity/types` and `@sanity/client`). None of the rxjs
 * declarations survive into this package's public API, but the dts bundler still hoists two
 * file-level artifacts from the visited files: dangling `/// <reference path="..." />`
 * directives (a TS6053 error for `skipLibCheck: false` consumers, as the referenced files
 * don't exist in `dist`) and a `Symbol.observable` global augmentation this package should
 * not ship. Externalizing the packages instead would leak bare type imports, so strip the
 * artifacts from the emitted declarations and fail the build if anything similar remains.
 */
const RE_REFERENCE_DIRECTIVE = /^\/{3}\s*<reference\s+path=[^\n]*\n/gm
const RE_RXJS_GLOBAL_AUGMENTATION =
  /(?:\/\*\*[^*]*(?:\*(?!\/)[^*]*)*\*\/\n)?declare global \{\n\s*interface SymbolConstructor \{\n\s*readonly observable: symbol;\n\s*\}\n\}\n/g

const cleanBundledDeclarations: NonNullable<UserConfig['plugins']> = [
  {
    name: 'clean-bundled-declarations',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.fileName.endsWith('.d.ts')) continue
        chunk.code = chunk.code
          .replace(RE_REFERENCE_DIRECTIVE, '')
          .replace(RE_RXJS_GLOBAL_AUGMENTATION, '')
        if (/\/{3}\s*<reference|declare global/.test(chunk.code)) {
          this.error(`Unexpected reference directive or global augmentation in ${chunk.fileName}`)
        }
      }
    },
  },
]

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
    plugins: cleanBundledDeclarations,
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
