import {useEffect, useState, type FunctionComponent} from 'react'
import type {VisualEditingOptions} from '../types'
import {History} from './History'
import {Meta} from './Meta'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'
import {useComlink} from './useComlink'
import {useDatasetMutator} from './useDatasetMutator'

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener(
    'load',
    () => {
      // eslint-disable-next-line no-console
      console.count('window.load')
    },
    {once: true},
  )
  window.addEventListener(
    'DOMContentLoaded',
    () => {
      // eslint-disable-next-line no-console
      console.count('window.DOMContentLoaded')
    },
    {once: true},
  )
  window.addEventListener(
    'loadeddata',
    () => {
      // eslint-disable-next-line no-console
      console.count('window.loadeddata')
    },
    {once: true},
  )
  window.addEventListener(
    'loadedmetadata',
    () => {
      // eslint-disable-next-line no-console
      console.count('window.loadedmetadata')
    },
    {once: true},
  )
  window.addEventListener(
    'loadstart',
    () => {
      // eslint-disable-next-line no-console
      console.count('window.loadstart')
    },
    {once: true},
  )
}

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {components, history, refresh, zIndex} = props
  const [inFrame, setInFrame] = useState(false)
  useEffect(() => setInFrame(window.self !== window.top || window.opener), [])

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
