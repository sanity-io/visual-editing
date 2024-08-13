import type {ChannelsNode} from '@repo/channels'
import type {VisualEditingAPI} from '@repo/visual-editing-helpers'
import {type FunctionComponent, useEffect} from 'react'

/**
 * @internal
 */
export const Meta: FunctionComponent<{
  channel: ChannelsNode<VisualEditingAPI>
}> = (props) => {
  const {channel} = props

  useEffect(() => {
    const sendMeta = () => {
      channel.post('meta', {title: document.title})
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
