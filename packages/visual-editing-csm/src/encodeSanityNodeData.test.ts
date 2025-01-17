import {expect, test} from 'vitest'
import {encodeSanityNodeData} from './encodeSanityNodeData'

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
