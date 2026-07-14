import {vercelStegaCombine} from '@vercel/stega'
import {expect, test} from 'vitest'

import {stegaClean, testAndDecodeStega} from '../stega'

test('it handles trailing zero-width space characters', () => {
  const payload = 'foo.\u200b'
  const editInfo = {origin: 'sanity.io', href: '/studio'}
  const encoded = vercelStegaCombine(payload, editInfo)
  expect(encoded).not.toEqual(payload)
  const decoded = testAndDecodeStega(encoded)
  expect(decoded).not.toEqual(null)
  expect(decoded!.origin).toEqual('sanity.io')
  expect(decoded!.href).toEqual('/studio')
})

test('stegaClean strips all stega payloads from a string', () => {
  const editInfo = {origin: 'sanity.io', href: '/studio'}
  const encoded = `${vercelStegaCombine('foo', editInfo, false)} and ${vercelStegaCombine('bar', editInfo, false)}`
  expect(encoded).not.toEqual('foo and bar')
  expect(stegaClean(encoded)).toEqual('foo and bar')
  // Consecutive runs behave consistently even though the regex is stateful
  expect(stegaClean(encoded)).toEqual('foo and bar')
  expect(stegaClean('no stega')).toEqual('no stega')
})
