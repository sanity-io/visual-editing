import type {SanityClient} from '@sanity/client'
import {uuid} from '@sanity/uuid'
import {apiVersion, deleteExpiredSecretsQuery, schemaType, SECRET_TTL, tag} from './constants'
import {generateUrlSecret} from './generateSecret'
import type {SanityClientLike} from './types'

/** @internal */
export async function createPreviewSecret(
  _client: SanityClient,
  source: string,
  studioUrl: string,
  userId?: string,
  id = uuid(),
): Promise<{secret: string; expiresAt: Date}> {
  const client = _client.withConfig({apiVersion})

  try {
    const expiresAt = new Date(Date.now() + 1000 * SECRET_TTL)
    const _id = `drafts.${id}`
    const newSecret = generateUrlSecret()
    const patch = client.patch(_id).set({secret: newSecret, source, studioUrl, userId})
    await client.transaction().createOrReplace({_id, _type: schemaType}).patch(patch).commit({tag})

    return {secret: newSecret, expiresAt}
  } finally {
    try {
      // Garbage collect expired secrets
      await client.delete({query: deleteExpiredSecretsQuery})
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete expired secrets', err)
    }
  }
}

export type {SanityClientLike}
