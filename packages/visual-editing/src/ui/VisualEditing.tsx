import {type FunctionComponent} from 'react'
import type {VisualEditingOptions} from '../types'
import {History} from './History'
import {Meta} from './Meta'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'
import {useComlink} from './useComlink'
import {useDatasetMutator} from './useDatasetMutator'

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {components, history, refresh, zIndex} = props
  // @TODO do this detection in a side effect
  const inFrame = window.self !== window.top || window.opener

  const comlink = useComlink(inFrame)
  useDatasetMutator(comlink)

  return (
    <>
      <Overlays
        comlink={comlink}
        componentResolver={components}
        inFrame={inFrame}
        zIndex={zIndex}
      />
      {comlink && (
        <>
          <History comlink={comlink} history={history} />
          <Meta comlink={comlink} />
          {refresh && <Refresh comlink={comlink} refresh={refresh} />}
        </>
      )}
    </>
  )
}
VisualEditing.displayName = 'VisualEditing'
