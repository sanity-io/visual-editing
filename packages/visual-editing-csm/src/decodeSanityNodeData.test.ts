import {describe, expect, test} from 'vitest'

import {decodeSanityString, decodeSanityNodeData} from './decodeSanityNodeData'

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

describe('decodeSanityNodeData', () => {
  test.each([
    [
      {
        origin: 'sanity.io',
        href: '/intent/edit/mode=presentation;id=e1674ab7-5f96-49b0-8291-7608e087ef0a;type=author;path=picture?baseUrl=%2F&id=e1674ab7-5f96-49b0-8291-7608e087ef0a&type=author&path=picture.alt&perspective=rrRHoDGSr',
      },
      {
        baseUrl: '/',
        id: 'e1674ab7-5f96-49b0-8291-7608e087ef0a',
        type: 'author',
        path: 'picture.alt',
        perspective: 'rrRHoDGSr',
      },
    ],
    [
      {
        origin: 'sanity.io',
        href: '/intent/edit/mode=presentation;id=f99b873f-85c2-41c4-ac65-807b1d72c084;type=author;path=picture?baseUrl=%2F&id=f99b873f-85c2-41c4-ac65-807b1d72c084&type=author&path=picture.alt',
      },
      {
        baseUrl: '/',
        id: 'f99b873f-85c2-41c4-ac65-807b1d72c084',
        type: 'author',
        path: 'picture.alt',
        perspective: 'drafts',
      },
    ],
    [
      {
        origin: 'sanity.io',
        href: '/intent/edit/mode=presentation;id=3db5cb7b-bfd2-4409-a42e-86e92def3098;type=post;path=coverImage?baseUrl=%2F&id=3db5cb7b-bfd2-4409-a42e-86e92def3098&type=post&path=coverImage.alt&perspective=published',
      },
      {
        baseUrl: '/',
        id: '3db5cb7b-bfd2-4409-a42e-86e92def3098',
        type: 'post',
        path: 'coverImage.alt',
        perspective: 'published',
      },
    ],
  ])('%j => %j', (input, output) => {
    expect(decodeSanityNodeData(input)).toEqual(output)
  })
})
