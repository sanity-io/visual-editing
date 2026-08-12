import type {SanityClient} from '@sanity/client'
import type {SanityClientLike} from '@sanity/core-loader'
import {describe, expectTypeOf, test} from 'vitest'

import type {LoaderLocals} from '../src/types'

describe('LoaderLocals', () => {
  test('keeps the full client API by default', () => {
    // `handlePreview` only needs `SanityClientLike`, but narrowing `locals.client` to it would take
    // `listen`, `getDocument` and the rest away from everyone already reading it.
    expectTypeOf<LoaderLocals['client']>().toEqualTypeOf<SanityClient>()
    expectTypeOf<LoaderLocals['client']['listen']>().toBeFunction()
  })

  test('can be parameterised for apps that resolve their own copy of the client', () => {
    interface OtherCopyOfSanityClient extends SanityClientLike {
      listen(query: string): {subscribe(): void}
    }
    expectTypeOf<
      LoaderLocals<OtherCopyOfSanityClient>['client']
    >().toEqualTypeOf<OtherCopyOfSanityClient>()
  })

  test('only accepts client types that cover what `handlePreview` uses', () => {
    // @ts-expect-error `{}` does not satisfy the `SanityClientLike` constraint
    expectTypeOf<LoaderLocals<Record<string, never>>>().toBeObject()
  })
})
