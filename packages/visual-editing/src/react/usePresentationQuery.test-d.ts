import {describe, expectTypeOf, test} from 'vitest'

import {usePresentationQuery} from './usePresentationQuery'

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
    '*[_type == "presentation-query-registered"]': RegisteredResult
  }
}

const params = {type: 'post', limit: 10}

describe('usePresentationQuery', () => {
  test('infers the result of a branded query and checks its params', () => {
    expectTypeOf(usePresentationQuery({query: postsQuery, params}).data).toEqualTypeOf<
      Post[] | null
    >()
    expectTypeOf(
      usePresentationQuery({query: postsQuery, params: Promise.resolve(params)}).data,
    ).toEqualTypeOf<Post[] | null>()
    expectTypeOf(usePresentationQuery({query: postsQuery}).data).toEqualTypeOf<Post[] | null>()
    // @ts-expect-error -- `limit` is missing
    usePresentationQuery({query: postsQuery, params: {type: 'post'}})
    // @ts-expect-error -- `limit` is a number
    usePresentationQuery({query: postsQuery, params: {type: 'post', limit: '10'}})
    // @ts-expect-error -- `limit` is missing
    usePresentationQuery({query: postsQuery, params: Promise.resolve({type: 'post'})})
  })

  test('unbranded queries type as before', () => {
    expectTypeOf(
      usePresentationQuery({query: '*', params: {anything: 1}}).data,
    ).toEqualTypeOf<any>()
    expectTypeOf(
      usePresentationQuery({query: defineQuery('*[_type == "post"]')}).data,
    ).toEqualTypeOf<any>()
    expectTypeOf(
      usePresentationQuery({query: '*[_type == "presentation-query-registered"]'}).data,
    ).toEqualTypeOf<RegisteredResult | null>()
  })
})
