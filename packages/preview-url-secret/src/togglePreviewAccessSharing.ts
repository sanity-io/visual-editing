import type {SanityClient} from '@sanity/client'
import {schemaIdSingleton as _id, schemaTypeSingleton as _type, apiVersion, tag} from './constants'
import {generateUrlSecret} from './generateSecret'
import type {SanityClientLike} from './types'

/** @internal */
export async function enablePreviewAccessSharing(
  _client: SanityClient,
  source: string,
  studioUrl: string,
  userId?: string,
): Promise<{secret: string}> {
  const client = _client.withConfig({apiVersion})
  const newSecret = generateUrlSecret()
  const patch = client.patch(_id).set({secret: newSecret, studioUrl, userId})
  await client
    .transaction()
    .createIfNotExists({_id, _type, source, studioUrl, userId})
    .patch(patch)
    .commit({tag})

  return {secret: newSecret}
}

/** @internal */
export async function disablePreviewAccessSharing(
  _client: SanityClient,
  source: string,
  studioUrl: string,
  userId?: string,
): Promise<void> {
  const client = _client.withConfig({apiVersion})
  const patch = client.patch(_id).set({secret: null, studioUrl, userId})
  await client
    .transaction()
    .createIfNotExists({_id, _type, source, studioUrl, userId})
    .patch(patch)
    .commit({tag})
}

export type {SanityClientLike}
