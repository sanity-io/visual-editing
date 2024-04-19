import {type FunctionComponent, useEffect} from 'react'

import type {VisualEditingChannel} from '../types'

/**
 * @internal
 */
export const Meta: FunctionComponent<{
  channel?: VisualEditingChannel
}> = (props) => {
  const {channel} = props

  useEffect(() => {
    const sendMeta = () => {
      channel?.send('visual-editing/meta', {title: document.title})
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
  }, [channel])

  return null
}
