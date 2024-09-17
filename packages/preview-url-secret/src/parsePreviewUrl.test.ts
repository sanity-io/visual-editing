import {expect, test} from 'vitest'
import {urlSearchParamPreviewPathname, urlSearchParamPreviewSecret} from './constants'
import {parsePreviewUrl} from './parsePreviewUrl'

test('handles absolute URLs', () => {
  const unsafe = new URL('https://example.com/api/draft')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo: '/preview?foo=bar',
    secret: 'abc123',
  })
})

test('handles relative URLs', () => {
  const unsafe = new URL('/api/draft', 'http://localhost')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  expect(parsePreviewUrl(`${unsafe.pathname}${unsafe.search}`)).toEqual({
    redirectTo: '/preview?foo=bar',
    secret: 'abc123',
  })
})

test('includes hash', () => {
  const unsafe = new URL('https://example.com/api/draft')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar#heading1')
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo: '/preview?foo=bar#heading1',
    secret: 'abc123',
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
  })
})
