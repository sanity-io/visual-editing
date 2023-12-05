import type { QueryStore } from '@sanity/core-loader'
import { useEffect } from 'react'

import { UseLiveModeHook } from './types'

export function defineUseLiveMode({
  enableLiveMode,
}: Pick<QueryStore, 'enableLiveMode'>): UseLiveModeHook {
  return ({ allowStudioOrigin, client, onConnect, onDisconnect }) => {
    useEffect(() => {
      const disableLiveMode = enableLiveMode({
        allowStudioOrigin,
        client,
        onConnect,
        onDisconnect,
      })
      return () => disableLiveMode()
    }, [allowStudioOrigin, client, onConnect, onDisconnect])
  }
}
