import {createClient} from '@sanity/client'
import {describe, expectTypeOf, test} from 'vitest'

import {createQueryStore, type BrandedQueryParams, type BrandedQueryResult} from '../src'

// The brand `@sanity-labs/groq-content-mapper` puts on the default export of an imported `.groq`
// file, declared here because the brand is read structurally and nothing imports that package
type GroqQuery<Query extends string, Result, Params> = Query & {
  readonly __groqParams?: Params
  readonly __groqResult?: Result
}

// `defineQuery` from `groq`, which returns the string it is given with its literal type intact
declare function defineQuery<const Q extends string>(query: Q): Q

type Post = {_id: string; title: string}
type PostsParams = {type: string; limit: number}

declare const postsQuery: GroqQuery<
  '*[_type == $type][0...$limit]{_id, title}',
  Post[],
  PostsParams
>

type RegisteredResult = {registered: true}
declare global {
  interface SanityQueries {
    '*[_type == "core-loader-registered"]': RegisteredResult
  }
}

describe('BrandedQueryResult', () => {
  test('reads the brand', () => {
    expectTypeOf<BrandedQueryResult<typeof postsQuery>>().toEqualTypeOf<Post[]>()
    expectTypeOf<BrandedQueryResult<typeof postsQuery, {other: true}>>().toEqualTypeOf<Post[]>()
  })

  test('falls back for anything unbranded, including registered queries', () => {
    expectTypeOf<BrandedQueryResult<string>>().toEqualTypeOf<unknown>()
    expectTypeOf<BrandedQueryResult<string, boolean>>().toEqualTypeOf<boolean>()
    expectTypeOf<BrandedQueryResult<'*[_type == "post"]'>>().toEqualTypeOf<unknown>()
    expectTypeOf<
      BrandedQueryResult<'*[_type == "core-loader-registered"]'>
    >().toEqualTypeOf<unknown>()
  })
})

describe('BrandedQueryParams', () => {
  test('reads the brand, and still allows leaving params out', () => {
    expectTypeOf<BrandedQueryParams<typeof postsQuery>>().toEqualTypeOf<
      PostsParams | Record<string, never> | undefined
    >()
  })
})

describe('createFetcherStore', () => {
  const {createFetcherStore} = createQueryStore({client: createClient({})})

  test('infers the result of a branded query and checks its params', () => {
    expectTypeOf(
      createFetcherStore(postsQuery, {type: 'post', limit: 10}).get().data,
    ).toEqualTypeOf<Post[] | undefined>()
    expectTypeOf(createFetcherStore(postsQuery).get().data).toEqualTypeOf<Post[] | undefined>()

    // @ts-expect-error -- `limit` is missing
    createFetcherStore(postsQuery, {type: 'post'})
    // @ts-expect-error -- `limit` is a number
    createFetcherStore(postsQuery, {type: 'post', limit: '10'})
    // @ts-expect-error -- `initial.data` does not match the branded result
    createFetcherStore(postsQuery, {type: 'post', limit: 10}, {data: 'nope'})
  })

  test('unbranded queries type as before', () => {
    expectTypeOf(createFetcherStore('*').get().data).toEqualTypeOf<unknown>()
    expectTypeOf(
      createFetcherStore(defineQuery('*[_type == "post"]')).get().data,
    ).toEqualTypeOf<unknown>()
    expectTypeOf(
      createFetcherStore('*[_type == "core-loader-registered"]').get().data,
    ).toEqualTypeOf<unknown>()
    expectTypeOf(createFetcherStore('*', {anything: 1}, {data: 'foo'}).get().data).toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf(createFetcherStore<boolean>('*', {anything: 1}).get().data).toEqualTypeOf<
      boolean | undefined
    >()
  })

  test('an explicit generic overrides the brand and relaxes the params', () => {
    expectTypeOf(createFetcherStore<boolean>(postsQuery, {anything: 1}).get().data).toEqualTypeOf<
      boolean | undefined
    >()
  })
})
