import {createClient, type ClientPerspective, type InitializedClientConfig} from '@sanity/client'
import {revalidateSyncTags} from '@sanity/next-loader/server-actions'
import dynamic from 'next/dynamic'
import {useEffect, useMemo, useState} from 'react'
import {setEnvironment, setPerspective} from '../../hooks/context'

const PresentationComlink = dynamic(() => import('./PresentationComlink'), {ssr: false})
const RefreshOnMount = dynamic(() => import('./RefreshOnMount'), {ssr: false})
const RefreshOnFocus = dynamic(() => import('./RefreshOnFocus'), {ssr: false})
const RefreshOnReconnect = dynamic(() => import('./RefreshOnReconnect'), {ssr: false})

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
  // handleDraftModeAction: (secret: string) => Promise<void | string>
  draftModeEnabled: boolean
  draftModePerspective?: ClientPerspective
  refreshOnMount?: boolean
  refreshOnFocus?: boolean
  refreshOnReconnect?: boolean
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
    // handleDraftModeAction,
    draftModeEnabled,
    draftModePerspective,
    refreshOnMount = false,
    refreshOnFocus = true,
    refreshOnReconnect = true,
  } = props

  const [error, setError] = useState<unknown>(null)
  // Rethrow error to the nearest error boundary
  if (error) {
    throw error
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info(
        'Sanity is live with',
        token
          ? 'automatic revalidation for draft content changes as well as published content'
          : draftModeEnabled
            ? 'automatic revalidation for only published content. Provide a `browserToken` to `defineLive` to support draft content outside of Presentation Tool.'
            : 'automatic revalidation of published content',
      )
    }
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
    // @TODO move this validation logic to `@sanity/client`
    // and include CORS detection https://github.com/sanity-io/sanity/blob/9848f2069405e5d06f82a61a902f141e53099493/packages/sanity/src/core/store/_legacy/authStore/createAuthStore.ts#L92-L102
    const path = client.getDataUrl('live/events')
    const url = new URL(client.getUrl(path, false))
    if (token) {
      url.searchParams.set('includeDrafts', 'true')
    }

    const controller = new AbortController()
    async function validateConnection(signal: AbortSignal) {
      const response = await fetch(url, {
        signal,
        headers: token
          ? {
              authorization: `Bearer ${token}`,
            }
          : undefined,
      })

      if (!response.ok) {
        if (response.status === 401 && token) {
          throw new Error(`Failed to connect to '${url}', invalid browser token`, {
            cause: response.statusText,
          })
        } else {
          throw new Error(`Failed to connect to '${url}': ${response.status}`, {
            cause: response.statusText,
          })
        }
      }
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get stream reader')
      }

      try {
        // Read the first chunk of data
        const {done, value} = await reader.read()

        // If we've received any data, or the stream isn't done, consider it valid
        if (done || !value) {
          throw new Error('Stream ended without data')
        }
      } finally {
        // Cancel the reader and abort the fetch
        reader.cancel()
        controller.abort()
      }
    }
    validateConnection(controller.signal).catch((error) => {
      // Ignore AbortError, as it's expected when we cancel the fetch
      if (error?.name !== 'AbortError') {
        // eslint-disable-next-line no-console
        console.error('Error validating EventSource URL:', error)
        setError(error)
      }
    })
    return () => controller.abort()
  }, [client, token])

  useEffect(() => {
    const subscription = client.live.events(token ? {includeDrafts: true} : undefined).subscribe({
      next: (event) => {
        if (event.type === 'message') {
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
          // projectId={projectId!}
          // dataset={dataset!}
          // handleDraftModeAction={handleDraftModeAction}
          draftModeEnabled={draftModeEnabled}
        />
      )}
      {refreshOnMount && <RefreshOnMount />}
      {refreshOnFocus && <RefreshOnFocus />}
      {refreshOnReconnect && <RefreshOnReconnect />}
    </>
  )
}
SanityLive.displayName = 'SanityLive'
