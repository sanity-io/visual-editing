import {createDataAttribute as createDataAttributeSource} from '@sanity/visual-editing/create-data-attribute'
import {enableVisualEditing as enableVisualEditingSource} from '@sanity/visual-editing/enable-visual-editing'
import {expect, expectTypeOf, test} from 'vitest'

import * as standalone from './index'

test('exposes only the standalone runtime API', () => {
  expect(Object.keys(standalone).sort()).toEqual(['createDataAttribute', 'enableVisualEditing'])
})

test('preserves the source package implementations and types', () => {
  expect(standalone.createDataAttribute).toBeTypeOf('function')
  expect(standalone.enableVisualEditing).toBeTypeOf('function')
  expectTypeOf(standalone.createDataAttribute).toEqualTypeOf(createDataAttributeSource)
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
