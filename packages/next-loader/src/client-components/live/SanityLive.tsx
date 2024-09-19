import {createClient, type InitializedClientConfig} from '@sanity/client'
import {revalidateSyncTags} from '@sanity/next-loader/server-actions'
import dynamic from 'next/dynamic.js'
import {memo, useEffect, useMemo, useState} from 'react'

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
export const SanityLive = memo(function SanityLiveComponent(
  props: SanityLiveProps,
): React.JSX.Element | null {
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
    // eslint-disable-next-line no-console
    console.log('SanityLive mounted', {client}, client.config())
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
    // eslint-disable-next-line no-console
    console.log('SanityLive mounted')
    return () => {
      // eslint-disable-next-line no-console
      console.log('SanityLive unmounted')
    }
  }, [])

  useEffect(() => {
    // @TODO detect if we are possibly in a presentation context
    setLoadComlink(true)
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
})
SanityLive.displayName = 'memo(SanityLive)'
