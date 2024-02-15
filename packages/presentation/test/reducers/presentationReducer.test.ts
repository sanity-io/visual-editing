import { describe, expect, test } from 'vitest'

import {
  ACTION_PERSPECTIVE,
  presentationReducer,
  presentationReducerInit,
} from '../../src/reducers/presentationReducer'

/**
 * Test state changes depending on the action that is dispatched.
 * When testing these it's important to handle things that TypeScript can't easily pick up on.
 * Such as:
 * - action payloads that have untrusted data, such as those coming from postMessage events
 * - entropy in the state over time, some state transitions can have edge cases that are hard to predict
 */
describe('presentationReducer', () => {
  const state = presentationReducerInit({})
  test('changing the perspective', () => {
    let next = presentationReducer(state, {
      type: ACTION_PERSPECTIVE,
      perspective: 'published',
    })
    expect(next).toMatchObject({ perspective: 'published' })
    next = presentationReducer(next, {
      type: ACTION_PERSPECTIVE,
      perspective: 'previewDrafts',
    })
    expect(next).toMatchObject({ perspective: 'previewDrafts' })
    next = presentationReducer(next, {
      type: ACTION_PERSPECTIVE,
      // @ts-expect-error - testing edge case
      perspective: 'invalid',
    })
    expect(next).toMatchObject({ perspective: 'previewDrafts' })
  })
})

/**
 * Test reducer state initialization which needs to deal with state coming from
 * untrusted sources such as:
 * - localStorage
 * - URLSearchParams
 */
describe('presentationReducerInit', () => {
  test('handling the `perspective` URLSearchParam', () => {
    expect(presentationReducerInit({ perspective: 'published' })).toMatchObject(
      {
        perspective: 'published',
      },
    )
    expect(
      presentationReducerInit({ perspective: 'previewDrafts' }),
    ).toMatchObject({
      perspective: 'previewDrafts',
    })
    expect(presentationReducerInit({ perspective: 'raw' })).toMatchObject({
      perspective: 'previewDrafts',
    })
    expect(presentationReducerInit({ perspective: 'invalid' })).toMatchObject({
      perspective: 'previewDrafts',
    })
    expect(
      // @ts-expect-error - testing edge case
      presentationReducerInit({ perspective: null }),
    ).toMatchObject({
      perspective: 'previewDrafts',
    })
    expect(presentationReducerInit({ perspective: undefined })).toMatchObject({
      perspective: 'previewDrafts',
    })
  })
})
