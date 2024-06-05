import {type FunctionComponent, useEffect} from 'react'

import type {VisualEditingChannel} from '../types'

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

  return (
    <>
      {rsc.html && (
        <div style={{display: 'contents'}} dangerouslySetInnerHTML={{__html: rsc.html}} />
      )}
    </>
  )
}
