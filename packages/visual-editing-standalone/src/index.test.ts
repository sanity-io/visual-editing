import {createDataAttribute as createDataAttributeSource} from '@sanity/visual-editing/create-data-attribute'
import {enableVisualEditing as enableVisualEditingSource} from '@sanity/visual-editing/enable-visual-editing'
import {expect, expectTypeOf, test} from 'vitest'

import pkg from '../package.json'
import * as standalone from './index'

test('exposes only the standalone runtime API', () => {
  expect(Object.keys(standalone).sort()).toEqual(['createDataAttribute', 'enableVisualEditing'])
})

test('exposes only the root entry point plus its stylesheet, and no runtime dependencies', () => {
  // `@sanity/ui@4` ships static styles as a stylesheet, extracted into a
  // package-internal `./style.css` asset (see `tsdown.config.ts` `css.inject`).
  expect(Object.keys(pkg.exports).sort()).toEqual(['.', './package.json', './style.css'])
  expect(Object.keys(pkg.publishConfig.exports).sort()).toEqual([
    '.',
    './package.json',
    './style.css',
  ])
  expect(pkg).not.toHaveProperty('dependencies')
  expect(pkg).not.toHaveProperty('peerDependencies')
})

test('preserves the source package implementations and types', () => {
  expect(standalone.createDataAttribute).toBeTypeOf('function')
  expect(standalone.enableVisualEditing).toBeTypeOf('function')
  expectTypeOf(standalone.createDataAttribute).toEqualTypeOf(createDataAttributeSource)
  // oxlint-disable-next-line typescript/no-deprecated
  expectTypeOf<Parameters<typeof standalone.enableVisualEditing>[0]>().toMatchTypeOf<
    Parameters<typeof enableVisualEditingSource>[0]
  >()
  expectTypeOf<ReturnType<typeof standalone.enableVisualEditing>>().toEqualTypeOf<
    ReturnType<typeof enableVisualEditingSource>
  >()
})

test('creates data attributes through the standalone entry point', () => {
  const props = {
    baseUrl: 'https://example.sanity.studio',
    id: 'post-1',
    path: 'title',
    type: 'post',
  }

  expect(standalone.createDataAttribute(props).toString()).toBe(
    createDataAttributeSource(props).toString(),
  )
})
