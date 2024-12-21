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
  // @TODO remove initial state, set it to false
  const [inFrame, setInFrame] = useState(window.self !== window.top || window.opener)
  useEffect(() => {
    const inFrame = window.self !== window.top || window.opener
    setInFrame(inFrame)

    if (!inFrame) return undefined
    const controller = new AbortController()
    // Detect when Presentation Tool is ready to connect
    window.addEventListener(
      'message',
      ({data}: MessageEvent<unknown>) => {
        if (
          data &&
          typeof data === 'object' &&
          'domain' in data &&
          data.domain === 'sanity/channels' &&
          'from' in data &&
          data.from === 'presentation'
        ) {
          // eslint-disable-next-line no-console
          console.count('Presentation Tool detected in Visual Editing')
          controller.abort()
        }
      },
      {signal: controller.signal},
    )
    return () => {
      controller.abort()
    }
  }, [])

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
