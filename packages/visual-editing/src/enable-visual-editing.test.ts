import {describe, expect, test} from 'vitest'

import {enableVisualEditing} from './enable-visual-editing'
import {enableVisualEditing as enableVisualEditingImplementation} from './ui/enableVisualEditing'

describe('enable-visual-editing entry point', () => {
  test('re-exports the enableVisualEditing implementation', () => {
    expect(enableVisualEditing).toBe(enableVisualEditingImplementation)
  })
})
