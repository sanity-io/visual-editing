import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@repo/visual-editing-helpers'
import {createNode, createNodeMachine} from '@sanity/comlink'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'

export default function PresentationComlink(props: {
  enableDraftMode: (secret: string) => Promise<boolean>
  draftModeEnabled: boolean
}): React.JSX.Element | null {
  const {enableDraftMode, draftModeEnabled} = props
  const router = useRouter()

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

    const stop = comlink.start()
    return () => stop()
  }, [enableDraftMode, router])

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
