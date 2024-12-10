import {
  createCompatibilityActors,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import {createNode, createNodeMachine} from '@sanity/comlink'
import {useEffect, useState, type FunctionComponent} from 'react'
import {createActor} from 'xstate'
import {setActor} from '../optimistic/context'
import {createSharedListener} from '../optimistic/state/createSharedListener'
import {createDatasetMutator} from '../optimistic/state/datasetMutator'
import type {VisualEditingNode, VisualEditingOptions} from '../types'
import {History} from './History'
import {Meta} from './Meta'
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
    const comlink = createNode<VisualEditingNodeMsg, VisualEditingControllerMsg>(
      {
        name: 'visual-editing',
        connectTo: 'presentation',
      },
      createNodeMachine<VisualEditingNodeMsg, VisualEditingControllerMsg>().provide({
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
    const controller = new AbortController()
    comlink
      .fetch('visual-editing/features', undefined, {
        signal: controller.signal,
        suppressWarnings: true,
      })
      .then((data) => {
        if (data.features['optimistic']) {
          setActor(actor)
        }
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.warn(
          '[@sanity/visual-editing] Package version mismatch detected: Please update your Sanity studio to prevent potential compatibility issues.',
        )
      })

    actor.start()
    comlink.start()

    return () => {
      controller.abort()
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
