import type {SanityClient} from '@sanity/client'

import {handlePreview} from '@sanity/visual-editing/svelte'
import {type Handle} from '@sveltejs/kit'
import {sequence} from '@sveltejs/kit/hooks'

import type {HandleOptions} from './types'

import {loadQuery as defaultLoadQuery, unstable__serverClient} from './createQueryStore'

/**
 * @beta
 */
export const handleLoadQuery =
  ({
    client: _client,
    loadQuery,
  }: {
    loadQuery?: HandleOptions['loadQuery']
    client?: SanityClient
  }): Handle =>
  async ({event, resolve}) => {
    const client = _client || event.locals.client
    if (!client) throw new Error('No client instance provided to handleLoadQuery')

    const lq = loadQuery || defaultLoadQuery
    const {perspective, useCdn} = client.config()

    event.locals.loadQuery = (query, params, options = {}) => {
      const stega = event.locals.preview ? options.stega : false

      return lq(query, params, {
        ...options,
        perspective,
        useCdn,
        stega,
      })
    }

    return await resolve(event)
  }

/**
 * @beta
 */
export const createRequestHandler = ({loadQuery, preview}: HandleOptions = {}): Handle => {
  const client = preview?.client || unstable__serverClient.instance
  if (!client) throw new Error('No Sanity client configured for preview')
  return sequence(handlePreview({client, preview}), handleLoadQuery({loadQuery}))
}
