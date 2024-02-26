import {
  type ChannelsController,
  type ChannelStatus,
  createChannelsController,
} from '@sanity/channels'
import { studioPath } from '@sanity/client/csm'
import { BoundaryElementProvider, Flex } from '@sanity/ui'
import {
  getQueryCacheKey,
  isAltKey,
  isHotkey,
  type LoaderMsg,
  type OverlayMsg,
  type PresentationMsg,
  type PreviewKitMsg,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import {
  lazy,
  type ReactElement,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useUnique, useWorkspace } from 'sanity'
import {
  type Path,
  type SanityDocument,
  type Tool,
  useDataset,
  useProjectId,
} from 'sanity'
import { RouterContextValue, useRouter } from 'sanity/router'
import {
  type CommentIntentGetter,
  CommentsIntentProvider,
} from 'sanity/structure'
import styled from 'styled-components'

import {
  COMMENTS_INSPECTOR_NAME,
  DEFAULT_TOOL_NAME,
  EDIT_INTENT_MODE,
  MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL,
} from './constants'
import { ContentEditor } from './editor/ContentEditor'
import { DisplayedDocumentBroadcasterProvider } from './loader/DisplayedDocumentBroadcaster'
import { Panel } from './panels/Panel'
import { PanelResizer } from './panels/PanelResizer'
import { Panels } from './panels/Panels'
import { PresentationNavigateProvider } from './PresentationNavigateProvider'
import { usePresentationNavigator } from './PresentationNavigator'
import { PresentationParamsProvider } from './PresentationParamsProvider'
import { PresentationProvider } from './PresentationProvider'
import { PreviewFrame } from './preview/PreviewFrame'
import {
  ACTION_IFRAME_LOADED,
  ACTION_IFRAME_REFRESH,
  ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE,
  presentationReducer,
  presentationReducerInit,
} from './reducers/presentationReducer'
import type {
  DeskDocumentPaneParams,
  FrameState,
  LiveQueriesState,
  LiveQueriesStateValue,
  PresentationPluginOptions,
  PresentationStateParams,
} from './types'
import { useDocumentsOnPage } from './useDocumentsOnPage'
import { useParams } from './useParams'
import { usePreviewUrl } from './usePreviewUrl'

const LoaderQueries = lazy(() => import('./loader/LoaderQueries'))
const PostMessageRefreshMutations = lazy(
  () => import('./editor/PostMessageRefreshMutations'),
)

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function PresentationTool(props: {
  tool: Tool<PresentationPluginOptions>
}): ReactElement {
  const { previewUrl: _previewUrl, components } = props.tool.options ?? {}
  const name = props.tool.name || DEFAULT_TOOL_NAME
  const { unstable_navigator } = components || {}

  const { navigate: routerNavigate, state: routerState } =
    useRouter() as RouterContextValue & { state: PresentationStateParams }
  const routerSearchParams = useUnique(
    Object.fromEntries(routerState._searchParams || []),
  )

  const initialPreviewUrl = usePreviewUrl(
    _previewUrl || '/',
    name,
    routerSearchParams.preview || null,
  )

  const [devMode] = useState(() => {
    const option = props.tool.options?.devMode

    if (typeof option === 'function') return option()
    if (typeof option === 'boolean') return option

    return (
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
    )
  })

  const targetOrigin = useMemo(() => {
    return initialPreviewUrl.origin
  }, [initialPreviewUrl.origin])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [channel, setChannel] =
    useState<ChannelsController<LoaderMsg | PresentationMsg>>()

  const [liveQueries, setLiveQueries] = useState<LiveQueriesState>({})

  const frameStateRef = useRef<FrameState>({
    title: undefined,
    url: undefined,
  })

  const { params, deskParams, navigate } = useParams({
    initialPreviewUrl,
    routerNavigate,
    routerState,
    routerSearchParams,
    frameStateRef,
  })

  const [state, dispatch] = useReducer(
    presentationReducer,
    { perspective: params.perspective, viewport: params.viewport },
    presentationReducerInit,
  )

  const [documentsOnPage, setDocumentsOnPage] = useDocumentsOnPage(
    state.perspective,
    frameStateRef,
  )

  const projectId = useProjectId()
  const dataset = useDataset()

  // Update the perspective and viewport when the param changes
  useEffect(() => {
    if (
      state.perspective !== params.perspective ||
      state.viewport !== params.viewport
    ) {
      navigate(
        {},
        {
          perspective:
            state.perspective === 'previewDrafts'
              ? undefined
              : state.perspective,
          viewport: state.viewport === 'desktop' ? undefined : state.viewport,
        },
      )
    }
  }, [
    params.perspective,
    state.perspective,
    navigate,
    state.viewport,
    params.viewport,
  ])

  const [overlaysConnection, setOverlaysConnection] =
    useState<ChannelStatus>('connecting')
  const [loadersConnection, setLoadersConnection] =
    useState<ChannelStatus>('connecting')
  const [previewKitConnection, setPreviewKitConnection] =
    useState<ChannelStatus>('connecting')

  const [popups] = useState<Set<Window>>(() => new Set())
  const handleOpenPopup = useCallback(
    (url: string) => {
      const source = window.open(url, '_blank')
      if (source) {
        popups.add(source)
      }
    },
    [popups],
  )

  useEffect(() => {
    if (popups.size && channel) {
      // loop popups and call channel.addSource
      for (const source of popups) {
        if (source && 'closed' in source && !source.closed) {
          channel.addSource(source)
        }
      }
    }
  }, [channel, popups, popups.size])

  useEffect(() => {
    const target = iframeRef.current?.contentWindow

    if (!target) return

    const nextChannel = createChannelsController<
      PresentationMsg,
      LoaderMsg | OverlayMsg | VisualEditingMsg | PreviewKitMsg
    >({
      id: 'presentation' satisfies VisualEditingConnectionIds,
      target,
      targetOrigin,
      connectTo: [
        {
          id: 'overlays' satisfies VisualEditingConnectionIds,
          heartbeat: true,
          onStatusUpdate: setOverlaysConnection,
          onEvent(type, data) {
            if (
              (type === 'visual-editing/focus' || type === 'overlay/focus') &&
              'id' in data
            ) {
              navigate({
                type: data.type,
                id: data.id,
                path: data.path,
              })
            } else if (
              type === 'visual-editing/navigate' ||
              type === 'overlay/navigate'
            ) {
              const { title, url } = data
              if (frameStateRef.current.url !== url) {
                navigate({}, { preview: url })
              }
              frameStateRef.current = { title, url }
            } else if (type === 'visual-editing/meta') {
              frameStateRef.current.title = data.title
            } else if (
              type === 'visual-editing/toggle' ||
              type === 'overlay/toggle'
            ) {
              dispatch({
                type: ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE,
                enabled: data.enabled,
              })
            } else if (type === 'visual-editing/documents') {
              setDocumentsOnPage(
                'visual-editing',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.perspective as unknown as any,
                data.documents,
              )
            } else if (
              type === 'visual-editing/refreshing' &&
              data.source === 'manual'
            ) {
              clearTimeout(refreshRef.current)
            } else if (
              type === 'visual-editing/refreshing' &&
              data.source === 'mutation'
            ) {
              dispatch({ type: ACTION_IFRAME_REFRESH })
            } else if (type === 'visual-editing/refreshed') {
              dispatch({ type: ACTION_IFRAME_LOADED })
            }
          },
        },
        {
          id: 'loaders' satisfies VisualEditingConnectionIds,
          heartbeat: true,
          onStatusUpdate: setLoadersConnection,
          onEvent(type, data) {
            if (
              type === 'loader/documents' &&
              data.projectId === projectId &&
              data.dataset === dataset
            ) {
              setDocumentsOnPage(
                'loaders',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.perspective as unknown as any,
                data.documents,
              )
            } else if (
              type === 'loader/query-listen' &&
              data.projectId === projectId &&
              data.dataset === dataset
            ) {
              if (
                typeof data.heartbeat === 'number' &&
                data.heartbeat < MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL
              ) {
                throw new Error(
                  `Loader query listen heartbeat interval must be at least ${MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL}ms`,
                )
              }
              setLiveQueries((prev) => ({
                ...prev,
                [getQueryCacheKey(data.query, data.params)]: {
                  perspective: data.perspective,
                  query: data.query,
                  params: data.params,
                  receivedAt: Date.now(),
                  heartbeat: data.heartbeat ?? false,
                } satisfies LiveQueriesStateValue,
              }))
            }
          },
        },
        {
          id: 'preview-kit' satisfies VisualEditingConnectionIds,
          heartbeat: true,
          onStatusUpdate: setPreviewKitConnection,
          onEvent(type, data) {
            if (
              type === 'preview-kit/documents' &&
              data.projectId === projectId &&
              data.dataset === dataset
            ) {
              setDocumentsOnPage(
                'preview-kit',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.perspective as unknown as any,
                data.documents,
              )
            }
          },
        },
      ],
    })
    setChannel(nextChannel)

    return () => {
      nextChannel.destroy()
      setChannel(undefined)
    }
  }, [dataset, projectId, setDocumentsOnPage, navigate, targetOrigin])

  useEffect(() => {
    const interval = setInterval(
      () =>
        startTransition(() =>
          setLiveQueries((liveQueries) => {
            if (Object.keys(liveQueries).length < 1) {
              return liveQueries
            }

            const now = Date.now()
            const hasAnyExpired = Object.values(liveQueries).some(
              (liveQuery) =>
                liveQuery.heartbeat !== false &&
                now > liveQuery.receivedAt + liveQuery.heartbeat,
            )
            if (!hasAnyExpired) {
              return liveQueries
            }
            const next = {} as LiveQueriesState
            for (const [key, value] of Object.entries(liveQueries)) {
              if (
                value.heartbeat !== false &&
                now > value.receivedAt + value.heartbeat
              ) {
                continue
              }
              next[key] = value
            }
            return next
          }),
        ),
      MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL,
    )
    return () => clearInterval(interval)
  }, [])

  const handleFocusPath = useCallback(
    (nextPath: Path) => {
      // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
      navigate({ path: studioPath.toString(nextPath) }, {}, true)
    },
    [navigate],
  )

  const handlePreviewPath = useCallback(
    (nextPath: string) => {
      const url = new URL(nextPath, initialPreviewUrl.origin)
      const preview = url.pathname + url.search
      if (
        url.origin === initialPreviewUrl.origin &&
        preview !== params.preview
      ) {
        navigate({}, { preview })
      }
    },
    [initialPreviewUrl, params, navigate],
  )

  const handleDeskParams = useCallback(
    (deskParams: DeskDocumentPaneParams) => {
      navigate({}, deskParams)
    },
    [navigate],
  )

  // Dispatch a perspective message when the perspective changes
  useEffect(() => {
    channel?.send('overlays', 'presentation/perspective', {
      perspective: state.perspective,
    })
  }, [channel, state.perspective])

  // Dispatch a focus or blur message when the id or path change
  useEffect(() => {
    if (params.id && params.path) {
      channel?.send('overlays', 'presentation/focus', {
        id: params.id,
        path: params.path,
      })
    } else {
      channel?.send('overlays', 'presentation/blur', undefined)
    }
  }, [channel, params.id, params.path])

  // Dispatch a navigation message when the preview param changes
  useEffect(() => {
    if (
      frameStateRef.current.url &&
      params.preview &&
      frameStateRef.current.url !== params.preview
    ) {
      frameStateRef.current.url = params.preview
      if (overlaysConnection !== 'connected' && iframeRef.current) {
        iframeRef.current.src = `${targetOrigin}${params.preview}`
      } else {
        channel?.send('overlays', 'presentation/navigate', {
          url: params.preview,
          type: 'replace',
        })
      }
    }
  }, [channel, overlaysConnection, targetOrigin, params.preview])

  const toggleOverlay = useCallback(
    () => channel?.send('overlays', 'presentation/toggleOverlay', undefined),
    [channel],
  )

  const [displayedDocument, setDisplayedDocument] = useState<
    Partial<SanityDocument> | null | undefined
  >(null)

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isAltKey(e)) {
        toggleOverlay()
      }
    }
    const handleKeydown = (e: KeyboardEvent) => {
      if (isAltKey(e)) {
        toggleOverlay()
      }

      if (isHotkey(['mod', '\\'], e)) {
        toggleOverlay()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [toggleOverlay])

  const [boundaryElement, setBoundaryElement] = useState<HTMLDivElement | null>(
    null,
  )

  const [{ navigatorEnabled, toggleNavigator }, PresentationNavigator] =
    usePresentationNavigator({ unstable_navigator })

  // Handle edge case where the `&rev=` parameter gets "stuck"
  const idRef = useRef<string | undefined>(params.id)
  useEffect(() => {
    if (params.rev && idRef.current && params.id !== idRef.current) {
      navigate({}, { rev: undefined })
    }
    idRef.current = params.id
  })

  const refreshRef = useRef<number>()
  const handleRefresh = useCallback(
    (fallback: () => void) => {
      dispatch({ type: ACTION_IFRAME_REFRESH })
      if (channel) {
        // We only wait 300ms for the iframe to ack the refresh request before running the fallback logic
        refreshRef.current = window.setTimeout(fallback, 300)
        channel.send('overlays', 'presentation/refresh', {
          source: 'manual',
          livePreviewEnabled:
            previewKitConnection === 'connected' ||
            loadersConnection === 'connected',
        })
        return
      }
      fallback()
    },
    [channel, loadersConnection, previewKitConnection],
  )

  const workspace = useWorkspace()

  const getCommentIntent = useCallback<CommentIntentGetter>(
    ({ id, type, path }) => {
      if (frameStateRef.current.url) {
        return {
          title: frameStateRef.current.title || frameStateRef.current.url,
          name: 'edit',
          params: {
            id,
            path,
            type,
            inspect: COMMENTS_INSPECTOR_NAME,
            workspace: workspace.name,
            mode: EDIT_INTENT_MODE,
            preview: params.preview,
          },
        }
      }
      return undefined
    },
    [params.preview, workspace.name],
  )

  return (
    <>
      <PresentationProvider
        deskParams={deskParams}
        devMode={devMode}
        name={name}
        params={params}
        navigate={navigate}
      >
        <PresentationNavigateProvider navigate={navigate}>
          <PresentationParamsProvider params={params}>
            <Container height="fill">
              <Panels>
                <PresentationNavigator />
                <Panel
                  id="preview"
                  minWidth={325}
                  defaultSize={navigatorEnabled ? 50 : 75}
                  order={3}
                >
                  <Flex
                    direction="column"
                    flex={1}
                    height="fill"
                    ref={setBoundaryElement}
                  >
                    <BoundaryElementProvider element={boundaryElement}>
                      <PreviewFrame
                        dispatch={dispatch}
                        iframe={state.iframe}
                        initialUrl={initialPreviewUrl}
                        loadersConnection={loadersConnection}
                        navigatorEnabled={navigatorEnabled}
                        onPathChange={handlePreviewPath}
                        onRefresh={handleRefresh}
                        openPopup={handleOpenPopup}
                        overlaysConnection={overlaysConnection}
                        params={params}
                        perspective={state.perspective}
                        ref={iframeRef}
                        targetOrigin={targetOrigin}
                        toggleNavigator={toggleNavigator}
                        toggleOverlay={toggleOverlay}
                        viewport={state.viewport}
                        visualEditing={state.visualEditing}
                      />
                    </BoundaryElementProvider>
                  </Flex>
                </Panel>
                <PanelResizer order={4} />
                <Panel id="content" minWidth={325} order={5}>
                  <DisplayedDocumentBroadcasterProvider
                    documentId={params.id}
                    setDisplayedDocument={setDisplayedDocument}
                  >
                    <CommentsIntentProvider getIntent={getCommentIntent}>
                      <ContentEditor
                        refs={documentsOnPage}
                        deskParams={deskParams}
                        documentId={params.id}
                        documentType={params.type}
                        onDeskParams={handleDeskParams}
                        onFocusPath={handleFocusPath}
                        previewUrl={params.preview}
                      />
                    </CommentsIntentProvider>
                  </DisplayedDocumentBroadcasterProvider>
                </Panel>
              </Panels>
            </Container>
          </PresentationParamsProvider>
        </PresentationNavigateProvider>
      </PresentationProvider>
      {channel && (
        <Suspense>
          <LoaderQueries
            channel={channel}
            liveQueries={liveQueries}
            perspective={state.perspective}
            liveDocument={displayedDocument}
            documentsOnPage={documentsOnPage}
          />
        </Suspense>
      )}
      {channel && params.id && params.type && (
        <Suspense>
          <PostMessageRefreshMutations
            channel={channel}
            id={params.id}
            type={params.type}
            loadersConnection={loadersConnection}
            previewKitConnection={previewKitConnection}
          />
        </Suspense>
      )}
    </>
  )
}
