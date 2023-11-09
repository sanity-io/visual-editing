/**
 * This plugin sets up the "Open preview (CTRL + ALT + O)" in the dropdown menu that hosts
 * other actions like "Review changes" and "Inspect"
 */

import { definePlugin, SanityDocument } from 'sanity'

import {
  defineUrlResolver,
  DefineUrlResolverOptions,
} from './defineUrlResolver'
import {
  apiVersion,
  fetchSecretQuery,
  FetchSecretResponse,
  tag,
  type UrlSecretId,
} from './isValidSecret'
import { MissingSlug } from '../src/types'
import { patchUrlSecret } from './utils'

export type { DefineUrlResolverOptions, UrlSecretId }

export interface ProductionUrlOptions extends DefineUrlResolverOptions {
  matchTypes?: string[]
  urlSecretId?: UrlSecretId
}

export const previewUrl = definePlugin<ProductionUrlOptions>(
  ({ urlSecretId, base, matchTypes, requiresSlug }) => {
    if (!base) {
      throw new TypeError('`base` is required')
    }

    const urlResolver = defineUrlResolver({ base, requiresSlug })
    return {
      name: 'previewUrl',
      document: {
        productionUrl: async (prev, { document, getClient }) => {
          if (matchTypes?.length && !matchTypes.includes(document._type)) {
            return prev
          }

          let urlSecret: string | null = null
          if (urlSecretId) {
            const client = getClient({ apiVersion })
            const data = await client.fetch<FetchSecretResponse>(
              fetchSecretQuery,
              { id: urlSecretId },
              { tag },
            )
            urlSecret = data?.secret
              ? data.secret
              : await patchUrlSecret(client, urlSecretId)
          }

          const url = urlResolver(document as SanityDocument, urlSecret)
          if (url) {
            return url === MissingSlug ? prev : url
          }

          return prev
        },
      },
    }
  },
)
