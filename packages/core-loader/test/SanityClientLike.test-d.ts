import {createClient, type SanityClient} from '@sanity/client'
// `@sanity/client-v8` is an alias for the next major of `@sanity/client`, installed alongside the
// version this package depends on. Without a second copy in the tree these assertions are vacuous,
// since a single copy of the client is always compatible with itself.
import {createClient as createClientV8} from '@sanity/client-v8'
import {createClient as createStegaClientV8} from '@sanity/client-v8/stega'
import {createClient as createStegaClient} from '@sanity/client/stega'
import type {SanityClientLike as PreviewUrlSecretSanityClientLike} from '@sanity/preview-url-secret'
import {describe, expectTypeOf, test} from 'vitest'

import type {SanityClientLike} from '../src'

const config = {projectId: 'pv8n7t0d', dataset: 'production'}

describe('SanityClientLike', () => {
  test('is satisfied by clients from the version we depend on', () => {
    expectTypeOf(createClient(config)).toExtend<SanityClientLike>()
    // The stega factory is deprecated in favour of `stega` on the main client, but the option this
    // replaces named `SanityStegaClient` explicitly, so keep covering it.
    // oxlint-disable-next-line typescript/no-deprecated
    expectTypeOf(createStegaClient(config)).toExtend<SanityClientLike>()
  })

  test('is satisfied by clients from a different major', () => {
    expectTypeOf(createClientV8(config)).toExtend<SanityClientLike>()
    // oxlint-disable-next-line typescript/no-deprecated
    expectTypeOf(createStegaClientV8(config)).toExtend<SanityClientLike>()
  })

  test('is not the nominal `SanityClient` in disguise', () => {
    // `SanityClient` declares a `#private` field, so requiring it is what breaks duplicate
    // installs and cross-major usage. If this ever starts passing, the interface has been
    // narrowed back to the class and the decoupling is gone.
    expectTypeOf<SanityClientLike>().not.toExtend<SanityClient>()
  })

  test('rejects things that are not clients', () => {
    expectTypeOf<Record<string, never>>().not.toExtend<SanityClientLike>()
    expectTypeOf<{fetch: typeof globalThis.fetch}>().not.toExtend<SanityClientLike>()
  })

  test('is accepted by `validatePreviewUrl` from @sanity/preview-url-secret', () => {
    // `handlePreview` passes a client typed as this straight to `validatePreviewUrl`, which
    // declares its own narrower `SanityClientLike`. Keep the two compatible so it needs no cast.
    expectTypeOf<SanityClientLike>().toExtend<PreviewUrlSecretSanityClientLike>()
  })
})
