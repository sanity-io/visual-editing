import {type FunctionComponent, useEffect, useInsertionEffect} from 'react'

import type {VisualEditingChannel} from '../types'

const isInserted = new Set<string>()

/**
 * @internal
 */
export const ExperimentalRender: FunctionComponent<{
  channel: VisualEditingChannel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rsc: any
}> = (props) => {
  const {channel, rsc} = props

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('ExperimentalRender', rsc, channel)
  }, [channel, rsc])

  useInsertionEffect(() => {
    if (rsc?.styleTags && !isInserted.has(rsc.styleTags)) {
      // eslint-disable-next-line no-console
      console.log('ExperimentalRender: Inserting style tags', rsc.styleTags)
      const {styleTags} = rsc
      isInserted.add(styleTags)
      const wip = document.createElement('head')
      wip.innerHTML = styleTags
      const [styleElement] = wip.childNodes
      document.head.appendChild(styleElement)

      return () => {
        isInserted.delete(styleTags)
        document.head.removeChild(styleElement)
      }
    }
    return undefined
  }, [rsc])

  return (
    <>
      {rsc.html && (
        <div style={{display: 'contents'}} dangerouslySetInnerHTML={{__html: rsc.html}} />
      )}
    </>
  )
}
