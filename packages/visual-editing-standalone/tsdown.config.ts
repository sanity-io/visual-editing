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
    // Source maps dwarf this self-contained distribution and are not loaded by its CDN use case.
    sourcemap: false,
    // Fold all common production guards before minification and tree shaking.
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
    // React mutates internal fields while scheduling renders, so property writes must remain
    // observable. Module pruning and pure factory hints provide the safe tree-shaking wins.
    treeshake: {
      moduleSideEffects: false,
      manualPureFunctions: ['createElement', 'forwardRef', 'lazy', 'memo', 'styled'],
    },
    // Unlike a typical library, consumers download this package's bundled dependencies.
    minify: {
      compress: true,
      mangle: true,
      codegen: true,
    },
  },
) satisfies UserConfig
