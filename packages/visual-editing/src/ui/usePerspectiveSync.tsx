import type {VisualEditingControllerMsg} from '@repo/visual-editing-helpers'
import {useEffect} from 'react'
import type {OverlayMsg, VisualEditingNode} from '../types'

export function usePerspectiveSync(
  comlink: VisualEditingNode | undefined,
  dispatch: (value: OverlayMsg | VisualEditingControllerMsg) => void,
): void {
  useEffect(() => {
    comlink?.fetch({type: 'visual-editing/fetch-perspective', data: undefined}).then((data) => {
      dispatch({type: 'presentation/perspective', data})
    })

    return comlink?.on('presentation/perspective', (data) => {
      dispatch({type: 'presentation/perspective', data})
    })
  }, [comlink, dispatch])
}
