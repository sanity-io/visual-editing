import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {expect, test} from 'vitest'

import pkg from '../package.json'

/**
 * These tests assert the shape of the built package (`turbo.json` orders `build` before
 * `test`): the published dist is the entire product of this package, and both stylesheet
 * wirings that shipped before broke native ESM consumers in ways no source-level test could
 * catch. The relative `import './style.css'` of 1.1.0 and the self-referential
 * `import '<pkg>/style.css'` of 1.2.0 were each externalized by esm.sh's build to a
 * `style.css.mjs` URL that redirects to the raw `text/css` file, which browsers refuse to
 * run as a module. The contract since 2.0.0: the published JS never references the
 * stylesheet — consumers import the `./styles.css` export themselves.
 */
const distDir = fileURLToPath(new URL('../dist', import.meta.url))

/** Matches any stylesheet import (static or dynamic, relative or bare), minified too. */
const cssImport = /(?:\bimport\b|\bfrom\b)\s*\(?\s*['"][^'"]*\.css['"]/

function readDistChunks(): {fileName: string; code: string}[] {
  expect(existsSync(distDir), 'dist/ is missing — run `pnpm build` first').toBe(true)
  return readdirSync(distDir)
    .filter((fileName) => fileName.endsWith('.js'))
    .map((fileName) => ({fileName, code: readFileSync(join(distDir, fileName), 'utf8')}))
}

test('ships no stylesheet imports in the dist JS', () => {
  const chunks = readDistChunks()
  expect(chunks.length).toBeGreaterThan(0)
  for (const {fileName, code} of chunks) {
    expect(cssImport.test(code), `${fileName} must not import a stylesheet`).toBe(false)
  }
})

test('emits the stylesheet behind the plain ./styles.css export', () => {
  const styleSheet = join(distDir, 'styles.css')
  expect(existsSync(styleSheet), 'dist/styles.css must exist').toBe(true)
  expect(readFileSync(styleSheet, 'utf8')).toContain('{')

  expect(pkg.exports['./styles.css']).toBe('./dist/styles.css')
  expect(pkg.publishConfig.exports['./styles.css']).toBe('./dist/styles.css')
})

test('ships neither the removed ./style.css export nor its Node shim', () => {
  expect(pkg.exports).not.toHaveProperty('./style.css')
  expect(pkg.publishConfig.exports).not.toHaveProperty('./style.css')

  const files = readdirSync(distDir)
  expect(files).not.toContain('style.css')
  expect(files).not.toContain('style-css.js')
  expect(files).not.toContain('style-css.d.ts')
})
