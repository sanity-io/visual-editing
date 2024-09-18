import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import {createNode, createNodeMachine} from '@sanity/comlink'
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

  const handlePerspectiveChange = useEffectEvent((perspective: ClientPerspective) => {
    setPerspectiveCookie(perspective)
      .then(() => router.refresh())
      // eslint-disable-next-line no-console
      .catch((reason) => console.error('Failed to set the preview perspective cookie', reason))
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
    return () => stop()
  }, [handlePerspectiveChange])

  useEffect(() => {
    if (status === 'connected' && !draftModeEnabled) {
      let cancelled = false
      enableDraftMode('secret')
        .then((enabled) => {
          // eslint-disable-next-line no-console
          console.log('Draft mode enabled?', {enabled})
          if (cancelled) return
          router.refresh()
        })
        // eslint-disable-next-line no-console
        .catch((reason) => console.error('Failed to enable draft mode', reason))
      return () => {
        cancelled = true
      }
    }
    return undefined
  }, [draftModeEnabled, enableDraftMode, router, status])

  return null
}
