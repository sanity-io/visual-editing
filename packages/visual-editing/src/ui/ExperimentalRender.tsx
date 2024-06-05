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
    if (rsc?.css && !isInserted.has(rsc.css)) {
      // eslint-disable-next-line no-console
      console.log('ExperimentalRender: Inserting CSS', rsc.css)
      const {css} = rsc
      isInserted.add(css)
      const node = document.createElement('style')
      node.innerHTML = css
      document.head.appendChild(node)

      return () => {
        isInserted.delete(css)
        document.head.removeChild(node)
      }
    }
    return undefined
  }, [rsc?.css])

  return (
    <>
      {/* {rsc.css && <style dangerouslySetInnerHTML={{__html: rsc.css}} />} */}
      {rsc.html && (
        <div style={{display: 'contents'}} dangerouslySetInnerHTML={{__html: rsc.html}} />
      )}
    </>
  )
}
