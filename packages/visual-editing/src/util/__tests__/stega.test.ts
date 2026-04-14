import {vercelStegaCombine} from '@vercel/stega'
import {expect, test} from 'vitest'

import {testAndDecodeStega} from '../stega'

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
