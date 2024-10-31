import {
  createCompatibilityActors,
  isAltKey,
  isHotkey,
  type PreviewKitNodeMsg,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import {studioPath} from '@sanity/client/csm'
import {
  createChannelMachine,
  createController,
  type Controller,
  type Message,
} from '@sanity/comlink'
import {BoundaryElementProvider, Flex} from '@sanity/ui'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import {
  useDataset,
  usePerspective,
  useProjectId,
  type Path,
  type SanityDocument,
  type Tool,
} from 'sanity'
import {useRouter, type RouterContextValue} from 'sanity/router'
import {styled} from 'styled-components'
import {useEffectEvent} from 'use-effect-event'
import {
  COMMENTS_INSPECTOR_NAME,
  DEFAULT_TOOL_NAME,
  EDIT_INTENT_MODE,
  LIVE_DRAFT_EVENTS_ENABLED,
} from './constants'
import {useUnique, useWorkspace, type CommentIntentGetter} from './internals'
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
import type {
  FrameState,
  PresentationNavigate,
  PresentationPluginOptions,
  PresentationStateParams,
  PresentationViewport,
  StructureDocumentPaneParams,
  VisualEditingConnection,
} from './types'
import {useDocumentsOnPage} from './useDocumentsOnPage'
import {useMainDocument} from './useMainDocument'
import {useParams} from './useParams'
import {usePreviewUrl} from './usePreviewUrl'
import {useStatus} from './useStatus'

const LoaderQueries = lazy(() => import('./loader/LoaderQueries'))
const LiveQueries = lazy(() => import('./loader/LiveQueries'))
const PostMessageDocuments = lazy(() => import('./overlays/PostMessageDocuments'))
const PostMessageFeatures = lazy(() => import('./features/PostMessageFeatures'))
const PostMessageRefreshMutations = lazy(() => import('./editor/PostMessageRefreshMutations'))
const PostMessagePerspective = lazy(() => import('./PostMessagePerspective'))
const PostMessageReleases = lazy(() => import('./PostMessageReleases'))
const PostMessageDocumentVersions = lazy(() => import('./PostMessageDocumentVersions'))
const PostMessagePreviewSnapshots = lazy(() => import('./editor/PostMessagePreviewSnapshots'))
const PostMessageSchema = lazy(() => import('./overlays/schema/PostMessageSchema'))

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function PresentationTool(props: {
  tool: Tool<PresentationPluginOptions>
  canCreateUrlPreviewSecrets: boolean
  canToggleSharePreviewAccess: boolean
  canUseSharedPreviewAccess: boolean
}): ReactElement {
  const {canCreateUrlPreviewSecrets, canToggleSharePreviewAccess, canUseSharedPreviewAccess, tool} =
    props
  const components = tool.options?.components
  const _previewUrl = tool.options?.previewUrl
  const name = tool.name || DEFAULT_TOOL_NAME
  const {unstable_navigator} = components || {}

  const {navigate: routerNavigate, state: routerState} = useRouter() as RouterContextValue & {
    state: PresentationStateParams
  }
  const routerSearchParams = useUnique(Object.fromEntries(routerState._searchParams || []))

  const initialPreviewUrl = usePreviewUrl(
    _previewUrl || '/',
    name,
    routerSearchParams['perspective'] === 'published' ? 'published' : 'previewDrafts',
    routerSearchParams['preview'] || null,
    canCreateUrlPreviewSecrets,
  )
  const canSharePreviewAccess = useMemo<boolean>(() => {
    if (
      _previewUrl &&
      typeof _previewUrl === 'object' &&
      'previewMode' in _previewUrl &&
      _previewUrl.previewMode
    ) {
      return _previewUrl.previewMode.shareAccess !== false
    }
    return false
  }, [_previewUrl])

  const [devMode] = useState(() => {
    const option = tool.options?.devMode

    if (typeof option === 'function') return option()
    if (typeof option === 'boolean') return option

    return typeof window !== 'undefined' && window.location.hostname === 'localhost'
  })

  const targetOrigin = useMemo(() => {
    return initialPreviewUrl.origin
  }, [initialPreviewUrl.origin])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [controller, setController] = useState<Controller>()
  const [visualEditingComlink, setVisualEditingComlink] = useState<VisualEditingConnection | null>(
    null,
  )

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
  const {
    bundlesPerspective,
    perspective: globalPerspective = 'previewDrafts',
    excludedPerspectives,
  } = usePerspective()
  const perspective = globalPerspective.startsWith('bundle.')
    ? /**
       * Hacky fix. Response values are cached, and when adding new excluded perspectives the cache is not invalidated.
       * By this, we are making the key aware of the excluded perspectives, so it will invalidate the cache.
       * Should be ideally fixed in the cache key directly, not here.
       */
      ([globalPerspective, 'exc-', ...excludedPerspectives].join(',') as `bundle.${string}`)
    : globalPerspective

  const viewport = useMemo(() => (params.viewport ? 'mobile' : 'desktop'), [params.viewport])

  const [documentsOnPage, setDocumentsOnPage] = useDocumentsOnPage(perspective, frameStateRef)

  const projectId = useProjectId()
  const dataset = useDataset()

  const mainDocumentState = useMainDocument({
    // Prevent flash of content by using immediate navigation
    navigate: _navigate,
    navigationHistory,
    path: params.preview,
    previewUrl: tool.options?.previewUrl,
    resolvers: tool.options?.resolve?.mainDocuments,
  })

  // const [overlaysConnection, setOverlaysConnection] = useState<Status>('connecting')
  const [overlaysConnection, setOverlaysConnection] = useStatus()
  // const [loadersConnection, setLoadersConnection] = useState<Status>('connecting')
  const [loadersConnection, setLoadersConnection] = useStatus()
  // const [previewKitConnection, setPreviewKitConnection] = useState<Status>('connecting')
  const [previewKitConnection, setPreviewKitConnection] = useStatus()

  const [popups, setPopups] = useState<Set<Window>>(() => new Set())
  const handleOpenPopup = useCallback((url: string) => {
    const source = window.open(url, '_blank')
    if (source) {
      setPopups((prev) => new Set(prev).add(source))
    }
  }, [])

  useEffect(() => {
    const target = iframeRef.current?.contentWindow

    if (!target || state.iframe.status === 'loading') return

    const controller = createController({targetOrigin})
    controller.addTarget(target)
    setController(controller)

    return () => {
      controller.destroy()
      setController(undefined)
    }
  }, [targetOrigin, state.iframe.status])

  useEffect(() => {
    const unsubs: Array<() => void> = []
    if (popups.size && controller) {
      // loop popups and add targets
      for (const source of popups) {
        if (source && 'closed' in source && !source.closed) {
          unsubs.push(controller.addTarget(source))
        }
      }
    }
    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [controller, popups])

  const handleNavigate = useEffectEvent<typeof navigate>(
    (nextState, nextSearchState, forceReplace) =>
      navigate(nextState, nextSearchState, forceReplace),
  )
  useEffect(() => {
    if (!controller) return

    const comlink = controller.createConnection<VisualEditingNodeMsg, VisualEditingControllerMsg>(
      {
        name: 'presentation',
        heartbeat: true,
        connectTo: 'visual-editing',
      },
      createChannelMachine<VisualEditingNodeMsg, VisualEditingControllerMsg>().provide({
        actors: createCompatibilityActors<VisualEditingControllerMsg>(),
      }),
    )

    comlink.on('visual-editing/focus', (data) => {
      if (!('id' in data)) return
      handleNavigate({
        type: data.type,
        id: data.id,
        path: data.path,
      })
    })

    comlink.on('visual-editing/navigate', (data) => {
      const {title, url} = data
      if (frameStateRef.current.url !== url) {
        handleNavigate({}, {preview: url})
      }
      frameStateRef.current = {title, url}
    })

    comlink.on('visual-editing/meta', (data) => {
      frameStateRef.current.title = data.title
    })

    comlink.on('visual-editing/toggle', (data) => {
      dispatch({
        type: ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE,
        enabled: data.enabled,
      })
    })

    comlink.on('visual-editing/documents', (data) => {
      // update useDocumentsOnPage
      setDocumentsOnPage(
        'visual-editing',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.perspective as unknown as any,
        data.documents,
      )
    })

    comlink.on('visual-editing/refreshing', (data) => {
      if (data.source === 'manual') {
        clearTimeout(refreshRef.current)
      } else if (data.source === 'mutation') {
        dispatch({type: ACTION_IFRAME_REFRESH})
      }
    })

    comlink.on('visual-editing/refreshed', () => {
      dispatch({type: ACTION_IFRAME_LOADED})
    })

    comlink.onStatus(setOverlaysConnection)

    const stop = comlink.start()
    setVisualEditingComlink(comlink)
    return () => {
      stop()
      setVisualEditingComlink(null)
    }
  }, [controller, handleNavigate, setDocumentsOnPage, setOverlaysConnection, targetOrigin])

  useEffect(() => {
    if (!controller) return
    const comlink = controller.createConnection<PreviewKitNodeMsg, Message>(
      {
        name: 'presentation',
        connectTo: 'preview-kit',
        heartbeat: true,
      },
      createChannelMachine<PreviewKitNodeMsg, Message>().provide({
        actors: createCompatibilityActors(),
      }),
    )

    comlink.onStatus(setPreviewKitConnection)

    comlink.on('preview-kit/documents', (data) => {
      if (data.projectId === projectId && data.dataset === dataset) {
        setDocumentsOnPage(
          'preview-kit',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.perspective as unknown as any,
          data.documents,
        )
      }
    })

    return comlink.start()
  }, [controller, dataset, projectId, setDocumentsOnPage, setPreviewKitConnection, targetOrigin])

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

  // Dispatch a focus or blur message when the id or path change
  useEffect(() => {
    if (params.id && params.path) {
      visualEditingComlink?.post({
        type: 'presentation/focus',
        data: {id: params.id, path: params.path},
      })
    } else {
      visualEditingComlink?.post({type: 'presentation/blur', data: undefined})
    }
  }, [params.id, params.path, visualEditingComlink])

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
        visualEditingComlink?.post({
          type: 'presentation/navigate',
          data: {
            url: params.preview,
            type: 'replace',
          },
        })
      }
    }
  }, [overlaysConnection, targetOrigin, params.preview, visualEditingComlink])

  const toggleOverlay = useCallback(
    () => visualEditingComlink?.post({type: 'presentation/toggle-overlay', data: undefined}),
    [visualEditingComlink],
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

  const refreshRef = useRef<number>()
  const handleRefresh = useCallback(
    (fallback: () => void) => {
      dispatch({type: ACTION_IFRAME_REFRESH})
      if (visualEditingComlink) {
        // We only wait 300ms for the iframe to ack the refresh request before running the fallback logic
        refreshRef.current = window.setTimeout(fallback, 300)
        visualEditingComlink.post({
          type: 'presentation/refresh',
          data: {
            source: 'manual',
            livePreviewEnabled:
              previewKitConnection === 'connected' || loadersConnection === 'connected',
          },
        })
        return
      }
      fallback()
    },
    [loadersConnection, previewKitConnection, visualEditingComlink],
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
                        canSharePreviewAccess={canSharePreviewAccess}
                        canToggleSharePreviewAccess={canToggleSharePreviewAccess}
                        canUseSharedPreviewAccess={canUseSharedPreviewAccess}
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
      {controller && (
        <Suspense>
          {LIVE_DRAFT_EVENTS_ENABLED ? (
            <LiveQueries
              controller={controller}
              perspective={perspective}
              bundlesPerspective={bundlesPerspective}
              liveDocument={displayedDocument}
              onDocumentsOnPage={setDocumentsOnPage}
              onLoadersConnection={setLoadersConnection}
            />
          ) : (
            <LoaderQueries
              controller={controller}
              perspective={perspective}
              bundlesPerspective={bundlesPerspective}
              liveDocument={displayedDocument}
              onDocumentsOnPage={setDocumentsOnPage}
              onLoadersConnection={setLoadersConnection}
              documentsOnPage={documentsOnPage}
            />
          )}
        </Suspense>
      )}
      {visualEditingComlink && params.id && params.type && (
        <Suspense>
          <PostMessageRefreshMutations
            comlink={visualEditingComlink}
            id={params.id}
            type={params.type}
            loadersConnection={loadersConnection}
            previewKitConnection={previewKitConnection}
          />
        </Suspense>
      )}
      {visualEditingComlink && (
        <Suspense>
          <PostMessageSchema
            comlink={visualEditingComlink}
            perspective={perspective}
            bundlesPerspective={bundlesPerspective}
          />
        </Suspense>
      )}
      {visualEditingComlink && documentsOnPage.length > 0 && (
        <Suspense>
          <PostMessagePreviewSnapshots
            comlink={visualEditingComlink}
            perspective={perspective}
            bundlesPerspective={bundlesPerspective}
            refs={documentsOnPage}
          />
        </Suspense>
      )}
      {visualEditingComlink && (
        <Suspense>
          <PostMessageDocuments comlink={visualEditingComlink} />
        </Suspense>
      )}
      {visualEditingComlink && (
        <Suspense>
          <PostMessageFeatures comlink={visualEditingComlink} />
        </Suspense>
      )}
      {visualEditingComlink && (
        <Suspense>
          <PostMessageReleases
            comlink={visualEditingComlink}
            perspective={perspective}
            bundlesPerspective={bundlesPerspective}
          />
        </Suspense>
      )}
      {visualEditingComlink && (
        <Suspense>
          <PostMessageDocumentVersions
            comlink={visualEditingComlink}
            perspective={perspective}
            bundlesPerspective={bundlesPerspective}
          />
        </Suspense>
      )}
      {visualEditingComlink && (
        <Suspense>
          <PostMessagePerspective
            comlink={visualEditingComlink}
            perspective={perspective}
            bundlesPerspective={bundlesPerspective}
          />
        </Suspense>
      )}
    </>
  )
}
