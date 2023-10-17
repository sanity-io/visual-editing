import { ContentSourceMap } from '@sanity/client'
import { expect, test } from 'vitest'

import { wrapData } from './wrapData'

type Result = { _id: string; title: string }[]

const response: {
  query: string
  result: Result
  resultSourceMap: ContentSourceMap
  ms: number
} = {
  query: '*[_type=="shoe"]{_id,title}',
  result: [
    {
      _id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2',
      title: 'Nike Pegasus 39 Shield',
    },
    {
      _id: '1a6b5074-2451-452f-9ab1-bb05119e2f7d',
      title: "Neon Flash - Gen Z's Ultimate Nike Sneaker",
    },
    {
      _id: '1b4a38e8-cac4-42c1-ba42-ac56af9095d0',
      title: 'Galaxy Runner',
    },
    {
      _id: '76f1ace0-b04a-4cff-9063-681214581279',
      title: 'Adidas Ultra Boost',
    },
    {
      _id: '77f2a8c8-f3f0-4807-93b2-61f1f648c711',
      title: 'Hover Hype: Float in Style with Hot Pink \u0026 Lilac',
    },
    {
      _id: '7ee961e0-926e-4dd7-b289-57bfa4d02be4',
      title: 'Invincible Tactical Boots: Unleash Your Inner Warrior',
    },
    {
      _id: '86e68b0c-2b5a-40cb-86ee-02eb885a080a',
      title: 'PUMA x SPARCO Speedcat OG Driving Shoes',
    },
    {
      _id: 'b956cf7b-a7b7-4e56-a16f-bad8ee392e34',
      title: 'Test shoe',
    },
    {
      _id: 'c4006b45-ae6e-4475-b270-fcdae2a7b455',
      title: 'StreetStrut Cyberpunk Super Sneakers: Ultimate Footwear Fantasy',
    },
    {
      _id: 'f4b80931-1d1d-411f-97ce-2d2f66aa3c23',
      title: 'Purple Fairy Dream Sneakers: Step into Magic!',
    },
  ],
  resultSourceMap: {
    documents: [
      { _id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2', _type: 'shoe' },
      { _id: '1a6b5074-2451-452f-9ab1-bb05119e2f7d', _type: 'shoe' },
      { _id: '1b4a38e8-cac4-42c1-ba42-ac56af9095d0', _type: 'shoe' },
      { _id: '76f1ace0-b04a-4cff-9063-681214581279', _type: 'shoe' },
      { _id: '77f2a8c8-f3f0-4807-93b2-61f1f648c711', _type: 'shoe' },
      { _id: '7ee961e0-926e-4dd7-b289-57bfa4d02be4', _type: 'shoe' },
      { _id: '86e68b0c-2b5a-40cb-86ee-02eb885a080a', _type: 'shoe' },
      { _id: 'b956cf7b-a7b7-4e56-a16f-bad8ee392e34', _type: 'shoe' },
      { _id: 'c4006b45-ae6e-4475-b270-fcdae2a7b455', _type: 'shoe' },
      { _id: 'f4b80931-1d1d-411f-97ce-2d2f66aa3c23', _type: 'shoe' },
    ],
    paths: ["$['_id']", "$['title']"],
    mappings: {
      "$[0]['_id']": {
        source: { document: 0, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[0]['title']": {
        source: { document: 0, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[1]['_id']": {
        source: { document: 1, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[1]['title']": {
        source: { document: 1, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[2]['_id']": {
        source: { document: 2, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[2]['title']": {
        source: { document: 2, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[3]['_id']": {
        source: { document: 3, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[3]['title']": {
        source: { document: 3, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[4]['_id']": {
        source: { document: 4, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[4]['title']": {
        source: { document: 4, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[5]['_id']": {
        source: { document: 5, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[5]['title']": {
        source: { document: 5, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[6]['_id']": {
        source: { document: 6, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[6]['title']": {
        source: { document: 6, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[7]['_id']": {
        source: { document: 7, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[7]['title']": {
        source: { document: 7, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[8]['_id']": {
        source: { document: 8, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[8]['title']": {
        source: { document: 8, path: 1, type: 'documentValue' },
        type: 'value',
      },
      "$[9]['_id']": {
        source: { document: 9, path: 0, type: 'documentValue' },
        type: 'value',
      },
      "$[9]['title']": {
        source: { document: 9, path: 1, type: 'documentValue' },
        type: 'value',
      },
    },
  },
  ms: 7,
}

test('wrap a data structure with source maps', () => {
  const wrapped = wrapData(
    {
      baseUrl: 'http://localhost:3333',
      dataset: 'test',
      projectId: 'test',
    },
    response.result,
    response.resultSourceMap,
  )

  expect(wrapped[0]).toEqual({
    _id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2',
    title: {
      value: 'Nike Pegasus 39 Shield',
      source: {
        baseUrl: 'http://localhost:3333',
        dataset: 'test',
        projectId: 'test',
        id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2',
        type: 'shoe',
        path: 'title',
      },
    },
  })
})
