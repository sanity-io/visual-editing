import { Flex } from '@sanity/ui'
import { ChannelReturns, createChannel } from 'channels'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { Path, pathToString, Tool } from 'sanity'
import styled from 'styled-components'
import type { VisualEditingMsg } from 'visual-editing-helpers'

import { Resizable } from './components/Resizable'
import { ComposerProvider } from './ComposerProvider'
import { ContentEditor } from './editor/ContentEditor'
import { PreviewFrame } from './preview/PreviewFrame'
import { ComposerPluginOptions, DeskDocumentPaneParams } from './types'
import { useComposerParams } from './useComposerParams'

const Container = styled(Flex)`
  overflow-x: auto;
`

export default function ComposerTool(props: {
  tool: Tool<ComposerPluginOptions>
}): ReactElement {
  const { previewUrl = '/' } = props.tool.options ?? {}

  const [channel, setChannel] = useState<ChannelReturns<VisualEditingMsg>>()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { defaultPreviewUrl, setParams, params, deskParams } =
    useComposerParams({
      previewUrl,
    })

  useEffect(() => {
    const iframe = iframeRef.current?.contentWindow

    if (!iframe) return

    const channel = createChannel<VisualEditingMsg>({
      id: 'composer',
      connections: [
        {
          target: iframe,
          id: 'overlays',
        },
      ],
      handler(type, data) {
        if (type === 'overlay/focus' && 'id' in data) {
          setParams({
            id: data.id,
            path: data.path,
            type: data.type,
          })
        }
      },
    })
    setChannel(channel)

    return () => {
      channel.disconnect()
    }
  }, [setParams])

  const handleFocusPath = useCallback(
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
        setParams({ preview })
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
  }, [channel, params])

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

  return (
    <ComposerProvider deskParams={deskParams} params={params}>
      <Container height="fill">
        <Flex
          direction="column"
          flex={1}
          overflow="hidden"
          style={{ minWidth }}
        >
          <PreviewFrame
            ref={iframeRef}
            initialUrl={`${defaultPreviewUrl.origin}${params.preview}`}
            onPathChange={handlePreviewPath}
            params={params}
            pointerEvents={resizing ? 'none' : undefined}
          />
        </Flex>
        <Resizable
          minWidth={minWidth}
          maxWidth={maxWidth}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        >
          <ContentEditor
            deskParams={deskParams}
            documentId={params.id}
            documentType={params.type}
            onDeskParams={handleDeskParams}
            onFocusPath={handleFocusPath}
          />
        </Resizable>
      </Container>
    </ComposerProvider>
  )
}
