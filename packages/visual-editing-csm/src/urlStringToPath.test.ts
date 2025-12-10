import {describe, expect, test} from 'vitest'

import {urlStringToPath} from './urlStringToPath'

describe('urlStringToPath should convert', () => {
  test('an array path of letters', () => {
    expect(urlStringToPath('array:key')).toEqual([
      'array',
      {
        _key: 'key',
      },
    ])
  })

  test('an array path containing numbers', () => {
    expect(urlStringToPath('array14:key')).toEqual([
      'array14',
      {
        _key: 'key',
      },
    ])
  })

  test('an array path with hyphens', () => {
    expect(urlStringToPath('array-path:key')).toEqual([
      'array-path',
      {
        _key: 'key',
      },
    ])
  })

  test('an array path with underscores', () => {
    expect(urlStringToPath('array_path:key')).toEqual([
      'array_path',
      {
        _key: 'key',
      },
    ])
  })

  test('an array path with mixed characters', () => {
    expect(urlStringToPath('4rr4y-p4th_m1x3d:key')).toEqual([
      '4rr4y-p4th_m1x3d',
      {
        _key: 'key',
      },
    ])
  })

  test('a key containing hyphens', () => {
    expect(urlStringToPath('array:some-key')).toEqual([
      'array',
      {
        _key: 'some-key',
      },
    ])
  })

  test('a key with a zero-index to a number', () => {
    expect(urlStringToPath('array:0')).toEqual(['array', 0])
  })

  test('a key with a positive index to a number', () => {
    expect(urlStringToPath('array:123')).toEqual(['array', 123])
  })

  test('a key with a leading zero to an object', () => {
    expect(urlStringToPath('array:0123')).toEqual([
      'array',
      {
        _key: '0123',
      },
    ])
  })

  test('a key with a tuple', () => {
    expect(urlStringToPath('array:123,456')).toEqual(['array', [123, 456]])
  })
})
