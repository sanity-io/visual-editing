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
  enableDraftMode: (secret: string) => Promise<boolean>
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
    enableDraftMode,
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
    // eslint-disable-next-line no-console
    console.log(client)
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
    // @TODO detect if we are possibly in a presentation context
    setLoadComlink(true)
  }, [])

  return (
    <>
      {loadComlink && (
        <PresentationComlink
          enableDraftMode={enableDraftMode}
          draftModeEnabled={draftModeEnabled}
        />
      )}
    </>
  )
}
