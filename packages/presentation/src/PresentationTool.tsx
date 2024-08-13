import {ChannelsChannel, ChannelsController, type ChannelStatus} from '@repo/channels'
import {isAltKey, isHotkey, type PresentationAPI} from '@repo/visual-editing-helpers'
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
import {
  type Path,
  type SanityDocument,
  type Tool,
  useClient,
  useDataset,
  useDocumentStore,
  useProjectId,
} from 'sanity'
import {type RouterContextValue, useRouter} from 'sanity/router'
import {styled} from 'styled-components'

import {
  API_VERSION,
  COMMENTS_INSPECTOR_NAME,
  DEFAULT_TOOL_NAME,
  EDIT_INTENT_MODE,
} from './constants'
import {type CommentIntentGetter, useUnique, useWorkspace} from './internals'
import {debounce} from './lib/debounce'
import PostMessageDocuments from './overlays/PostMessageDocuments'
import PostMessageSchemaUnionTypes from './overlays/PostMessageSchemaUnionTypes'
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
const PostMessageSchema = lazy(() => import('./overlays/PostMessageSchema'))
const PostMessagePreviews = lazy(() => import('./overlays/PostMessagePreviews'))

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

  const [controller, setController] = useState<ChannelsController<PresentationAPI>>()
  const [visualEditingChannel, setVisualEditingChannel] =
    useState<ChannelsChannel<PresentationAPI, 'visual-editing'>>()

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
    if (popups.size && controller) {
      // loop popups and call channel.addSource
      for (const source of popups) {
        if (source && 'closed' in source && !source.closed) {
          controller.addSource(source)
        }
      }
    }
  }, [controller, popups, popups.size])

  const client = useClient({apiVersion: API_VERSION})

  const documentStore = useDocumentStore()

  useEffect(() => {
    const target = iframeRef.current?.contentWindow

    if (!target) return

    const controller = new ChannelsController<PresentationAPI>({
      id: 'presentation',
      targetOrigin,
    })

    controller.addSource(target)

    const {channel: visualEditingChannel} = controller.createChannel({
      id: 'visual-editing',
      heartbeat: true,
    })

    visualEditingChannel.on('focus', (data) => {
      if (!('id' in data)) return
      navigate({
        type: data.type,
        id: data.id,
        path: data.path,
      })
    })

    visualEditingChannel.on('navigate', (data) => {
      const {title, url} = data
      if (frameStateRef.current.url !== url) {
        navigate({}, {preview: url})
      }
      frameStateRef.current = {title, url}
    })

    visualEditingChannel.on('meta', (data) => {
      frameStateRef.current.title = data.title
    })

    visualEditingChannel.on('toggle', (data) => {
      dispatch({
        type: ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE,
        enabled: data.enabled,
      })
    })

    visualEditingChannel.on('documents', (data) => {
      setDocumentsOnPage(
        'visual-editing',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.perspective as unknown as any,
        data.documents,
      )
    })

    visualEditingChannel.on('refreshing', (data) => {
      if (data.source === 'manual') {
        clearTimeout(refreshRef.current)
      } else if (data.source === 'mutation') {
        dispatch({type: ACTION_IFRAME_REFRESH})
      }
    })

    visualEditingChannel.on('refreshed', () => {
      dispatch({type: ACTION_IFRAME_LOADED})
    })

    visualEditingChannel.onStatus(setOverlaysConnection)

    const {channel: previewKitChannel} = controller.createChannel({
      id: 'preview-kit',
      heartbeat: true,
    })

    previewKitChannel.onStatus(setPreviewKitConnection)
    previewKitChannel.on('documents', (data) => {
      if (data.projectId === projectId && data.dataset === dataset) {
        setDocumentsOnPage(
          'preview-kit',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.perspective as unknown as any,
          data.documents,
        )
      }
    })

    setController(controller)
    setVisualEditingChannel(visualEditingChannel)

    return () => {
      controller.destroy()
      setController(undefined)
      setVisualEditingChannel(undefined)
    }
  }, [client, documentStore.pair, dataset, projectId, setDocumentsOnPage, navigate, targetOrigin])

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
    visualEditingChannel?.post('perspective', {perspective})
  }, [visualEditingChannel, perspective])

  // Dispatch a focus or blur message when the id or path change
  useEffect(() => {
    if (params.id && params.path) {
      visualEditingChannel?.post('focus', {id: params.id, path: params.path})
    } else {
      visualEditingChannel?.post('blur', undefined)
    }
  }, [visualEditingChannel, params.id, params.path])

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
        visualEditingChannel?.post('navigate', {url: params.preview, type: 'replace'})
      }
    }
  }, [visualEditingChannel, overlaysConnection, targetOrigin, params.preview])

  const toggleOverlay = useCallback(() => {
    visualEditingChannel?.post('toggleOverlay', undefined)
  }, [visualEditingChannel])

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
      if (visualEditingChannel) {
        // We only wait 300ms for the iframe to ack the refresh request before running the fallback logic
        refreshRef.current = window.setTimeout(fallback, 300)
        visualEditingChannel.post('refresh', {
          source: 'manual',
          livePreviewEnabled:
            previewKitConnection === 'connected' || loadersConnection === 'connected',
        })
        return
      }
      fallback()
    },
    [visualEditingChannel, loadersConnection, previewKitConnection],
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
      {controller && (
        <Suspense>
          <LoaderQueries
            controller={controller}
            documentsOnPage={documentsOnPage}
            liveDocument={displayedDocument}
            onDocumentsOnPage={setDocumentsOnPage}
            onLoadersConnection={setLoadersConnection}
            perspective={perspective}
          />
        </Suspense>
      )}
      {visualEditingChannel && params.id && params.type && (
        <Suspense>
          <PostMessageRefreshMutations
            channel={visualEditingChannel}
            id={params.id}
            type={params.type}
            loadersConnection={loadersConnection}
            previewKitConnection={previewKitConnection}
          />
        </Suspense>
      )}
      {visualEditingChannel && (
        <Suspense>
          <PostMessageSchema channel={visualEditingChannel} />
        </Suspense>
      )}
      {visualEditingChannel && documentsOnPage.length && (
        <Suspense>
          <PostMessagePreviews channel={visualEditingChannel} refs={documentsOnPage} />
        </Suspense>
      )}
      {visualEditingChannel && (
        <PostMessageSchemaUnionTypes channel={visualEditingChannel} perspective={perspective} />
      )}

      {visualEditingChannel && <PostMessageDocuments channel={visualEditingChannel} />}
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
