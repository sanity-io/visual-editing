import {
  createClient,
  type ClientPerspective,
  type InitializedClientConfig,
  type LiveEventMessage,
  type LiveEventRestart,
} from '@sanity/client'
import {revalidateSyncTags} from '@sanity/next-loader/server-actions'
import dynamic from 'next/dynamic'
import {useRouter} from 'next/navigation.js'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useEffectEvent} from 'use-effect-event'
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
    | 'requestTagPrefix'
  > {
  // handleDraftModeAction: (secret: string) => Promise<void | string>
  draftModeEnabled: boolean
  draftModePerspective?: ClientPerspective
  refreshOnMount?: boolean
  refreshOnFocus?: boolean
  refreshOnReconnect?: boolean
  tag: string
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
    requestTagPrefix,
    // handleDraftModeAction,
    draftModeEnabled,
    draftModePerspective,
    refreshOnMount = false,
    refreshOnFocus = typeof window === 'undefined' ? true : window.self === window.top,
    refreshOnReconnect = true,
    tag,
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
        requestTagPrefix,
      }),
    [
      apiHost,
      apiVersion,
      dataset,
      ignoreBrowserTokenWarning,
      projectId,
      requestTagPrefix,
      token,
      useProjectHostname,
    ],
  )

  /**
   * 2. Validate CORS before setting up the Event Source for the Server Sent Events
   */
  useEffect(() => {
    // @TODO move this validation logic to `@sanity/client`
    // and include CORS detection https://github.com/sanity-io/sanity/blob/9848f2069405e5d06f82a61a902f141e53099493/packages/sanity/src/core/store/_legacy/authStore/createAuthStore.ts#L92-L102
    const path = client.getDataUrl('live/events')
    const url = new URL(client.getUrl(path, false))
    const preflightTag = [requestTagPrefix, tag, 'cors-preflight'].filter(Boolean).join('.')
    if (preflightTag) {
      url.searchParams.set('tag', preflightTag)
    }
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
  }, [tag, client, requestTagPrefix, token])

  /**
   * 3. Handle Live Events and call revalidateTag or router.refresh when needed
   */
  const router = useRouter()
  const handleLiveEvent = useEffectEvent((event: LiveEventMessage | LiveEventRestart) => {
    if (event.type === 'message') {
      revalidateSyncTags(event.tags)
    } else if (event.type === 'restart') {
      router.refresh()
    }
  })
  useEffect(() => {
    const subscription = client.live.events({includeDrafts: !!token, tag}).subscribe({
      next: (event) => {
        if (event.type === 'message' || event.type === 'restart') {
          handleLiveEvent(event)
        }
      },
      error: setError,
    })
    return () => subscription.unsubscribe()
  }, [client.live, handleLiveEvent, tag, token])

  /**
   * 4. Notify what perspective we're in, when in Draft Mode
   */
  useEffect(() => {
    if (draftModeEnabled && draftModePerspective) {
      setPerspective(draftModePerspective)
    } else {
      setPerspective('unknown')
    }
  }, [draftModeEnabled, draftModePerspective])

  const [loadComlink, setLoadComlink] = useState(false)
  /**
   * 5. Notify what environment we're in, when in Draft Mode
   */
  useEffect(() => {
    if (draftModeEnabled && loadComlink) {
      setEnvironment(opener ? 'presentation-window' : 'presentation-iframe')
    } else if (draftModeEnabled && token) {
      setEnvironment('live')
    } else {
      setEnvironment('unknown')
    }
  }, [draftModeEnabled, loadComlink, token])

  /**
   * 6. If Presentation Tool is detected, load up the comlink and integrate with it
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
          data.from === 'presentation'
        ) {
          setLoadComlink(true)
          controller.abort()
        }
      },
      {signal: controller.signal},
    )
    return () => controller.abort()
  }, [])

  /**
   * 7. Warn if draft mode is being disabled
   * @TODO move logic into PresentationComlink, or maybe VisualEditing?
   */
  const draftModeEnabledWarnRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (!draftModeEnabled) return
    clearTimeout(draftModeEnabledWarnRef.current)
    return () => {
      draftModeEnabledWarnRef.current = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.warn('Sanity Live: Draft mode was enabled, but is now being disabled')
      })
    }
  }, [draftModeEnabled])

  return (
    <>
      {draftModeEnabled && loadComlink && (
        <PresentationComlink
          // projectId={projectId!}
          // dataset={dataset!}
          // handleDraftModeAction={handleDraftModeAction}
          draftModeEnabled={draftModeEnabled}
          draftModePerspective={draftModePerspective!}
        />
      )}
      {!draftModeEnabled && refreshOnMount && <RefreshOnMount />}
      {!draftModeEnabled && refreshOnFocus && <RefreshOnFocus />}
      {!draftModeEnabled && refreshOnReconnect && <RefreshOnReconnect />}
    </>
  )
}
SanityLive.displayName = 'SanityLive'
