import {createClient, type InitializedClientConfig} from '@sanity/client'
import {revalidateSyncTags} from '@sanity/next-loader/server-actions'
import dynamic from 'next/dynamic.js'
import {useEffect, useMemo, useState} from 'react'

const PresentationComlink = dynamic(() => import('./PresentationComlink'), {ssr: false})

/**
 * @public
 */
export interface SanityLiveProps
  extends Pick<
    InitializedClientConfig,
    | 'projectId'
    | 'dataset'
    | 'apiHost'
    | 'apiVersion'
    | 'useProjectHostname'
    | 'token'
    | 'ignoreBrowserTokenWarning'
  > {
  handleDraftModeAction: (secret: string) => Promise<void | string>
  draftModeEnabled: boolean
}

/**
 * @public
 */
export function SanityLive(props: SanityLiveProps): React.JSX.Element | null {
  const {
    projectId,
    dataset,
    apiHost,
    apiVersion,
    useProjectHostname,
    ignoreBrowserTokenWarning,
    token,
    handleDraftModeAction,
    draftModeEnabled,
  } = props
  const client = useMemo(
    () =>
      createClient({
        projectId,
        dataset,
        apiHost,
        apiVersion,
        useProjectHostname,
        ignoreBrowserTokenWarning,
        token,
        useCdn: false,
      }),
    [apiHost, apiVersion, dataset, ignoreBrowserTokenWarning, projectId, token, useProjectHostname],
  )
  useEffect(() => {
    const subscription = client.live.events().subscribe((event) => {
      if (event.type === 'message') {
        // eslint-disable-next-line no-console
        console.log('live.events() changed', event.tags)
        revalidateSyncTags(event.tags)
      }
    })
    return () => subscription.unsubscribe()
  }, [client])

  const [loadComlink, setLoadComlink] = useState(false)

  useEffect(() => {
    if (window === parent && !opener) return
    const controller = new AbortController()
    window.addEventListener(
      'message',
      ({data}: MessageEvent<unknown>) => {
        if (
          data &&
          typeof data === 'object' &&
          'domain' in data &&
          data.domain === 'sanity/channels' &&
          'from' in data &&
          data.from === 'presentation' &&
          'to' in data &&
          data.to === 'loaders' &&
          'type' in data &&
          data.type === 'handshake/syn'
        ) {
          setLoadComlink(true)
          controller.abort()
        }
      },
      {signal: controller.signal},
    )
    return () => controller.abort()
  }, [])

  return (
    <>
      {loadComlink && (
        <PresentationComlink
          projectId={projectId!}
          dataset={dataset!}
          handleDraftModeAction={handleDraftModeAction}
          draftModeEnabled={draftModeEnabled}
        />
      )}
    </>
  )
}
SanityLive.displayName = 'SanityLive'
