import {createEditUrl} from '@sanity/client/csm'
import {afterEach, describe, expect, test, vi} from 'vitest'

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

describe('decodeSanityNodeData with hrefs where the URL search params are unusable', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  afterEach(() => {
    consoleErrorSpy.mockClear()
  })

  test('recovers when the studio baseUrl contains a query string', () => {
    // The `?` in the baseUrl swallows the `baseUrl` search param of the edit
    // intent url, e.g. `https://example.com/studio?variant=abc/intent/edit/...`
    const baseUrl = 'https://example.com/studio?variant=abc'
    const href = createEditUrl({
      baseUrl,
      workspace: 'staging',
      tool: 'presentation',
      id: 'drafts.abc123',
      type: 'guildVideo',
      path: 'sections[_key=="xyz"].title',
    })

    expect(decodeSanityNodeData({origin: 'sanity.io', href})).toEqual({
      baseUrl,
      workspace: 'staging',
      tool: 'presentation',
      id: 'abc123',
      type: 'guildVideo',
      path: 'sections[_key=="xyz"].title',
      perspective: 'drafts',
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  test('recovers when the studio baseUrl contains a query string and a hash', () => {
    const baseUrl = 'https://example.com/studio?variant=abc#'
    const href = createEditUrl({baseUrl, id: 'abc123', type: 'guildVideo', path: 'title'})

    expect(decodeSanityNodeData({origin: 'sanity.io', href})).toEqual({
      baseUrl,
      id: 'abc123',
      type: 'guildVideo',
      path: 'title',
      perspective: 'published',
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  test('recovers when the studio baseUrl uses hash routing', () => {
    // The edit intent url ends up entirely inside the URL hash, e.g.
    // `/studio#/intent/edit/...`, leaving the URL search params empty
    const baseUrl = '/studio#'
    const href = createEditUrl({baseUrl, id: 'drafts.abc123', type: 'guildVideo', path: 'title'})

    expect(decodeSanityNodeData({origin: 'sanity.io', href})).toEqual({
      baseUrl,
      id: 'abc123',
      type: 'guildVideo',
      path: 'title',
      perspective: 'drafts',
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  test.each([
    [
      `/studio/intent/edit/mode=presentation;id=abc123;type=guildVideo;path=${encodeURIComponent('sections[_key=="xyz"].title')};tool=presentation`,
      {
        baseUrl: '/studio',
        id: 'abc123',
        type: 'guildVideo',
        path: 'sections[_key=="xyz"].title',
        tool: 'presentation',
        perspective: 'drafts',
      },
    ],
    [
      '/intent/edit/mode=presentation;id=abc123;type=guildVideo;path=title',
      {
        baseUrl: '/',
        id: 'abc123',
        type: 'guildVideo',
        path: 'title',
        perspective: 'drafts',
      },
    ],
  ])('recovers from the router params when the search segment is absent (%s)', (href, output) => {
    expect(decodeSanityNodeData({origin: 'sanity.io', href})).toEqual(output)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  test('keeps legacy behaviour for hrefs without an edit intent', () => {
    const node = {origin: 'sanity.io', href: '/some/page'}
    expect(decodeSanityNodeData(node)).toEqual(node)
  })

  test('keeps legacy behaviour and logs when recovery fails', () => {
    const node = {origin: 'sanity.io', href: '/some/page?foo=bar'}
    expect(decodeSanityNodeData(node)).toEqual(node)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse sanity node', expect.anything())
  })
})
