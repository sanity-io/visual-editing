import {expect, test} from 'vitest'
import {decodeSanityString, encodeSanityNodeData} from './transformSanityNodeData'

test('node data returns an encoded string', async () => {
  const input = {
    id: 'documentId',
    type: 'documentType',
    path: 'sections[_key=="abcdef"].tagline',
    baseUrl: 'https://some.sanity.studio',
    tool: 'desk',
    workspace: 'docs',
  }

  const output =
    'id=documentId;type=documentType;path=sections:abcdef.tagline;base=https%3A%2F%2Fsome.sanity.studio;workspace=docs;tool=desk'

  expect(encodeSanityNodeData(input)).toMatch(output)
})

test('incomplete node data returns undefined', async () => {
  const input = {
    id: 'documentId',
    type: 'documentType',
    path: '',
    baseUrl: 'https://some.sanity.studio',
    tool: 'desk',
    workspace: 'docs',
  }

  expect(encodeSanityNodeData(input)).toBeUndefined()
})

test('an encoded string returns node data', async () => {
  const input = decodeSanityString(
    'id=documentId;type=documentType;path=sections:abcdef.tagline;base=https%3A%2F%2Fsome.sanity.studio;workspace=docs;tool=desk',
  )

  const output = {
    id: 'documentId',
    type: 'documentType',
    path: 'sections[_key=="abcdef"].tagline',
    baseUrl: 'https://some.sanity.studio',
    tool: 'desk',
    workspace: 'docs',
  }

  expect(input).toMatchObject(output)
})
