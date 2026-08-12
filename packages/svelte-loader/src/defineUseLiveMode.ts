import type {QueryStore} from '@sanity/core-loader'

import {defineStudioUrlStore} from './defineStudioUrlStore'
import type {UseLiveMode} from './types'

export function defineUseLiveMode({
  enableLiveMode,
  studioUrlStore,
}: Pick<QueryStore, 'enableLiveMode'> & {
  studioUrlStore: ReturnType<typeof defineStudioUrlStore>
}): UseLiveMode {
  return ({
    allowStudioOrigin,
    client,
    onConnect,
    onDisconnect,
    onPerspective,
    onVariant,
    studioUrl,
  } = {}) => {
    if (allowStudioOrigin) {
      console.warn('`allowStudioOrigin` is deprecated and no longer needed')
    }

    studioUrlStore.set(
      studioUrl ?? (typeof client === 'object' ? client?.config().stega.studioUrl : undefined),
    )

    return enableLiveMode({
      client,
      onConnect,
      onDisconnect,
      onPerspective,
      onVariant,
    })
  }
}
