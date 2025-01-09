import {expect, test} from 'vitest'
import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewPerspective,
  urlSearchParamPreviewSecret,
  urlSearchParamVercelProtectionBypass,
} from './constants'
import {parsePreviewUrl} from './parsePreviewUrl'

test('handles absolute URLs', () => {
  const unsafe = new URL('https://example.com/api/draft')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  expect(parsePreviewUrl(unsafe.toString())).toEqual({
    redirectTo: '/preview?foo=bar',
    secret: 'abc123',
    studioPreviewPerspective: null,
  })
})

test('handles relative URLs', () => {
  const unsafe = new URL('/api/draft', 'http://localhost')
  unsafe.searchParams.set(urlSearchParamPreviewSecret, 'abc123')
  unsafe.searchParams.set(urlSearchParamPreviewPathname, '/preview?foo=bar')
  unsafe.searchParams.set(urlSearchParamPreviewPerspective, 'published')
  expect(parsePreviewUrl(`${unsafe.pathname}${unsafe.search}`)).toEqual({
    redirectTo: '/preview?foo=bar',
    secret: 'abc123',
    studioPreviewPerspective: 'published',
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
  })
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
  })
})
