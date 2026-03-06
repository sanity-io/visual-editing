import {createNode, createNodeMachine} from '@sanity/comlink'
import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@sanity/presentation-comlink'
import {useEffect} from 'react'

import {setLoaderClientConfig, setLoaderComlink, setLoaderPerspective} from './loader-comlink/context'

/**
 * Creates a loader comlink node that connects to the Presentation Tool.
 * This enables `usePresentationQuery` to communicate with the Presentation Tool
 * for running queries and receiving live updates.
 * @internal
 */
export default function LoaderComlink(): null {
  useEffect(() => {
    const loaderComlink = createNode<LoaderNodeMsg, LoaderControllerMsg>(
      {
        name: 'loaders',
        connectTo: 'presentation',
      },
      createNodeMachine<LoaderNodeMsg, LoaderControllerMsg>().provide({
        actors: createCompatibilityActors<LoaderNodeMsg>(),
      }),
    )

    loaderComlink.on('loader/perspective', (data) => {
      setLoaderClientConfig(data.projectId, data.dataset)
      setLoaderPerspective(data.perspective)
    })

    const stop = loaderComlink.start()
    setLoaderComlink(loaderComlink)

    return () => {
      stop()
      setLoaderComlink(null)
      setLoaderClientConfig(null, null)
      setLoaderPerspective(null)
    }
  }, [])

  return null
}
LoaderComlink.displayName = 'LoaderComlink'
