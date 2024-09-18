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

export default function PresentationComlink(props: {
  enableDraftMode: (secret: string) => Promise<boolean>
  draftModeEnabled: boolean
}): React.JSX.Element | null {
  const {enableDraftMode, draftModeEnabled} = props
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
    return () => stop()
  }, [handlePerspectiveChange])

  const handleEnableDraftMode = useEffectEvent((signal: AbortSignal) => {
    presentationComlink
      ?.fetch({type: 'loader/fetch-preview-url-secret', data: undefined}, {signal})
      .then(({secret}) =>
        enableDraftMode(secret!).then((enabled) => {
          // eslint-disable-next-line no-console
          console.log('Draft mode enabled?', {enabled})
          if (signal.aborted) return
          router.refresh()
        }),
      )

      // eslint-disable-next-line no-console
      .catch((reason) => console.error('Failed to enable draft mode', reason))
  })
  useEffect(() => {
    if (status === 'connected' && !draftModeEnabled) {
      const controller = new AbortController()
      handleEnableDraftMode(controller.signal)
      return () => {
        controller.abort()
      }
    }
    return undefined
  }, [draftModeEnabled, handleEnableDraftMode, status])

  return null
}
