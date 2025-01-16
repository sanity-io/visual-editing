import type {VisualEditingControllerMsg} from '@sanity/presentation-comlink'
import {useEffect} from 'react'
import type {OverlayMsg, VisualEditingNode} from '../types'

export function usePerspectiveSync(
  comlink: VisualEditingNode | undefined,
  dispatch: (value: OverlayMsg | VisualEditingControllerMsg) => void,
): void {
  useEffect(() => {
    const controller = new AbortController()
    comlink
      ?.fetch('visual-editing/fetch-perspective', undefined, {
        signal: controller.signal,
        suppressWarnings: true,
      })
      .then((data) => {
        dispatch({type: 'presentation/perspective', data})
      })
      .catch(() => {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      })

    const unsub = comlink?.on('presentation/perspective', (data) => {
      dispatch({type: 'presentation/perspective', data})
    })

    return () => {
      unsub?.()
      controller.abort()
    }
  }, [comlink, dispatch])
}
