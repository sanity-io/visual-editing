import {expect, test} from 'vitest'

import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
  urlSearchParamPreviewSecret,
  urlSearchParamPreviewVariant,
  urlSearchParamVercelProtectionBypass,
} from './constants'
import {parsePreviewUrl} from './parsePreviewUrl'
import {setSecretSearchParams, withoutSecretSearchParams} from './withoutSecretSearchParams'

test('handles absolute URLs', () => {
  const unsafe = new URL('https://example.com/api/draft')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo: '/preview?foo=bar',
    secret: 'abc123',
    studioPreviewPerspective: null,
    studioPreviewVariant: null,
  })
})

test('handles relative URLs', () => {
  const unsafe = new URL('/api/draft', 'http://localhost')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  unsafe.searchParams.set(urlSearchParamPreviewPerspective, 'published')
  expect(parsePreviewUrl(`${unsafe.pathname}${unsafe.search}`)).toEqual({
    redirectTo: '/preview?foo=bar&sanity-preview-perspective=published',
    secret: 'abc123',
    studioPreviewPerspective: 'published',
    studioPreviewVariant: null,
  })
})

test('includes hash', () => {
  const unsafe = new URL('https://example.com/api/draft')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar#heading1')
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo: '/preview?foo=bar#heading1',
    secret: 'abc123',
    studioPreviewPerspective: null,
    studioPreviewVariant: null,
  })
})

test('forwards preview variant to redirect', () => {
  const unsafe = new URL('/api/draft', 'http://localhost')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  unsafe.searchParams.set(urlSearchParamPreviewVariant, 'Ab12cd34')
  expect(parsePreviewUrl(`${unsafe.pathname}${unsafe.search}`)).toEqual({
    redirectTo: '/preview?foo=bar&sanity-preview-variant=Ab12cd34',
    secret: 'abc123',
    studioPreviewPerspective: null,
    studioPreviewVariant: 'Ab12cd34',
  })
})

test('withoutSecretSearchParams removes preview variant', () => {
  const url = new URL('https://example.com/preview?foo=bar')
  url.searchParams.set(urlSearchParamPreviewVariant, 'Ab12cd34')
  url.searchParams.set(urlSearchParamPreviewPerspective, 'drafts')
  url.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  const cleaned = withoutSecretSearchParams(url)
  expect(cleaned.searchParams.has(urlSearchParamPreviewVariant)).toBe(false)
  expect(cleaned.searchParams.has(urlSearchParamPreviewPerspective)).toBe(false)
  expect(cleaned.searchParams.has(urlSearchParamPreviewSecret)).toBe(false)
  expect(cleaned.searchParams.get('foo')).toBe('bar')
})

test('setSecretSearchParams sets and clears preview variant', () => {
  const url = new URL('https://example.com/api/preview')
  const withVariant = setSecretSearchParams(url, 'abc123', '/preview', 'drafts', 'Ab12cd34')
  expect(withVariant.searchParams.get(urlSearchParamPreviewVariant)).toBe('Ab12cd34')

  const withoutVariant = setSecretSearchParams(withVariant, 'abc123', '/preview', 'drafts')
  expect(withoutVariant.searchParams.has(urlSearchParamPreviewVariant)).toBe(false)
})

test('forwards vercel bypass secret to redirect', () => {
  const unsafe = new URL('https://example.com/api/draft-mode/enable')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar#heading1')
  unsafe.searchParams.set(urlSearchParamVercelProtectionBypass, 'dfg456')
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo:
      '/preview?foo=bar&x-vercel-protection-bypass=dfg456&x-vercel-set-bypass-cookie=samesitenone#heading1',
    secret: 'abc123',
    studioPreviewPerspective: null,
    studioPreviewVariant: null,
  })
})

test('strips origin from redirect', () => {
  const unsafe = new URL('https://example.com/api/draft')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(
    urlSearchParamPreviewPathname,
    new URL('https://domain.com/preview?foo=bar').toString(),
  )
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo: '/preview?foo=bar',
    secret: 'abc123',
    studioPreviewPerspective: null,
    studioPreviewVariant: null,
  })
})
