import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import {createNode, createNodeMachine, type Node} from '@sanity/comlink'
import {setPerspectiveCookie} from '@sanity/next-loader/server-actions'
import {useRouter} from 'next/navigation.js'
import {useEffect, useState} from 'react'
import {useEffectEvent} from 'use-effect-event'

function PresentationComlink(props: {
  projectId: string
  dataset: string
  handleDraftModeAction: (secret: string) => Promise<void | string>
  draftModeEnabled: boolean
}): React.JSX.Element | null {
  const {handleDraftModeAction, draftModeEnabled, projectId, dataset} = props
  const router = useRouter()

  const [presentationComlink, setPresentationComlink] = useState<Node<
    LoaderControllerMsg,
    LoaderNodeMsg
  > | null>(null)

  const handlePerspectiveChange = useEffectEvent((perspective: ClientPerspective) => {
    if (draftModeEnabled) {
      setPerspectiveCookie(perspective)
        .then(() => router.refresh())
        // eslint-disable-next-line no-console
        .catch((reason) => console.error('Failed to set the preview perspective cookie', reason))
    }
  })

  const [status, setStatus] = useState('disconnected')
  useEffect(() => {
    const comlink = createNode<LoaderControllerMsg, LoaderNodeMsg>(
      {
        name: 'loaders',
        connectTo: 'presentation',
      },
      createNodeMachine<LoaderControllerMsg, LoaderNodeMsg>().provide({
        actors: createCompatibilityActors<LoaderNodeMsg>(),
      }),
    )

    comlink.onStatus((status) => {
      setStatus(status)
    })

    comlink.on('loader/perspective', (data) => {
      // eslint-disable-next-line no-console
      console.log('loader/perspective', data)
      handlePerspectiveChange(data.perspective)
    })

    const stop = comlink.start()
    setPresentationComlink(comlink)
    // eslint-disable-next-line no-console
    console.log('setting comlink', comlink)
    return () => {
      // eslint-disable-next-line no-console
      console.log('stopping comlink')
      stop()
    }
  }, [handlePerspectiveChange])

  const handleEnableDraftMode = useEffectEvent(async (signal: AbortSignal) => {
    if (signal.aborted) return
    const {secret} = await (presentationComlink?.fetch(
      {
        type: 'loader/fetch-preview-url-secret' as const,
        data: {projectId, dataset},
      },
      {signal},
    ) || {secret: null})
    if (signal.aborted) return
    const error = await handleDraftModeAction(secret!)
    // eslint-disable-next-line no-console
    // @TODO call another server action here that can tell us if draft mode is actually enabled
    if (error) {
      // @TODO use sonnet or whatever to push a toast with the error
      // eslint-disable-next-line no-console
      console.error('Error enabling draft mode', error)
      return
    }
    // console.log('Draft mode enabled?', {enabled})
    if (signal.aborted) return
    router.refresh()
  })
  const connected = status === 'connected'
  useEffect(() => {
    if (connected && !draftModeEnabled) {
      const controller = new AbortController()
      handleEnableDraftMode(controller.signal).catch((reason) => {
        // eslint-disable-next-line no-console
        console.error('Failed to enable draft mode', reason)
        return handleEnableDraftMode(controller.signal)
      })
      return () => {
        controller.abort()
      }
    }
    return undefined
  }, [connected, draftModeEnabled, handleEnableDraftMode])

  return null
}
PresentationComlink.displayName = 'PresentationComlink'

export default PresentationComlink