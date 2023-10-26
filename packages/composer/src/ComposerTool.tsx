import { ClientPerspective, QueryParams } from '@sanity/client'
import { Card, Flex, useToast } from '@sanity/ui'
import { ChannelReturns, createChannel } from 'channels'
import {
  ReactElement,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Path, pathToString, Tool, useDataset, useProjectId } from 'sanity'
import styled from 'styled-components'
import {
  getQueryCacheKey,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

import { Resizable } from './components/Resizable'
import { ComposerNavigateProvider } from './ComposerNavigateProvider'
import { ComposerParamsProvider } from './ComposerParamsProvider'
import { ComposerProvider } from './ComposerProvider'
import { ContentEditor } from './editor/ContentEditor'
import LoaderQueries from './loader/LoaderQueries'
import { PreviewFrame } from './preview/PreviewFrame'
import { ComposerPluginOptions, DeskDocumentPaneParams } from './types'
import { useParams } from './useParams'

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function ComposerTool(props: {
  tool: Tool<ComposerPluginOptions>
}): ReactElement {
  const { previewUrl = '/', components } = props.tool.options ?? {}
  const { unstable_navigator: UnstableNavigator } = components || {}

  const [devMode] = useState(() => {
    const option = props.tool.options?.devMode

    if (typeof option === 'function') return option()
    if (typeof option === 'boolean') return option

    return (
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
    )
  })

  // @TODO The iframe URL might change, we have to make sure we don't post Studio state to unknown origins
  // see https://medium.com/@chiragrai3666/exploiting-postmessage-e2b01349c205
  const targetOrigin = useMemo(() => {
    // previewUrl might be relative, if it is we set `targetOrigin` to the same origin as the Studio
    // if it's an absolute URL we extract the origin from it
    const url = new URL(previewUrl, location.href)
    return url.origin
  }, [previewUrl])
  const [perspective, setPerspective] =
    useState<ClientPerspective>('previewDrafts')

  const [channel, setChannel] = useState<ChannelReturns<VisualEditingMsg>>()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [documentsOnPage, setDocumentsOnPage] = useDocumentsOnPage(perspective)
  const [liveQueries, setLiveQueries] = useState<
    Record<
      string,
      { query: string; params: QueryParams; perspective: ClientPerspective }
    >
  >({})

  const { defaultPreviewUrl, setParams, params, deskParams } = useParams({
    previewUrl,
  })

  const [overlayEnabled, setOverlayEnabled] = useState(true)
  const [navigatorEnabled, setNavigatorEnabled] = useState(!!UnstableNavigator)
  const toggleNavigator = useMemo(
    () =>
      UnstableNavigator && (() => setNavigatorEnabled((enabled) => !enabled)),
    [UnstableNavigator, setNavigatorEnabled],
  )

  const toast = useToast()
  const projectId = useProjectId()
  const dataset = useDataset()

  useEffect(() => {
    const iframe = iframeRef.current?.contentWindow

    if (!iframe) return

    const nextChannel = createChannel<VisualEditingMsg>({
      id: 'composer' satisfies VisualEditingConnectionIds,
      onStatusUpdate(status, prevStatus, connection) {
        if (status === 'unhealthy') {
          toast.push({
            id: connection.config.id,
            closable: true,
            description: `The connection '${connection.config.id}' stopped responding. This means further changes might not be reflected in the preview.`,
            status: 'error',
            title: `Connection unhealthy`,
            duration: 1000 * 60 * 60,
          })
        }
        if (status === 'connected' && prevStatus === 'unhealthy') {
          toast.push({
            id: connection.config.id,
            closable: true,
            description: `The connection '${connection.config.id}' was restored.`,
            status: 'success',
            title: `Connection restored`,
          })
        }
      },
      // onConnect,
      // onDisconnect,
      connections: [
        {
          target: iframe,
          targetOrigin,
          id: 'overlays' satisfies VisualEditingConnectionIds,
          heartbeat: true,
        },
        {
          target: iframe,
          targetOrigin,
          id: 'loaders' satisfies VisualEditingConnectionIds,
          heartbeat: true,
        },
      ],
      handler(type, data) {
        if (type === 'overlay/focus' && 'id' in data) {
          setParams({
            id: data.id,
            path: data.path,
            type: data.type,
          })
        } else if (type === 'overlay/navigate') {
          setParams({
            preview: data.url,
          })
        } else if (type === 'overlay/toggle') {
          setOverlayEnabled(data.enabled)
        } else if (
          type === 'loader/documents' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          setDocumentsOnPage(data.perspective, data.documents)
        } else if (
          type === 'loader/query-listen' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          setLiveQueries((prev) => ({
            ...prev,
            [getQueryCacheKey(data.query, data.params)]: {
              perspective: data.perspective,
              query: data.query,
              params: data.params,
            },
          }))
        }
      },
    })
    setChannel(nextChannel)

    return () => {
      nextChannel.disconnect()
      setChannel(undefined)
    }
  }, [setParams, targetOrigin, toast, dataset, projectId, setDocumentsOnPage])

  const handleFocusPath = useCallback(
    // eslint-disable-next-line no-warning-comments
    // @todo nextDocumentId may not be needed with this strategy
    (nextDocumentId: string, nextPath: Path) => {
      setParams({
        // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
        path: pathToString(nextPath),
      })
    },
    [setParams],
  )

  const handlePreviewPath = useCallback(
    (nextPath: string) => {
      const url = new URL(nextPath, defaultPreviewUrl.origin)
      const preview = url.pathname + url.search
      if (
        url.origin === defaultPreviewUrl.origin &&
        preview !== params.preview
      ) {
        setParams({ id: undefined, path: undefined, preview })
      }
    },
    [defaultPreviewUrl, params, setParams],
  )

  const handleDeskParams = useCallback(
    (deskParams: DeskDocumentPaneParams) => {
      setParams({ ...deskParams })
    },
    [setParams],
  )

  useEffect(() => {
    if (params.id && params.path) {
      channel?.send('composer/focus', { id: params.id, path: params.path })
    } else {
      channel?.send('composer/blur', undefined)
    }
  }, [channel, params.id, params.path])

  // Dispatch a navigation message whenever the preview param changes
  // @todo This will cause a reflection of received navigation messages which could be problematic
  useEffect(() => {
    if (params.preview) {
      channel?.send('composer/navigate', {
        url: params.preview,
        type: 'push',
      })
    }
  }, [channel, params.preview])

  // Resizing
  const minWidth = 320
  const [maxWidth, setMaxWidth] = useState(
    Math.max(window.innerWidth - minWidth, minWidth),
  )

  useEffect(() => {
    const handleWindowResize = () => {
      setMaxWidth(Math.max(window.innerWidth - minWidth, minWidth))
    }

    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])
  const [resizing, setResizing] = useState(false)
  const handleResizeStart = useCallback(() => setResizing(true), [])
  const handleResizeEnd = useCallback(() => setResizing(false), [])

  // The URL that should be loaded by the preview iframe
  // useRef to prevent iframe reloading when preview param changes
  const initialPreviewUrl = useRef(
    `${defaultPreviewUrl.origin}${params.preview}`,
  )

  const toggleOverlay = useCallback(
    () => channel?.send('composer/toggleOverlay', undefined),
    [channel],
  )

  return (
    <>
      <ComposerProvider
        deskParams={deskParams}
        devMode={devMode}
        params={params}
      >
        <ComposerNavigateProvider setParams={setParams}>
          <ComposerParamsProvider params={params}>
            <Container height="fill">
              {UnstableNavigator && navigatorEnabled && (
                <Card borderRight flex="none">
                  <UnstableNavigator />
                </Card>
              )}

              <Flex
                direction="column"
                flex={1}
                overflow="hidden"
                style={{ minWidth }}
              >
                <PreviewFrame
                  initialUrl={initialPreviewUrl.current}
                  navigatorEnabled={navigatorEnabled}
                  onPathChange={handlePreviewPath}
                  overlayEnabled={overlayEnabled}
                  params={params}
                  perspective={perspective}
                  pointerEvents={resizing ? 'none' : undefined}
                  ref={iframeRef}
                  setPerspective={setPerspective}
                  targetOrigin={targetOrigin}
                  toggleNavigator={toggleNavigator}
                  toggleOverlay={toggleOverlay}
                />
              </Flex>
              <Resizable
                minWidth={minWidth}
                maxWidth={maxWidth}
                onResizeStart={handleResizeStart}
                onResizeEnd={handleResizeEnd}
              >
                <ContentEditor
                  refs={documentsOnPage}
                  deskParams={deskParams}
                  documentId={params.id}
                  documentType={params.type}
                  onDeskParams={handleDeskParams}
                  onFocusPath={handleFocusPath}
                  previewUrl={params.preview}
                />
              </Resizable>
            </Container>
          </ComposerParamsProvider>
        </ComposerNavigateProvider>
      </ComposerProvider>
      {channel && (
        <>
          <LoaderQueries
            key="published"
            activePerspective={perspective === 'published'}
            channel={channel}
            liveQueries={liveQueries}
            perspective="published"
            documentId={params.id}
            documentType={params.type}
          />
          <LoaderQueries
            key="previewDrafts"
            activePerspective={perspective === 'previewDrafts'}
            channel={channel}
            liveQueries={liveQueries}
            perspective="previewDrafts"
            documentId={params.id}
            documentType={params.type}
          />
        </>
      )}
    </>
  )
}

type DocumentsOnPage = {
  _id: string
  _type: string
  _projectId?: string
  dataset?: string
}[]
function useDocumentsOnPage(
  perspective: ClientPerspective,
): [
  DocumentsOnPage,
  (perspective: ClientPerspective, state: DocumentsOnPage) => void,
] {
  const [state, setState] = useState<
    Record<ClientPerspective, Map<string, DocumentsOnPage[number]>>
  >(() => ({ published: new Map(), previewDrafts: new Map(), raw: new Map() }))

  const setDocumentsOnPage = useCallback(
    (perspective: ClientPerspective, documents: DocumentsOnPage) =>
      startTransition(() =>
        setState((state) => {
          let changed = false
          let map = state[perspective]
          const getKey = (document: DocumentsOnPage[number]) => {
            return `${document._projectId}-${document.dataset}-${document._type}-${document._id}`
          }
          const knownKeys = new Set<ReturnType<typeof getKey>>()
          // Add anything new, and track all keys
          for (const document of documents) {
            const key = getKey(document)
            knownKeys.add(key)
            if (!map.has(key)) {
              map.set(key, document)
              changed = true
            }
          }
          // Remove anything that is no longer on the page
          for (const key of map.keys()) {
            if (!knownKeys.has(key)) {
              map.delete(key)
              changed = true
            }
          }

          if (changed) {
            map = new Map(map)
            return { ...state, [perspective]: new Map(map) }
          }

          return state
        }),
      ),
    [],
  )

  const documentsOnPageMap = useMemo(() => {
    return state[perspective]
  }, [perspective, state])
  const documentsOnPage = useMemo(() => {
    return [...documentsOnPageMap.values()]
  }, [documentsOnPageMap])

  return [documentsOnPage, setDocumentsOnPage]
}
