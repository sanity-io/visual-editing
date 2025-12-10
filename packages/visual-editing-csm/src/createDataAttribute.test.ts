import {describe, expect, test} from 'vitest'

import {createDataAttribute} from './createDataAttribute'

describe('createDataAttribute', () => {
  const type = 'page'
  const id = 'drafts.home'
  const basePath = ['sections']
  const sectionPath = [{_key: '0bd049fc047a'}, 'style']
  const path = 'sections:0bd049fc047a.style'
  const baseUrl = '/studio'

  test('throws if id is omitted', () => {
    const scopedWithoutId = createDataAttribute({type})
    // @ts-expect-error expected throw
    expect(() => scopedWithoutId(path)).toThrowError('required')
  })

  test('throws if type is omitted', () => {
    const scopedWithoutType = createDataAttribute({id})
    // @ts-expect-error expected throw
    expect(() => scopedWithoutType(path)).toThrowError('required')
  })

  test('throws if path is omitted', () => {
    const scoped = createDataAttribute({id, type})
    // @ts-expect-error expected throw
    expect(() => scoped()).toThrowError('required')
  })

  test('throws if `.toString` is used without a path', () => {
    const scopedWithPath = createDataAttribute({id, type})
    expect(() => scopedWithPath.toString()).toThrowError('required')
  })

  test('resolves using function call', () => {
    const scoped = createDataAttribute({id, type})
    expect(scoped(path)).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2F"`,
    )
  })

  test('resolves using empty function call if path is set', () => {
    const scopedWithPath = createDataAttribute({id, type, path})
    expect(scopedWithPath()).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2F"`,
    )
  })

  test('resolves using `.toString`', () => {
    const scopedWithPath = createDataAttribute({id, type, path})
    expect(scopedWithPath.toString()).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2F"`,
    )
  })

  test('resolves using `.toString` after setting path with `.scope`', () => {
    const scoped = createDataAttribute({id, type})
    expect(scoped.scope(path).toString()).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2F"`,
    )
  })

  test('resolves with a custom basePath', () => {
    const scopedWithBaseUrl = createDataAttribute({id, type, baseUrl})
    expect(scopedWithBaseUrl(path)).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2Fstudio"`,
    )
  })

  test('resolves combined path using attribute and `.scope`', () => {
    const scopedWithPath = createDataAttribute({id, type, path: basePath})
    expect(scopedWithPath.scope(sectionPath).toString()).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2F"`,
    )
  })

  test('resolves combined path using `.scope` and function call', () => {
    const scoped = createDataAttribute({id, type})
    expect(scoped.scope(basePath)(sectionPath)).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2F"`,
    )
  })

  test('combines a baseUrl with id and type', () => {
    const scopedWithBaseUrlOnly = createDataAttribute({baseUrl})
    const scoped = scopedWithBaseUrlOnly.combine({id, type})
    expect(scoped(path)).toMatchInlineSnapshot(
      `"id=home;type=page;path=sections:0bd049fc047a.style;base=%2Fstudio"`,
    )
  })
})
