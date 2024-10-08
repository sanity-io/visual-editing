import {type ChannelsController, type ChannelStatus, createChannelsController} from '@repo/channels'
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
} from '@repo/visual-editing-helpers'
import {studioPath} from '@sanity/client/csm'
import {BoundaryElementProvider, Flex} from '@sanity/ui'
import {
  lazy,
  type ReactElement,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import {type Path, type SanityDocument, type Tool, useDataset, useProjectId} from 'sanity'
import {type RouterContextValue, useRouter} from 'sanity/router'
import {styled} from 'styled-components'

import {
  COMMENTS_INSPECTOR_NAME,
  DEFAULT_TOOL_NAME,
  EDIT_INTENT_MODE,
  MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL,
} from './constants'
import {type CommentIntentGetter, useUnique, useWorkspace} from './internals'
import {debounce} from './lib/debounce'
import {Panel} from './panels/Panel'
import {Panels} from './panels/Panels'
import {PresentationContent} from './PresentationContent'
import {PresentationNavigateProvider} from './PresentationNavigateProvider'
import {usePresentationNavigator} from './PresentationNavigator'
import {PresentationParamsProvider} from './PresentationParamsProvider'
import {PresentationProvider} from './PresentationProvider'
import {PreviewFrame} from './preview/PreviewFrame'
import {
  ACTION_IFRAME_LOADED,
  ACTION_IFRAME_REFRESH,
  ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE,
  presentationReducer,
  presentationReducerInit,
} from './reducers/presentationReducer'
import {RevisionSwitcher} from './RevisionSwitcher'
import type {
  FrameState,
  LiveQueriesState,
  LiveQueriesStateValue,
  PresentationNavigate,
  PresentationPerspective,
  PresentationPluginOptions,
  PresentationStateParams,
  PresentationViewport,
  StructureDocumentPaneParams,
} from './types'
import {useDocumentsOnPage} from './useDocumentsOnPage'
import {useMainDocument} from './useMainDocument'
import {useParams} from './useParams'
import {usePreviewUrl} from './usePreviewUrl'

const LoaderQueries = lazy(() => import('./loader/LoaderQueries'))
const PostMessageRefreshMutations = lazy(() => import('./editor/PostMessageRefreshMutations'))

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function PresentationTool(props: {
  tool: Tool<PresentationPluginOptions>
}): ReactElement {
  const {previewUrl: _previewUrl, components} = props.tool.options ?? {}
  const name = props.tool.name || DEFAULT_TOOL_NAME
  const {unstable_navigator} = components || {}

  const {navigate: routerNavigate, state: routerState} = useRouter() as RouterContextValue & {
    state: PresentationStateParams
  }
  const routerSearchParams = useUnique(Object.fromEntries(routerState._searchParams || []))

  const initialPreviewUrl = usePreviewUrl(
    _previewUrl || '/',
    name,
    routerSearchParams['preview'] || null,
  )

  const [devMode] = useState(() => {
    const option = props.tool.options?.devMode

    if (typeof option === 'function') return option()
    if (typeof option === 'boolean') return option

    return typeof window !== 'undefined' && window.location.hostname === 'localhost'
  })

  const targetOrigin = useMemo(() => {
    return initialPreviewUrl.origin
  }, [initialPreviewUrl.origin])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [channel, setChannel] =
    useState<ChannelsController<VisualEditingConnectionIds, PresentationMsg | LoaderMsg>>()

  const [liveQueries, setLiveQueries] = useState<LiveQueriesState>({})

  const frameStateRef = useRef<FrameState>({
    title: undefined,
    url: undefined,
  })

  const {
    navigate: _navigate,
    navigationHistory,
    params,
    searchParams,
    structureParams,
  } = useParams({
    initialPreviewUrl,
    routerNavigate,
    routerState,
    routerSearchParams,
    frameStateRef,
  })

  // Most navigation events should be debounced, so use this unless explicitly needed
  const navigate = useMemo(() => debounce<PresentationNavigate>(_navigate, 50), [_navigate])

  const [state, dispatch] = useReducer(presentationReducer, {}, presentationReducerInit)

  const perspective = useMemo(
    () => (params.perspective ? 'published' : 'previewDrafts'),
    [params.perspective],
  )

  const viewport = useMemo(() => (params.viewport ? 'mobile' : 'desktop'), [params.viewport])

  const [documentsOnPage, setDocumentsOnPage] = useDocumentsOnPage(perspective, frameStateRef)

  const projectId = useProjectId()
  const dataset = useDataset()

  const mainDocumentState = useMainDocument({
    // Prevent flash of content by using immediate navigation
    navigate: _navigate,
    navigationHistory,
    path: params.preview,
    previewUrl: props.tool.options?.previewUrl,
    resolvers: props.tool.options?.resolve?.mainDocuments,
  })

  const [overlaysConnection, setOverlaysConnection] = useState<ChannelStatus>('connecting')
  const [loadersConnection, setLoadersConnection] = useState<ChannelStatus>('connecting')
  const [previewKitConnection, setPreviewKitConnection] = useState<ChannelStatus>('connecting')

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
      VisualEditingConnectionIds,
      PresentationMsg | LoaderMsg,
      LoaderMsg | OverlayMsg | VisualEditingMsg | PreviewKitMsg
    >({
      id: 'presentation',
      target,
      targetOrigin,
      connectTo: [
        {
          id: 'overlays',
          heartbeat: true,
          onStatusUpdate: setOverlaysConnection,
          onEvent(type, data) {
            if ((type === 'visual-editing/focus' || type === 'overlay/focus') && 'id' in data) {
              navigate({
                type: data.type,
                id: data.id,
                path: data.path,
              })
            } else if (type === 'visual-editing/navigate' || type === 'overlay/navigate') {
              const {title, url} = data
              if (frameStateRef.current.url !== url) {
                navigate({}, {preview: url})
              }
              frameStateRef.current = {title, url}
            } else if (type === 'visual-editing/meta') {
              frameStateRef.current.title = data.title
            } else if (type === 'visual-editing/toggle' || type === 'overlay/toggle') {
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
            } else if (type === 'visual-editing/refreshing' && data.source === 'manual') {
              clearTimeout(refreshRef.current)
            } else if (type === 'visual-editing/refreshing' && data.source === 'mutation') {
              dispatch({type: ACTION_IFRAME_REFRESH})
            } else if (type === 'visual-editing/refreshed') {
              dispatch({type: ACTION_IFRAME_LOADED})
            }
          },
        },
        {
          id: 'loaders',
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
          id: 'preview-kit',
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
        setLiveQueries((liveQueries) => {
          if (Object.keys(liveQueries).length < 1) {
            return liveQueries
          }

          const now = Date.now()
          const hasAnyExpired = Object.values(liveQueries).some(
            (liveQuery) =>
              liveQuery.heartbeat !== false && now > liveQuery.receivedAt + liveQuery.heartbeat,
          )
          if (!hasAnyExpired) {
            return liveQueries
          }
          const next = {} as LiveQueriesState
          for (const [key, value] of Object.entries(liveQueries)) {
            if (value.heartbeat !== false && now > value.receivedAt + value.heartbeat) {
              continue
            }
            next[key] = value
          }
          return next
        }),
      MIN_LOADER_QUERY_LISTEN_HEARTBEAT_INTERVAL,
    )
    return () => clearInterval(interval)
  }, [])

  const handleFocusPath = useCallback(
    (nextPath: Path) => {
      // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
      navigate({path: studioPath.toString(nextPath)}, {}, true)
    },
    [navigate],
  )

  const handlePreviewPath = useCallback(
    (nextPath: string) => {
      const url = new URL(nextPath, initialPreviewUrl.origin)
      const preview = url.pathname + url.search
      if (url.origin === initialPreviewUrl.origin && preview !== params.preview) {
        navigate({}, {preview})
      }
    },
    [initialPreviewUrl, params, navigate],
  )

  const handleStructureParams = useCallback(
    (structureParams: StructureDocumentPaneParams) => {
      navigate({}, structureParams)
    },
    [navigate],
  )

  // Dispatch a perspective message when the perspective changes
  useEffect(() => {
    channel?.send('overlays', 'presentation/perspective', {
      perspective: perspective,
    })
  }, [channel, perspective])

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

  const [boundaryElement, setBoundaryElement] = useState<HTMLDivElement | null>(null)

  const [{navigatorEnabled, toggleNavigator}, PresentationNavigator] = usePresentationNavigator({
    unstable_navigator,
  })

  // Handle edge case where the `&rev=` parameter gets "stuck"
  const idRef = useRef<string | undefined>(params.id)
  useEffect(() => {
    if (params.rev && idRef.current && params.id !== idRef.current) {
      navigate({}, {rev: undefined})
    }
    idRef.current = params.id
  })

  const refreshRef = useRef<number>()
  const handleRefresh = useCallback(
    (fallback: () => void) => {
      dispatch({type: ACTION_IFRAME_REFRESH})
      if (channel) {
        // We only wait 300ms for the iframe to ack the refresh request before running the fallback logic
        refreshRef.current = window.setTimeout(fallback, 300)
        channel.send('overlays', 'presentation/refresh', {
          source: 'manual',
          livePreviewEnabled:
            previewKitConnection === 'connected' || loadersConnection === 'connected',
        })
        return
      }
      fallback()
    },
    [channel, loadersConnection, previewKitConnection],
  )

  const workspace = useWorkspace()

  const getCommentIntent = useCallback<CommentIntentGetter>(
    ({id, type, path}) => {
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

  const setViewport = useCallback(
    (next: PresentationViewport) => {
      // Omit the viewport URL search param if the next viewport state is the
      // default: 'desktop'
      const viewport = next === 'desktop' ? undefined : 'mobile'
      navigate({}, {viewport}, true)
    },
    [navigate],
  )

  const setPerspective = useCallback(
    (next: PresentationPerspective) => {
      // Omit the perspective URL search param if the next perspective state is
      // the default: 'previewDrafts'
      const perspective = next === 'previewDrafts' ? undefined : next
      navigate({}, {perspective})
    },
    [navigate],
  )

  return (
    <>
      <PresentationProvider
        devMode={devMode}
        name={name}
        navigate={navigate}
        params={params}
        searchParams={searchParams}
        structureParams={structureParams}
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
                  <Flex direction="column" flex={1} height="fill" ref={setBoundaryElement}>
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
                        previewUrl={params.preview}
                        perspective={perspective}
                        ref={iframeRef}
                        setPerspective={setPerspective}
                        setViewport={setViewport}
                        targetOrigin={targetOrigin}
                        toggleNavigator={toggleNavigator}
                        toggleOverlay={toggleOverlay}
                        viewport={viewport}
                        visualEditing={state.visualEditing}
                      />
                    </BoundaryElementProvider>
                  </Flex>
                </Panel>
                <PresentationContent
                  documentId={params.id}
                  documentsOnPage={documentsOnPage}
                  documentType={params.type}
                  getCommentIntent={getCommentIntent}
                  mainDocumentState={mainDocumentState}
                  onFocusPath={handleFocusPath}
                  onStructureParams={handleStructureParams}
                  searchParams={searchParams}
                  setDisplayedDocument={setDisplayedDocument}
                  structureParams={structureParams}
                />
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
            perspective={perspective}
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
      {params.id && params.type && (
        <RevisionSwitcher
          documentId={params.id}
          documentRevision={params.rev}
          documentType={params.type}
          navigate={navigate}
          perspective={perspective}
        />
      )}
    </>
  )
}
