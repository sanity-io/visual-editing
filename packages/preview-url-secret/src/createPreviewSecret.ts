import type { SanityClient } from '@sanity/client'
import { uuid } from '@sanity/uuid'

import { apiVersion, schemaIdPrefix, schemaType, tag } from './constants'
import { generateUrlSecret } from './generateSecret'
import { SanityClientLike } from './types'

/** @internal */
export async function createPreviewSecret(
  _client: SanityClient,
  source: string,
  studioUrl: string,
  id = uuid(),
): Promise<string> {
  const client = _client.withConfig({ apiVersion })

  // @TODO garbage collect expired secrets

  // @TODO consider using a stable ID
  const _id = `${schemaIdPrefix}.${id}`
  const newSecret = generateUrlSecret()
  const patch = client.patch(_id).set({ secret: newSecret, source, studioUrl })
  await client
    .transaction()
    .createOrReplace({ _id, _type: schemaType })
    .patch(patch)
    .commit({ tag })

  return newSecret
}

export type { SanityClientLike }
