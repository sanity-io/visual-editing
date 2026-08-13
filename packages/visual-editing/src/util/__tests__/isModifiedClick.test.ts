import {describe, expect, test} from 'vitest'

import {isModifiedClick} from '../isModifiedClick'

function click(init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent('click', {bubbles: true, cancelable: true, button: 0, ...init})
}

describe('isModifiedClick', () => {
  test('is false for a primary click with no modifiers', () => {
    expect(isModifiedClick(click())).toBe(false)
  })

  test.each(['altKey', 'metaKey', 'ctrlKey', 'shiftKey'] as const)(
    'is true when %s is set',
    (key) => {
      expect(isModifiedClick(click({[key]: true}))).toBe(true)
    },
  )

  test('is true for a non-primary button', () => {
    expect(isModifiedClick(click({button: 1}))).toBe(true)
  })
})
