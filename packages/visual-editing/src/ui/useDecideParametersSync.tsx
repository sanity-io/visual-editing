import type {VisualEditingControllerMsg} from '@sanity/presentation-comlink'
import {useEffect} from 'react'
import type {OverlayMsg, VisualEditingNode} from '../types'

export function useDecideParametersSync(
  comlink: VisualEditingNode | undefined,
  dispatch: (value: OverlayMsg | VisualEditingControllerMsg) => void,
): void {
  useEffect(() => {
    if (!comlink) return


    const controller = new AbortController()


    comlink
      ?.fetch('visual-editing/fetch-decide-parameters', undefined, {
        signal: controller.signal,
        suppressWarnings: true,
      })
      .then((data) => {
        dispatch({type: 'presentation/decide-parameters', data})
      })
      .catch((error) => {
        console.log('[useDecideParametersSync] Failed to fetch decide parameters:', error.message)
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      })

    const unsub = comlink?.on('presentation/decide-parameters', (data) => {
      dispatch({type: 'presentation/decide-parameters', data})
    })

    return () => {
      unsub?.()
      controller.abort()
    }
  }, [comlink, dispatch])
}