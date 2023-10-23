import { expect, test } from 'vitest'

import { WrappedValue } from './types'
import { unwrapData } from './unwrapData'

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

test('unwrap', () => {
  const wrapped: WrappedValue<Data> = {
    image: {
      crop: {
        _type: 'sanity.imageCrop',
        top: { $$type$$: 'sanity', value: 0.1, source: undefined },
        left: { $$type$$: 'sanity', value: 0.1, source: undefined },
        right: { $$type$$: 'sanity', value: 0.1, source: undefined },
        bottom: { $$type$$: 'sanity', value: 0.1, source: undefined },
      },
    },
  }

  const data = unwrapData(wrapped)

  expect(data).toEqual({
    image: {
      crop: {
        _type: 'sanity.imageCrop',
        top: 0.1,
        left: 0.1,
        right: 0.1,
        bottom: 0.1,
      },
    },
  })
})
