import {createEditUrl, getDraftId} from '@sanity/client/csm'
import {expect, test} from 'vitest'

import {getLinkHref} from '../getLinkHref'

const baseUrl = '/studio'
const id = 'homepage'
const type = 'page'
const path = 'title'
const preview = location.href
const defaults = {baseUrl, id: getDraftId(id), type, path, preview}

const absoluteBaseUrl = 'https://my.sanity.studio'
const hashBaseUrl = '/studio#'
const complexAbsoluteHashBaseUrl = 'https://example.com/studio?variant=abc#'

const complexPreviewWithHash = `https://example.com/search?${new URLSearchParams({foo: 'bar'})}#/path?${new URLSearchParams({bar: 'foo'})}`

const cases = [
  {
    expected: `http://localhost:3000/studio/intent/edit/mode=presentation;id=homepage;type=page;path=title?${new URLSearchParams({baseUrl, id, type, path, preview})}`,
  },
  {
    baseUrl: absoluteBaseUrl,
    expected: `https://my.sanity.studio/intent/edit/mode=presentation;id=homepage;type=page;path=title?${new URLSearchParams({baseUrl: absoluteBaseUrl, id, type, path, preview})}`,
  },
  {
    baseUrl: hashBaseUrl,
    expected: `http://localhost:3000/studio#/intent/edit/mode=presentation;id=homepage;type=page;path=title?${new URLSearchParams({baseUrl: hashBaseUrl, id, type, path, preview})}`,
  },

  {
    baseUrl: complexAbsoluteHashBaseUrl,
    expected: `https://example.com/studio?variant=abc#/intent/edit/mode=presentation;id=homepage;type=page;path=title?${new URLSearchParams({baseUrl: complexAbsoluteHashBaseUrl, id, type, path, preview})}`,
  },
  {
    preview: complexPreviewWithHash,
    expected: `http://localhost:3000/studio/intent/edit/mode=presentation;id=homepage;type=page;path=title?${new URLSearchParams({baseUrl, id, type, path, preview: complexPreviewWithHash})}`,
  },
  {
    baseUrl: hashBaseUrl,
    preview: complexPreviewWithHash,
    expected: `http://localhost:3000/studio#/intent/edit/mode=presentation;id=homepage;type=page;path=title?${new URLSearchParams({baseUrl: hashBaseUrl, id, type, path, preview: complexPreviewWithHash})}`,
  },
] satisfies (Partial<typeof defaults> & {expected: string})[]

test.each(cases)('$expected', ({expected, ...rest}) => {
  const {baseUrl, type, id, path, preview} = {...defaults, ...rest}
  const actual = getLinkHref(createEditUrl({baseUrl, type, id, path}), preview)
  expect(actual).toEqual(expected)
})
