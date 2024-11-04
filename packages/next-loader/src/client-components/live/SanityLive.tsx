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
import {setEnvironment, setPerspective, type DraftPerspective} from '../../hooks/context'

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
    | 'requestTagPrefix'
  > {
  // handleDraftModeAction: (secret: string) => Promise<void | string>
  draftModeEnabled: boolean
  draftModePerspective?: string
  refreshOnMount?: boolean
  refreshOnFocus?: boolean
  refreshOnReconnect?: boolean
  tag: string
}

// @TODO these should be reusable utils in visual-editing-helpers

const isMaybePreviewIframe = () => window !== window.parent
const isMaybePreviewWindow = () => !!window.opener
const isMaybePresentation = () => isMaybePreviewIframe() || isMaybePreviewWindow()

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
        ignoreBrowserTokenWarning: true,
        token,
        useCdn: false,
        requestTagPrefix,
      }),
    [apiHost, apiVersion, dataset, projectId, requestTagPrefix, token, useProjectHostname],
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
      setPerspective(draftModePerspective as DraftPerspective)
    } else {
      setPerspective('unknown')
    }
  }, [draftModeEnabled, draftModePerspective])

  const [loadComlink, setLoadComlink] = useState(false)
  /**
   * 5. Notify what environment we're in, when in Draft Mode
   */
  useEffect(() => {
    // If we might be in Presentation Tool, then skip detecting here as it's handled later
    if (isMaybePresentation()) return

    // If we're definitely not in Presentation Tool, then we can set the environment as stand-alone live preview
    // if we have both a browser token, and draft mode is enabled
    if (draftModeEnabled && token) {
      setEnvironment('live')
      return
    }
    // If we're in draft mode, but don't have a browser token, then we're in static mode
    // which means that published content is still live, but draft changes likely need manual refresh
    if (draftModeEnabled) {
      setEnvironment('static')
      return
    }

    // Fallback to `unknown` otherwise, as we simply don't know how it's setup
    setEnvironment('unknown')
    return
  }, [draftModeEnabled, token])

  /**
   * 6. If Presentation Tool is detected, load up the comlink and integrate with it
   */
  useEffect(() => {
    if (!isMaybePresentation()) return
    const controller = new AbortController()
    // Wait for a while to see if Presentation Tool is detected, before assuming the env to be stand-alone live preview
    const timeout = setTimeout(() => setEnvironment('live'), 3_000)
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
          clearTimeout(timeout)
          setEnvironment(isMaybePreviewWindow() ? 'presentation-window' : 'presentation-iframe')
          setLoadComlink(true)
          controller.abort()
        }
      },
      {signal: controller.signal},
    )
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
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
          draftModePerspective={draftModePerspective! as ClientPerspective}
        />
      )}
      {!draftModeEnabled && refreshOnMount && <RefreshOnMount />}
      {!draftModeEnabled && refreshOnFocus && <RefreshOnFocus />}
      {!draftModeEnabled && refreshOnReconnect && <RefreshOnReconnect />}
    </>
  )
}
SanityLive.displayName = 'SanityLive'
