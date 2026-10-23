import {createClient} from '@sanity/client'
import {describe, expectTypeOf, test} from 'vitest'

import {createQueryStore} from '../../src/createQueryStore/universal'

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
    '*[_type == "react-loader-registered"]': RegisteredResult
  }
}

const params = {type: 'post', limit: 10}

describe('loadQuery', () => {
  const {loadQuery} = createQueryStore({client: createClient({})})

  test('infers the result of a branded query and checks its params', async () => {
    expectTypeOf((await loadQuery(postsQuery, params)).data).toEqualTypeOf<Post[]>()
    expectTypeOf((await loadQuery(postsQuery)).data).toEqualTypeOf<Post[]>()
    // @ts-expect-error -- `limit` is missing
    await loadQuery(postsQuery, {type: 'post'})
    // @ts-expect-error -- `limit` is a number
    await loadQuery(postsQuery, {type: 'post', limit: '10'})
    // @ts-expect-error -- `extra` is not a param of this query
    await loadQuery(postsQuery, {...params, extra: true})
  })

  test('unbranded queries type as before', async () => {
    expectTypeOf((await loadQuery('*')).data).toEqualTypeOf<unknown>()
    expectTypeOf((await loadQuery(defineQuery('*[_type == "post"]'))).data).toEqualTypeOf<unknown>()
    expectTypeOf(
      (await loadQuery('*[_type == "react-loader-registered"]')).data,
    ).toEqualTypeOf<unknown>()
    expectTypeOf((await loadQuery<boolean>('*', {anything: 1})).data).toEqualTypeOf<boolean>()
  })

  test('an explicit generic overrides the brand and relaxes the params', async () => {
    expectTypeOf(
      (await loadQuery<boolean>(postsQuery, {anything: 1})).data,
    ).toEqualTypeOf<boolean>()
  })
})

describe('useQuery', () => {
  const {loadQuery, useQuery} = createQueryStore({client: createClient({})})

  test('infers the result of a branded query and checks its params', async () => {
    expectTypeOf(useQuery(postsQuery, params).data).toEqualTypeOf<Post[] | undefined>()
    expectTypeOf(useQuery(postsQuery).data).toEqualTypeOf<Post[] | undefined>()
    // @ts-expect-error -- `limit` is missing
    useQuery(postsQuery, {type: 'post'})
    // @ts-expect-error -- `limit` is a number
    useQuery(postsQuery, {type: 'post', limit: '10'})
  })

  test('the result of `loadQuery` hydrates a branded `useQuery`', async () => {
    const initial = await loadQuery(postsQuery, params)
    expectTypeOf(useQuery(postsQuery, params, {initial}).data).toEqualTypeOf<Post[]>()
    // @ts-expect-error -- `initial.data` does not match the branded result
    useQuery(postsQuery, params, {initial: {data: 'nope', sourceMap: undefined}})
  })

  test('unbranded queries type as before', () => {
    expectTypeOf(useQuery('*').data).toEqualTypeOf<unknown>()
    expectTypeOf(useQuery(defineQuery('*[_type == "post"]')).data).toEqualTypeOf<unknown>()
    expectTypeOf(useQuery('*[_type == "react-loader-registered"]').data).toEqualTypeOf<unknown>()
    expectTypeOf(useQuery<boolean>('*', {anything: 1}).data).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(
      useQuery('*', {}, {initial: {data: 'foo', sourceMap: undefined}}).data,
    ).toEqualTypeOf<string>()
  })

  test('an explicit generic overrides the brand and relaxes the params', () => {
    expectTypeOf(useQuery<boolean>(postsQuery, {anything: 1}).data).toEqualTypeOf<
      boolean | undefined
    >()
  })
})
