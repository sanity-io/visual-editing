import {
  createClient,
  type ClientPerspective,
  type InitializedClientConfig,
  type LiveEventMessage,
  type LiveEventRestart,
  type LiveEventWelcome,
} from '@sanity/client'
import {revalidateSyncTags} from '@sanity/next-loader/server-actions'
import dynamic from 'next/dynamic'
import {useRouter} from 'next/navigation.js'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useEffectEvent} from 'use-effect-event'
import {setEnvironment, setPerspective} from '../../hooks/context'
import {isCorsOriginError} from '../../isCorsOriginError'

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
  draftModePerspective?: ClientPerspective
  refreshOnMount?: boolean
  refreshOnFocus?: boolean
  refreshOnReconnect?: boolean
  tag: string
  /**
   * Handle errors from the Live Events subscription.
   * By default it's reported using `console.error`, you can override this prop to handle it in your own way.
   */
  onError?: (error: unknown) => void
}

// @TODO these should be reusable utils in visual-editing-helpers

const isMaybePreviewIframe = () => window !== window.parent
const isMaybePreviewWindow = () => !!window.opener
const isMaybePresentation = () => isMaybePreviewIframe() || isMaybePreviewWindow()

const handleError = (error: unknown) => {
  /* eslint-disable no-console */
  if (isCorsOriginError(error)) {
    console.warn(
      `Sanity Live is unable to connect to the Sanity API as it's not in the list over allowed origins for your project.`,
      error.addOriginUrl && `Add it here:`,
      error.addOriginUrl?.toString(),
    )
  } else {
    console.error(error)
  }
  /* eslint-enable no-console */
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
    token,
    requestTagPrefix,
    // handleDraftModeAction,
    draftModeEnabled,
    draftModePerspective,
    refreshOnMount = false,
    refreshOnFocus = typeof window === 'undefined' ? true : window.self === window.top,
    refreshOnReconnect = true,
    tag,
    onError = handleError,
  } = props

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
   * 1. Handle Live Events and call revalidateTag or router.refresh when needed
   */
  const router = useRouter()
  const handleLiveEvent = useEffectEvent(
    (event: LiveEventMessage | LiveEventRestart | LiveEventWelcome) => {
      if (process.env.NODE_ENV !== 'production' && event.type === 'welcome') {
        // eslint-disable-next-line no-console
        console.info(
          'Sanity is live with',
          token
            ? 'automatic revalidation for draft content changes as well as published content'
            : draftModeEnabled
              ? 'automatic revalidation for only published content. Provide a `browserToken` to `defineLive` to support draft content outside of Presentation Tool.'
              : 'automatic revalidation of published content',
        )
      } else if (event.type === 'message') {
        revalidateSyncTags(event.tags)
      } else if (event.type === 'restart') {
        router.refresh()
      }
    },
  )
  useEffect(() => {
    const subscription = client.live.events({includeDrafts: !!token, tag}).subscribe({
      next: (event) => {
        if (event.type === 'message' || event.type === 'restart' || event.type === 'welcome') {
          handleLiveEvent(event)
        }
      },
      error: (err: unknown) => {
        // console.error('What?', err)
        onError(err)
      },
    })
    return () => subscription.unsubscribe()
  }, [client.live, handleLiveEvent, onError, tag, token])

  /**
   * 2. Notify what perspective we're in, when in Draft Mode
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
   * 3. Notify what environment we're in, when in Draft Mode
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
   * 4. If Presentation Tool is detected, load up the comlink and integrate with it
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
   * 5. Warn if draft mode is being disabled
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
