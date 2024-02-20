import { describe, expect, test } from 'vitest'

import { createDataAttribute } from '../src/createDataAttribute'

describe('createDataAttribute', () => {
  const type = 'page'
  const id = 'drafts.home'
  const path = 'sections:0bd049fc047a.style'
  const baseUrl = '/studio'
  const snapshot = `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2Fstudio"`

  test('returns a resolved string', () => {
    expect(
      createDataAttribute({ baseUrl }, { id, type }, path),
    ).toMatchInlineSnapshot(snapshot)
  })

  test('returns a function if document is omitted', () => {
    expect(createDataAttribute({ baseUrl })).toBeTypeOf('function')
  })

  test('returns a function if path is omitted', () => {
    expect(createDataAttribute({ baseUrl }, { id, type })).toBeTypeOf(
      'function',
    )
  })

  test('returns a function if path is omitted after scoping', () => {
    expect(createDataAttribute({ baseUrl })({ id, type })).toBeTypeOf(
      'function',
    )
  })

  test('returns a resolved string if first scoped to studio', () => {
    const createFromDocument = createDataAttribute({ baseUrl })
    const createFromPath = createFromDocument({ id, type })
    expect(createFromPath(path)).toMatchInlineSnapshot(snapshot)
  })

  test('returns a resolved string if first scoped to path', () => {
    const createFromDocument = createDataAttribute({ baseUrl })
    const createFromPath = createFromDocument({ id, type })
    const scoped = createFromPath.scope(['sections', { _key: '0bd049fc047a' }])
    expect(scoped('style')).toMatchInlineSnapshot(snapshot)
  })
})
