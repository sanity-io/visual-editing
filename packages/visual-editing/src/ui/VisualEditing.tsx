import {useSyncExternalStore, type FunctionComponent} from 'react'
import type {VisualEditingOptions} from '../types'
import {History} from './History'
import {Meta} from './Meta'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'
import {useComlink} from './useComlink'
import {useDatasetMutator} from './useDatasetMutator'

function emptySubscribe() {
  return () => {}
}

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {components, history, refresh, zIndex} = props
  const inFrame = useSyncExternalStore(
    emptySubscribe,
    () => window.self !== window.top || Boolean(window.opener),
    () => null,
  )
  const comlink = useComlink(inFrame === true)
  useDatasetMutator(comlink)

  return (
    <>
      {inFrame !== null && (
        <Overlays
          comlink={comlink}
          componentResolver={components}
          inFrame={inFrame}
          zIndex={zIndex}
        />
      )}
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
