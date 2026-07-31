import {createClient} from '@sanity/client'
import {describe, expectTypeOf, test} from 'vitest'

import {createQueryStore} from '../../src/createQueryStore/universal'

describe('useQuery', () => {
  const {useQuery} = createQueryStore({client: createClient({})})
  test('should type `data` as `T | undefined`', async () => {
    // oxlint-disable-next-line typescript/no-deprecated
    expectTypeOf(useQuery<boolean>('').data).toMatchTypeOf<boolean | undefined>()
  })
  test('should type `data` as `T | undefined`', async () => {
    // oxlint-disable-next-line typescript/no-deprecated
    expectTypeOf(useQuery<boolean>('', {}, {}).data).toMatchTypeOf<boolean | undefined>()
  })
  test('should infer `data` as `typeof options.initial`', async () => {
    expectTypeOf(
      useQuery(
        '',
        {},
        {
          initial: {
            data: 'foo',
            sourceMap: undefined,
            perspective: undefined,
          },
        },
      ).data,
      // oxlint-disable-next-line typescript/no-deprecated
    ).toMatchTypeOf<string>()
  })
  test('should type `data` as `T` when `options.initial`', async () => {
    expectTypeOf(
      useQuery<boolean>(
        '',
        {},
        {
          initial: {
            data: true,
            sourceMap: undefined,
            perspective: undefined,
          },
        },
      ).data,
      // oxlint-disable-next-line typescript/no-deprecated
    ).toMatchTypeOf<boolean>()
  })
})
