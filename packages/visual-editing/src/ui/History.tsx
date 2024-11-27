import {useEffect, type FunctionComponent} from 'react'
import type {HistoryAdapter, VisualEditingNode} from '../types'

/**
 * @internal
 */
export const History: FunctionComponent<{
  comlink: VisualEditingNode
  history?: HistoryAdapter
}> = (props) => {
  const {comlink, history} = props

  useEffect(() => {
    return comlink?.on('presentation/navigate', (data) => {
      history?.update(data)
    })
  }, [comlink, history])

  useEffect(() => {
    if (history) {
      return history.subscribe((update) => {
        update.title = update.title || document.title
        comlink?.post('visual-editing/navigate', update)
      })
    }
    return
  }, [comlink, history])

  return null
}
