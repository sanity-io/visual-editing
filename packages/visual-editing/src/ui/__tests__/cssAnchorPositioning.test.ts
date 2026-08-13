import {describe, expect, test} from 'vitest'

import {
  CSS_ANCHOR_POSITIONING_SUPPORTS,
  supportsCssAnchorPositioning,
} from '../cssAnchorPositioning'

describe('supportsCssAnchorPositioning', () => {
  test('is true only when CSS.supports reports anchors and try-fallbacks', () => {
    expect(supportsCssAnchorPositioning(() => true)).toBe(true)
    expect(supportsCssAnchorPositioning(() => false)).toBe(false)
  })

  test('asks CSS.supports with the same query the overlay chrome @supports rule uses', () => {
    const supportsFn = (conditionText: string) => {
      expect(conditionText).toBe(CSS_ANCHOR_POSITIONING_SUPPORTS)
      return true
    }

    expect(supportsCssAnchorPositioning(supportsFn)).toBe(true)
    expect(CSS_ANCHOR_POSITIONING_SUPPORTS).toContain('anchor-name: --sanity-ve-overlay')
    expect(CSS_ANCHOR_POSITIONING_SUPPORTS).toContain('position-try-fallbacks: flip-block')
  })
})
