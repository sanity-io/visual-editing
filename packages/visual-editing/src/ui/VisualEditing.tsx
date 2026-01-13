import {isMaybePreviewIframe, isMaybePreviewWindow} from '@sanity/presentation-comlink'
import {startTransition, useEffect, useState} from 'react'
import {createPortal} from 'react-dom'

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
export const VisualEditing = (props: VisualEditingOptions & {portal: boolean}): React.ReactNode => {
  const {components, plugins, history, portal = true, refresh, zIndex, onPerspectiveChange} = props

  const [inFrame, setInFrame] = useState<boolean | null>(null)
  const [inPopUp, setInPopUp] = useState<boolean | null>(null)
  useEffect(() => {
    startTransition(() => {
      setInFrame(isMaybePreviewIframe())
      setInPopUp(isMaybePreviewWindow())
    })
  }, [])

  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (portal === false) return undefined
    const node = document.createElement('sanity-visual-editing')
    document.documentElement.appendChild(node)
    startTransition(() => setPortalElement(node))
    return () => {
      startTransition(() => setPortalElement(null))
      if (document.documentElement.contains(node)) {
        document.documentElement.removeChild(node)
      }
    }
  }, [portal])

  const [comlink, comlinkStatus] = useComlink(inFrame === true || inPopUp === true)
  useDatasetMutator(comlinkStatus === 'connected' ? comlink : undefined)

  const children = (
    <>
      {inFrame !== null && inPopUp !== null && (
        <Overlays
          comlink={comlink}
          comlinkStatus={comlinkStatus}
          componentResolver={components}
          onPerspectiveChange={onPerspectiveChange}
          plugins={plugins}
          inFrame={inFrame}
          inPopUp={inPopUp}
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

  if (portal === false || !portalElement) return children

  return createPortal(children, portalElement)
}
VisualEditing.displayName = 'VisualEditing'
