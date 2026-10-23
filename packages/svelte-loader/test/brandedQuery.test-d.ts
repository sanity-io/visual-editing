import {createClient} from '@sanity/client'
import {get} from 'svelte/store'
import {describe, expectTypeOf, test} from 'vitest'

import {createQueryStore} from '../src/createQueryStore'

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
    '*[_type == "svelte-loader-registered"]': RegisteredResult
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
  })

  test('unbranded queries type as before', async () => {
    expectTypeOf((await loadQuery('*')).data).toEqualTypeOf<unknown>()
    expectTypeOf((await loadQuery(defineQuery('*[_type == "post"]'))).data).toEqualTypeOf<unknown>()
    expectTypeOf(
      (await loadQuery('*[_type == "svelte-loader-registered"]')).data,
    ).toEqualTypeOf<unknown>()
    expectTypeOf((await loadQuery<boolean>('*', {anything: 1})).data).toEqualTypeOf<boolean>()
    expectTypeOf(
      (await loadQuery<boolean>(postsQuery, {anything: 1})).data,
    ).toEqualTypeOf<boolean>()
  })
})

describe('useQuery', () => {
  const {loadQuery, useQuery} = createQueryStore({client: createClient({})})

  test('infers the result of a branded query and checks its params', () => {
    expectTypeOf(get(useQuery(postsQuery, params)).data).toEqualTypeOf<Post[] | undefined>()
    expectTypeOf(get(useQuery({query: postsQuery, params})).data).toEqualTypeOf<
      Post[] | undefined
    >()
    // @ts-expect-error -- `limit` is missing
    useQuery(postsQuery, {type: 'post'})
    // @ts-expect-error -- `limit` is missing
    useQuery({query: postsQuery, params: {type: 'post'}})
  })

  test('the result of `loadQuery` hydrates a branded `useQuery`', async () => {
    const initial = await loadQuery(postsQuery, params)
    expectTypeOf(get(useQuery(postsQuery, params, {initial})).data).toEqualTypeOf<Post[]>()
    expectTypeOf(get(useQuery({query: postsQuery, params, options: {initial}})).data).toEqualTypeOf<
      Post[]
    >()
  })

  test('unbranded queries type as before', () => {
    expectTypeOf(get(useQuery('*')).data).toEqualTypeOf<unknown>()
    expectTypeOf(get(useQuery(defineQuery('*[_type == "post"]'))).data).toEqualTypeOf<unknown>()
    expectTypeOf(
      get(useQuery('*[_type == "svelte-loader-registered"]')).data,
    ).toEqualTypeOf<unknown>()
    expectTypeOf(get(useQuery<boolean>('*', {anything: 1})).data).toEqualTypeOf<
      boolean | undefined
    >()
    expectTypeOf(
      get(useQuery('*', {}, {initial: {data: 'foo', sourceMap: undefined}})).data,
    ).toEqualTypeOf<string>()
  })
})
