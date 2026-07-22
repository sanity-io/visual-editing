import {defineConfig} from '@sanity/tsdown-config'
import {RolldownMagicString} from 'rolldown'
import {parseAst} from 'rolldown/parseAst'
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

/**
 * `@sanity/ui` publishes prebuilt files where every component is followed by a top-level
 * `Component.displayName = '...'` assignment. Rolldown keeps assignment statements it cannot
 * prove side-effect-free, and the assignment references the component, so each one pins its
 * component into the bundle — even the dozens of components the overlays never render.
 * (`treeshake.propertyWriteSideEffects: false` is not a safe fix: it also discards needed
 * property writes elsewhere, e.g. react-dom's fiber mutations.)
 *
 * Merge each adjacent declaration + assignment pair into a single `@__PURE__`-annotated
 * initializer instead: `const X = forwardRef(...); X.displayName = 'X'` becomes
 * `const X = /* @__PURE__ *\/ ((c) => (c.displayName = 'X', c))(forwardRef(...))`.
 * Behavior is identical when a component is used (the displayName is still set), while
 * unused components become dead code that `treeshake.manualPureFunctions` can eliminate.
 */
const RE_SANITY_UI_DIST = /[\\/]node_modules[\\/]@sanity[\\/]ui[\\/]dist[\\/].+\.mjs$/
const treeshakableVendorDisplayNames: NonNullable<UserConfig['plugins']> = [
  {
    name: 'treeshakable-vendor-display-names',
    transform: {
      filter: {id: RE_SANITY_UI_DIST},
      handler(code, id) {
        if (!code.includes('.displayName')) return null
        const magic = new RolldownMagicString(code)
        const {body} = parseAst(code, null, id)
        let merged = 0
        let unmerged = 0
        for (let index = 1; index < body.length; index++) {
          const statement = body[index]!
          if (statement.type !== 'ExpressionStatement') continue
          const {expression} = statement
          if (
            expression.type !== 'AssignmentExpression' ||
            expression.operator !== '=' ||
            expression.left.type !== 'MemberExpression' ||
            expression.left.computed ||
            expression.left.object.type !== 'Identifier' ||
            expression.left.property.type !== 'Identifier' ||
            expression.left.property.name !== 'displayName' ||
            expression.right.type !== 'Literal' ||
            typeof expression.right.value !== 'string'
          ) {
            continue
          }
          // Only merge assignments whose component `const` declaration precedes them with
          // nothing but hoisted `function` declarations in between (the react-compiler emits
          // helper functions there), so evaluation order is provably unchanged.
          const componentName = expression.left.object.name
          let previousIndex = index - 1
          let isHoistedFunctionComponent = false
          while (previousIndex >= 0) {
            const candidate = body[previousIndex]!
            if (candidate.type !== 'FunctionDeclaration') break
            if (candidate.id.name === componentName) {
              // `function X() {} ... X.displayName = '...'` — hoisted function components
              // (e.g. providers, or dynamic-import-only files like `_chunks/refractor.mjs`).
              // Converting them to a mergeable `const` would change hoisting semantics, so
              // leave them pinned; there are only a handful and they are all rendered anyway.
              isHoistedFunctionComponent = true
              break
            }
            previousIndex--
          }
          if (isHoistedFunctionComponent) continue
          const previous = previousIndex >= 0 ? body[previousIndex]! : undefined
          const declarator =
            previous?.type === 'VariableDeclaration' && previous.kind === 'const'
              ? previous.declarations.find(
                  (candidate) =>
                    candidate.id.type === 'Identifier' && candidate.id.name === componentName,
                )
              : undefined
          if (!declarator?.init) {
            unmerged++
            continue
          }
          const displayName = code.slice(expression.right.start, expression.right.end)
          magic.appendLeft(
            declarator.init.start,
            `/* @__PURE__ */ ((c) => (c.displayName = ${displayName}, c))(`,
          )
          magic.appendLeft(declarator.init.end, ')')
          magic.remove(statement.start, statement.end)
          merged++
        }
        if (unmerged > 0) {
          this.warn(
            `${unmerged} \`Component.displayName = '...'\` assignment(s) in ${id} did not match ` +
              'the expected `const Component = ...` shape — the @sanity/ui dist format may have ' +
              'changed, and the affected components will no longer tree-shake when unused.',
          )
        }
        if (merged === 0) return null
        // Copy the generated map into a plain object: rolldown's NAPI layer rejects the
        // `BindingSourceMap` class instance that `generateMap` returns.
        const map = magic.generateMap({hires: true, source: id})
        return {
          code: magic.toString(),
          map: {
            mappings: map.mappings,
            names: [...map.names],
            sources: [...map.sources],
            version: map.version,
          },
        }
      },
    },
  },
]

export default mergeConfig(
  await defineConfig({
    tsconfig: 'tsconfig.dist.json',
    // The published artifact is browser-only, like `@sanity/visual-editing` itself.
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      /**
       * `styled-components` reads its escape hatches from `process.env` (statically) and from
       * bare globals (`typeof SC_DISABLE_SPEEDY == 'boolean'`). Pin them all to their browser
       * production defaults, then erase `process` itself: after `NODE_ENV` is inlined the only
       * remaining references are feature probes (`typeof process`) in code that never runs in
       * browsers, so the bundle ships without any Node-flavored dead branches.
       */
      'process.env.REACT_APP_SC_ATTR': 'undefined',
      'process.env.REACT_APP_SC_DISABLE_SPEEDY': 'undefined',
      'process.env.SC_ATTR': 'undefined',
      'process.env.SC_DISABLE_SPEEDY': 'undefined',
      process: 'undefined',
      SC_DISABLE_SPEEDY: 'false',
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
    plugins: [...treeshakableVendorDisplayNames, ...cleanBundledDeclarations],
    /**
     * The bundle inlines prebuilt library dists (React via CJS interop, `@sanity/ui`,
     * `styled-components`, ...) whose component factory calls carry no `@__PURE__`
     * annotations, so rolldown has to assume every `forwardRef(...)`/`styled(...)`/`lazy(...)`
     * call is side-effectful and keep each component `@sanity/ui` defines — not just the ones
     * the overlays render. Declaring the factories pure lets the unused components (and their
     * entire dependency subgraphs, like the lazy-loaded `refractor` syntax-highlighter chunk
     * behind `@sanity/ui`'s `Code` component) tree-shake away.
     */
    treeshake: {
      manualPureFunctions: [
        'createContext',
        'createGlobalStyle',
        'css',
        'forwardRef',
        'keyframes',
        'lazy',
        'memo',
        'styled',
      ],
    },
  },
) satisfies UserConfig
