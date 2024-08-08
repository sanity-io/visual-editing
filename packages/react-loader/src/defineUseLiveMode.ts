import type {SanityClient} from '@sanity/client'
import type {ResolveStudioUrl, StudioUrl} from '@sanity/client/csm'
import type {QueryStore} from '@sanity/core-loader'
import {useEffect} from 'react'

import type {UseLiveModeHook} from './types'

export function defineUseLiveMode({
  enableLiveMode,
  setStudioUrl,
}: Pick<QueryStore, 'enableLiveMode'> & {
  setStudioUrl: (studioUrl: StudioUrl | ResolveStudioUrl | undefined) => void
}): UseLiveModeHook {
  return ({allowStudioOrigin, client, onConnect, onDisconnect, studioUrl}) => {
    useEffect(() => {
      if (allowStudioOrigin) {
        // eslint-disable-next-line no-console
        console.warn('`allowStudioOrigin` is deprecated and no longer needed')
      }
      const disableLiveMode = enableLiveMode({
        client,
        onConnect,
        onDisconnect,
      })
      return () => disableLiveMode()
    }, [allowStudioOrigin, client, onConnect, onDisconnect])
    useEffect(() => {
      setStudioUrl(
        (studioUrl ?? typeof client === 'object')
          ? (client as SanityClient)?.config().stega.studioUrl
          : undefined,
      )
    }, [studioUrl, client])
  }
}
