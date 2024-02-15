import { describe, expect, test } from 'vitest'

import {
  ACTION_PERSPECTIVE,
  ACTION_VIEWPORT,
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
  test('changing the viewport', () => {
    let next = presentationReducer(state, {
      type: ACTION_VIEWPORT,
      viewport: 'mobile',
    })
    expect(next).toMatchObject({ viewport: 'mobile' })
    next = presentationReducer(next, {
      type: ACTION_VIEWPORT,
      viewport: 'desktop',
    })
    expect(next).toMatchObject({ viewport: 'desktop' })
    next = presentationReducer(next, {
      type: ACTION_VIEWPORT,
      // @ts-expect-error - testing edge case
      viewport: 'invalid',
    })
    expect(next).toMatchObject({ viewport: 'desktop' })
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
  test('handling the `viewport` URLSearchParam', () => {
    expect(presentationReducerInit({ viewport: 'mobile' })).toMatchObject({
      viewport: 'mobile',
    })
    expect(presentationReducerInit({ viewport: 'desktop' })).toMatchObject({
      viewport: 'desktop',
    })
    expect(presentationReducerInit({ viewport: 'tablet' })).toMatchObject({
      viewport: 'desktop',
    })
    expect(presentationReducerInit({ viewport: 'invalid' })).toMatchObject({
      viewport: 'desktop',
    })
    expect(
      // @ts-expect-error - testing edge case
      presentationReducerInit({ viewport: null }),
    ).toMatchObject({
      viewport: 'desktop',
    })
    expect(presentationReducerInit({ viewport: undefined })).toMatchObject({
      viewport: 'desktop',
    })
  })
})
