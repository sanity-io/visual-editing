import {handlePreview} from '@sanity/visual-editing/svelte'
import {type Handle} from '@sveltejs/kit'
import {sequence} from '@sveltejs/kit/hooks'
import {loadQuery as defaultLoadQuery, unstable__serverClient} from './createQueryStore'
import type {HandleOptions} from './types'

/**
 * @beta
 */
export const handleLoadQuery =
  ({loadQuery}: {loadQuery?: HandleOptions['loadQuery']}): Handle =>
  async ({event, resolve}) => {
    if (!event.locals.client)
      throw new Error(
        'Call `handlePreview` from `@sanity/visual-editing/svelte` before `handleLoadQuery`',
      )

    const lq = loadQuery || defaultLoadQuery
    const config = event.locals.client.config()

    event.locals.loadQuery = (query, params, options) =>
      lq(query, params, {
        perspective: config.perspective,
        useCdn: config.useCdn,
        ...options,
      })

    return await resolve(event)
  }

/**
 * @beta
 */
export const createRequestHandler = ({preview, loadQuery}: HandleOptions = {}): Handle => {
  const client = preview?.client || unstable__serverClient.instance!
  return sequence(handlePreview({client, preview}), handleLoadQuery({loadQuery}))
}
