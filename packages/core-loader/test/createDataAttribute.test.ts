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

  test('returns a resolved string (2 steps)', () => {
    const fromDocument = createDataAttribute({ baseUrl })
    expect(fromDocument({ id, type }, path)).toMatchInlineSnapshot(snapshot)
  })

  test('returns a resolved string (3 steps)', () => {
    const fromDocument = createDataAttribute({ baseUrl })
    const fromPath = fromDocument({ id, type })
    expect(fromPath(path)).toMatchInlineSnapshot(snapshot)
  })

  test('returns a function if document is omitted', () => {
    expect(createDataAttribute({ baseUrl })).toBeTypeOf('function')
  })

  test('returns a function if path is omitted', () => {
    expect(createDataAttribute({ baseUrl }, { id, type })).toBeTypeOf(
      'function',
    )
  })

  test('returns a function if path is omitted (2 steps)', () => {
    const fromDocument = createDataAttribute({ baseUrl })
    const fromPath = fromDocument({ id, type })
    expect(fromPath).toBeTypeOf('function')
  })

  test('returns a resolved string using `scope`', () => {
    const fromPath = createDataAttribute({ baseUrl }, { id, type })
    const scoped = fromPath.scope(['sections'])
    expect(scoped([{ _key: '0bd049fc047a' }, 'style'])).toMatchInlineSnapshot(
      snapshot,
    )
  })
})
