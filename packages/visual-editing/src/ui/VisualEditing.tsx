import type {FunctionComponent} from 'react'

import type {VisualEditingOptions} from '../types'
import {Meta} from './Meta'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'
import {useComlink} from './useComlink'

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {history, refresh, zIndex} = props
  const comlink = useComlink()
  const inFrame = window.self !== window.top || window.opener

  return (
    comlink && (
      <>
        <Overlays comlink={comlink} inFrame={inFrame} history={history} zIndex={zIndex} />
        <Meta comlink={comlink} />
        {refresh && <Refresh comlink={comlink} refresh={refresh} />}
      </>
    )
  )
}
