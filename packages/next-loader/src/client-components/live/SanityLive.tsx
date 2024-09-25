import {createClient, type ClientPerspective, type InitializedClientConfig} from '@sanity/client'
import {revalidateSyncTags} from '@sanity/next-loader/server-actions'
import dynamic from 'next/dynamic.js'
import {useEffect, useMemo, useState} from 'react'
import {setEnvironment, setPerspective} from '../../hooks/context'

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
  draftModePerspective?: ClientPerspective
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
    draftModePerspective,
  } = props

  const [error, setError] = useState<unknown>(null)
  // Rethrow error to the nearest error boundary
  if (error) {
    throw error
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      'Sanity is live with',
      token
        ? 'automatic revalidation for draft content changes as well as published content'
        : draftModeEnabled
          ? 'automatic revalidation for only published content. Provide a `browserToken` to `defineLive` to support draft content outside of Presentation Tool.'
          : 'automatic revalidation of published content',
    )
  }, [draftModeEnabled, token])

  /**
   * 1. Handle Live Events and call revalidateTag when needed
   */
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
    const subscription = client.live.events(token ? {includeDrafts: true} : undefined).subscribe({
      next: (event) => {
        if (event.type === 'message') {
          // eslint-disable-next-line no-console
          console.log('live.events() changed', event.tags)
          revalidateSyncTags(event.tags)
        }
      },
      error: setError,
    })
    return () => subscription.unsubscribe()
  }, [client, token])

  /**
   * 2. Notify what perspective we're in, when in Draft Mode
   */
  useEffect(() => {
    if (draftModeEnabled && draftModePerspective) {
      setPerspective(draftModePerspective)
    } else {
      setPerspective('unknown')
    }
    return () => setPerspective('checking')
  }, [draftModeEnabled, draftModePerspective])

  const [loadComlink, setLoadComlink] = useState(false)
  /**
   * 3. Notify what environment we're in, when in Draft Mode
   */
  useEffect(() => {
    if (loadComlink) {
      setEnvironment(opener ? 'presentation-window' : 'presentation-iframe')
    } else if (draftModeEnabled && token) {
      setEnvironment('live')
    } else {
      setEnvironment('unknown')
    }
    return () => setEnvironment('checking')
  }, [draftModeEnabled, loadComlink, token])

  /**
   * 4. If Presentation Tool is detected, load up the comlink and integrate with it
   */
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
