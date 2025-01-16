import {expect, test} from 'vitest'
import {decodeSanityString} from './decodeSanityNodeData'

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
