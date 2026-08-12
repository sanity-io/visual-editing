import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {expect, test} from 'vitest'

/**
 * These tests assert the shape of the built package (`turbo.json` orders `build` before
 * `test`): the published dist is the entire product of this package, and 1.1.0 shipped a
 * regression no source-level test could catch — an `import './style.css'` statement in the
 * lazy overlay chunk, which crashes every native ESM consumer (`<script type="module">`,
 * import maps, and CDNs like esm.sh that serve the file as `text/css`).
 */
const distDir = fileURLToPath(new URL('../dist', import.meta.url))

/** Matches static and dynamic stylesheet imports, in minified output too. */
const cssImport = /(?:\bimport\b|\bfrom\b)\s*\(?\s*['"][^'"]*\.css['"]/

/** The marker `src/injectStyles.ts` sets on the `<style>` element it injects. */
const marker = 'data-sanity-visual-editing-standalone'

function readDistChunks(): {fileName: string; code: string}[] {
  expect(existsSync(distDir), 'dist/ is missing — run `pnpm build` first').toBe(true)
  return readdirSync(distDir)
    .filter((fileName) => fileName.endsWith('.js'))
    .map((fileName) => ({fileName, code: readFileSync(join(distDir, fileName), 'utf8')}))
}

test('ships no stylesheet import statements in the dist JS', () => {
  for (const {fileName, code} of readDistChunks()) {
    expect(cssImport.test(code), `${fileName} must not import a stylesheet`).toBe(false)
  }
})

test('injects the stylesheet at runtime from a lazy chunk, keeping the entry lean', () => {
  const chunks = readDistChunks()
  const entry = chunks.find(({fileName}) => fileName === 'index.js')
  const injectors = chunks.filter(({code}) => code.includes(marker))

  expect(entry, 'dist/index.js must exist').toBeDefined()
  expect(entry?.code, 'the entry must not carry the stylesheet injection').not.toContain(marker)
  expect(injectors, 'exactly one lazy chunk must carry the stylesheet injection').toHaveLength(1)
})

test('emits the stylesheet asset behind the ./style.css export', () => {
  const styleSheet = join(distDir, 'style.css')
  expect(existsSync(styleSheet), 'dist/style.css must exist').toBe(true)
  expect(readFileSync(styleSheet, 'utf8')).toContain('{')
})
