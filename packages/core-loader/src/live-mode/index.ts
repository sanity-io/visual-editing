import { EnableLiveMode, EnableLiveModeOptions } from '../types'
import type { LazyEnableLiveModeOptions } from './enableLiveMode'

export const defineEnableLiveMode: (
  config: Omit<LazyEnableLiveModeOptions, keyof EnableLiveModeOptions>,
) => EnableLiveMode = (config) => {
  const { client, setFetcher } = config

  return (options) => {
    if (typeof document === 'undefined') {
      return () => {
        // Do nothing if not in browser
      }
    }

    const controller = new AbortController()
    let disableLiveMode: (() => void) | undefined
    import('./enableLiveMode').then(({ enableLiveMode }) => {
      if (controller.signal.aborted) return
      disableLiveMode = enableLiveMode({ ...options, client, setFetcher })
    })
    return () => {
      controller.abort()
      disableLiveMode?.()
    }
  }
}
