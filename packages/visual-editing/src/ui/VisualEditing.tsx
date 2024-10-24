import {
  createCompatibilityActors,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import {createNode, createNodeMachine} from '@sanity/comlink'
import {useEffect, useState, type FunctionComponent} from 'react'
import {createActor} from 'xstate'
import type {VisualEditingNode, VisualEditingOptions} from '../types'
import {createDatasetMutator} from './comlink'
import {History} from './History'
import {Meta} from './Meta'
import {setActor} from './optimistic-state/context'
import {createSharedListener} from './optimistic-state/machines/createSharedListener'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {components, history, refresh, zIndex} = props
  const inFrame = window.self !== window.top || window.opener

  const [comlink, setComlink] = useState<VisualEditingNode | undefined>(undefined)

  useEffect(() => {
    if (!inFrame) return
    const comlink = createNode<VisualEditingControllerMsg, VisualEditingNodeMsg>(
      {
        name: 'visual-editing',
        connectTo: 'presentation',
      },
      createNodeMachine<VisualEditingControllerMsg, VisualEditingNodeMsg>().provide({
        actors: createCompatibilityActors<VisualEditingNodeMsg>(),
      }),
    )
    setComlink(comlink)

    const listener = createSharedListener(comlink)
    const datasetMutator = createDatasetMutator(comlink)
    const actor = createActor(datasetMutator, {
      // @ts-expect-error @todo
      input: {client: {withConfig: () => {}}, sharedListener: listener},
    })

    // Fetch features to determine if optimistic updates are supported
    const abortController = new AbortController()
    comlink
      .fetch({type: 'visual-editing/features', data: undefined}, {signal: abortController.signal})
      .then((data) => {
        if (data.features['optimistic']) {
          setActor(actor)
        }
      })
      .catch(() => {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      })

    actor.start()
    comlink.start()

    return () => {
      abortController.abort()
      actor.stop()
      comlink.stop()
    }
  }, [inFrame])

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
