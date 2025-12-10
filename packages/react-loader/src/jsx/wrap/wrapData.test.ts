import {expect, test} from 'vitest'

import type {SanityNodeContext} from './types'

import * as fixtures from './__fixtures__/responses'
import {wrapData} from './wrapData'

test('wrap an array of documents with source maps', () => {
  const context = {
    baseUrl: 'http://localhost:3333',
    tool: undefined,
    workspace: undefined,
  } satisfies SanityNodeContext

  const {result, resultSourceMap} = fixtures.response1
  const wrapped = wrapData(context, result, resultSourceMap)

  expect(wrapped?.[0]).toEqual({
    _id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2',
    title: {
      $$type$$: 'sanity',
      path: '[0].title',
      source: {
        ...context,
        id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2',
        type: 'shoe',
        path: 'title',
      },
      value: 'Nike Pegasus 39 Shield',
    },
  })
})

test('wrap a deep target with source maps', () => {
  const context = {
    baseUrl: 'http://localhost:3333',
    tool: undefined,
    workspace: undefined,
  } satisfies SanityNodeContext

  const {result, resultSourceMap} = fixtures.response2
  const wrapped = wrapData(context, result, resultSourceMap)

  expect(wrapped?.seo?.og?.title).toEqual({
    $$type$$: 'sanity',
    path: 'seo.og.title',
    source: {
      ...context,
      id: '80ddcd8a-a89f-4163-8f8d-b941787da6e0',
      path: 'seo.og.title',
      type: 'screen',
    },
    value: 'Build accessible React apps faster with Sanity UI',
  })
})
