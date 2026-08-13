import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {expect, test} from 'vitest'

import pkg from '../package.json'

/**
 * These tests assert the shape of the built package (`turbo.json` orders `build` before
 * `test`): the published dist is the entire product of this package, and 1.1.0 shipped a
 * regression no source-level test could catch — a relative `import './style.css'` statement
 * in the lazy overlay chunk, which crashes every native ESM consumer (esm.sh rewrites it to a
 * `.css.mjs` URL that redirects to the raw `text/css` file, which browsers refuse to run as a
 * module).
 */
const distDir = fileURLToPath(new URL('../dist', import.meta.url))

/** Matches relative stylesheet imports (static or dynamic), in minified output too. */
const relativeCssImport = /(?:\bimport\b|\bfrom\b)\s*\(?\s*['"]\.\.?\/[^'"]*\.css['"]/

/**
 * The self-referential import `cssNodeCompatPlugin` prepends to the entry: resolved through
 * the conditional `./style.css` export, so every runtime gets a loadable module (stylesheet
 * for bundlers, the no-op shim for Node and esm.sh).
 */
const selfReferentialCssImport = /import\s*['"]@sanity\/visual-editing-standalone\/style\.css['"]/

/** The conditional CSS export pattern (`exports.nodeCompat`), like `@sanity/ui` publishes. */
const conditionalCssExport = {
  types: './dist/style-css.d.ts',
  browser: './dist/style.css',
  style: './dist/style.css',
  node: './dist/style-css.js',
  default: './dist/style-css.js',
}

function readDistChunks(): {fileName: string; code: string}[] {
  expect(existsSync(distDir), 'dist/ is missing — run `pnpm build` first').toBe(true)
  return readdirSync(distDir)
    .filter((fileName) => fileName.endsWith('.js') && !fileName.endsWith('style-css.js'))
    .map((fileName) => ({fileName, code: readFileSync(join(distDir, fileName), 'utf8')}))
}

test('ships no relative stylesheet imports in the dist JS', () => {
  for (const {fileName, code} of readDistChunks()) {
    expect(
      relativeCssImport.test(code),
      `${fileName} must not import a stylesheet by relative path`,
    ).toBe(false)
  }
})

test('imports the stylesheet self-referentially from the entry only', () => {
  const chunks = readDistChunks()
  const entry = chunks.find(({fileName}) => fileName === 'index.js')
  const importers = chunks.filter(({code}) => selfReferentialCssImport.test(code))

  expect(entry, 'dist/index.js must exist').toBeDefined()
  expect(
    selfReferentialCssImport.test(entry?.code ?? ''),
    'the entry must import the stylesheet through the conditional ./style.css export',
  ).toBe(true)
  expect(
    importers.map(({fileName}) => fileName),
    'only the entry carries the stylesheet import',
  ).toEqual(['index.js'])
})

test('emits the stylesheet, its no-op shim, and the conditional export', () => {
  const styleSheet = join(distDir, 'style.css')
  expect(existsSync(styleSheet), 'dist/style.css must exist').toBe(true)
  expect(readFileSync(styleSheet, 'utf8')).toContain('{')
  expect(existsSync(join(distDir, 'style-css.js')), 'dist/style-css.js must exist').toBe(true)
  expect(existsSync(join(distDir, 'style-css.d.ts')), 'dist/style-css.d.ts must exist').toBe(true)

  expect(pkg.exports['./style.css']).toEqual(conditionalCssExport)
  expect(pkg.publishConfig.exports['./style.css']).toEqual(conditionalCssExport)
})
