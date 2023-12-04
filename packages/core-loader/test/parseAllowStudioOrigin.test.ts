import { describe, expect, test } from 'vitest'

import { parseAllowStudioOrigin } from '../src/live-mode/parseAllowStudioOrigin'

describe('allowStudioOrigin handling', () => {
  test('same-origin', () => {
    expect(parseAllowStudioOrigin('same-origin')).toBe('http://localhost:3000')
  })

  test('Absolute URL', () => {
    expect(parseAllowStudioOrigin('https://my.sanity.studio/')).toBe(
      'https://my.sanity.studio',
    )
  })

  test('Relative URL', () => {
    expect(parseAllowStudioOrigin('/studio')).toBe('http://localhost:3000')
  })

  test('Invalid URL', () => {
    expect(() =>
      parseAllowStudioOrigin('//'),
    ).toThrowErrorMatchingInlineSnapshot('"Invalid URL"')
  })
})
