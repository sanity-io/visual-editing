import type { ResolveStudioUrl, StudioUrl } from '@sanity/client/csm'
import type { SanityStegaClient } from '@sanity/client/stega'
import type { QueryStore } from '@sanity/core-loader'
import { useEffect } from 'react'

import type { UseLiveModeHook } from './types'

export function defineUseLiveMode({
  enableLiveMode,
  setStudioUrl,
}: Pick<QueryStore, 'enableLiveMode'> & {
  setStudioUrl: (studioUrl: StudioUrl | ResolveStudioUrl | undefined) => void
}): UseLiveModeHook {
  return ({
    allowStudioOrigin,
    client,
    onConnect,
    onDisconnect,
    studioUrl,
  }) => {
    useEffect(() => {
      const disableLiveMode = enableLiveMode({
        allowStudioOrigin,
        client,
        onConnect,
        onDisconnect,
      })
      return () => disableLiveMode()
    }, [allowStudioOrigin, client, onConnect, onDisconnect])
    useEffect(() => {
      setStudioUrl(
        studioUrl ?? typeof client === 'object'
          ? (client as SanityStegaClient)?.config().stega?.studioUrl
          : undefined,
      )
    }, [studioUrl, client])
  }
}
