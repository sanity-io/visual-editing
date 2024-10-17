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
    setActor(actor)

    actor.start()
    comlink.start()
  }, [inFrame])

  return (
    <>
      <Overlays
        componentResolver={components}
        comlink={comlink}
        inFrame={inFrame}
        history={history}
        zIndex={zIndex}
      />
      {comlink && <Meta comlink={comlink} />}
      {comlink && refresh && <Refresh comlink={comlink} refresh={refresh} />}
    </>
  )
}
VisualEditing.displayName = 'VisualEditing'
