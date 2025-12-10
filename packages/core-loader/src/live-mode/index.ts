import type {EnableLiveMode, EnableLiveModeOptions} from '../types'
import type {LazyEnableLiveModeOptions} from './enableLiveMode'

import {runtime} from '../env'

export const defineEnableLiveMode: (
  config: Omit<LazyEnableLiveModeOptions, Exclude<keyof EnableLiveModeOptions, 'client'>>,
) => EnableLiveMode = (config) => {
  const {ssr, setFetcher} = config

  return (options) => {
    if (runtime === 'server') {
      throw new Error('Live mode is not supported in server environments')
    }
    if (ssr && !options.client) {
      throw new Error('The `client` option in `enableLiveMode` is required')
    }

    const client = options.client || config.client || undefined
    const controller = new AbortController()
    let disableLiveMode: (() => void) | undefined
    import('./enableLiveMode').then(({enableLiveMode}) => {
      if (controller.signal.aborted) return
      disableLiveMode = enableLiveMode({...options, client, setFetcher, ssr})
    })
    return () => {
      controller.abort()
      disableLiveMode?.()
    }
  }
}
