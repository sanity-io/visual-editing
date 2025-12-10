import type {SanityClient} from '@sanity/client'
import type {QueryStore} from '@sanity/core-loader'

import type {UseLiveMode} from './types'

import {defineStudioUrlStore} from './defineStudioUrlStore'

export function defineUseLiveMode({
  enableLiveMode,
  studioUrlStore,
}: Pick<QueryStore, 'enableLiveMode'> & {
  studioUrlStore: ReturnType<typeof defineStudioUrlStore>
}): UseLiveMode {
  return ({allowStudioOrigin, client, onConnect, onDisconnect, studioUrl} = {}) => {
    if (allowStudioOrigin) {
      // eslint-disable-next-line no-console
      console.warn('`allowStudioOrigin` is deprecated and no longer needed')
    }

    studioUrlStore.set(
      studioUrl ??
        (typeof client === 'object'
          ? (client as SanityClient)?.config().stega.studioUrl
          : undefined),
    )

    return enableLiveMode({
      client,
      onConnect,
      onDisconnect,
    })
  }
}
