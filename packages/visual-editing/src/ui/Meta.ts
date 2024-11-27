import {useEffect, type FunctionComponent} from 'react'
import type {VisualEditingNode} from '../types'

/**
 * @internal
 */
export const Meta: FunctionComponent<{
  comlink: VisualEditingNode
}> = (props) => {
  const {comlink} = props

  useEffect(() => {
    const sendMeta = () => {
      comlink.post('visual-editing/meta', {title: document.title})
    }

    const observer = new MutationObserver(([mutation]) => {
      if (mutation.target.nodeName === 'TITLE') {
        sendMeta()
      }
    })

    observer.observe(document.head, {
      subtree: true,
      characterData: true,
      childList: true,
    })

    sendMeta()

    return () => observer.disconnect()
  }, [comlink])

  return null
}
