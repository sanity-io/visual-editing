import {expect, test} from 'vitest'
import type {WrappedValue} from './types'
import {unwrapData} from './unwrapData'

test('unwrap sanity image', () => {
  interface Data {
    image: {
      crop: {
        _type: 'sanity.imageCrop'
        top: number
        left: number
        right: number
        bottom: number
      }
    }
  }

  const wrapped: WrappedValue<Data> = {
    image: {
      crop: {
        _type: 'sanity.imageCrop',
        top: {
          $$type$$: 'sanity',
          path: 'image.crop.top',
          source: undefined,
          value: 0,
        },
        left: {
          $$type$$: 'sanity',
          path: 'image.crop.left',
          source: undefined,
          value: 0,
        },
        right: {
          $$type$$: 'sanity',
          path: 'image.crop.right',
          source: undefined,
          value: 0,
        },
        bottom: {
          $$type$$: 'sanity',
          path: 'image.crop.bottom',
          source: undefined,
          value: 0,
        },
      },
    },
  }

  const data: Data = unwrapData(wrapped)

  expect(data).toEqual({
    image: {
      crop: {
        _type: 'sanity.imageCrop',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
  })
})

test('unwrap string', () => {
  type Data = string

  const wrapped: WrappedValue<Data> = {
    $$type$$: 'sanity',
    path: undefined,
    source: undefined,
    value: 'Hello world',
  }

  const data: Data = unwrapData(wrapped)

  expect(data).toBe('Hello world')
})
