import { Card, Code, Flex } from '@sanity/ui'
import { ChannelReturns, createChannel } from 'channels'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { Path, pathToString, Tool } from 'sanity'
import type { VisualEditingMsg } from 'visual-editing-helpers'

import { ComposerProvider } from './ComposerProvider'
import { ContentEditor } from './editor/ContentEditor'
import { PreviewFrame } from './preview/PreviewFrame'
import { ComposerPluginOptions, DeskDocumentPaneParams } from './types'
import { useComposerParams } from './useComposerParams'

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
        if (type === 'overlay/focus') {
          setParams((p) => ({
            ...p,
            id: data.id,
            path: data.path,
            type: data.type,
          }))
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
    (nextDocumentId: string, path: Path) => {
      setParams((p) => {
        return {
          ...p,
          // Don’t need to explicitly set the id here because it was either already set via postMessage or is the same if navigating in the document pane
          path: pathToString(path),
        }
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
        setParams(() => ({ preview }))
      }
    },
    [defaultPreviewUrl, params, setParams],
  )

  const handleDeskParams = useCallback(
    (deskParams: DeskDocumentPaneParams) => {
      setParams((p) => ({ ...p, ...deskParams }))
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

  return (
    <ComposerProvider deskParams={deskParams} params={params}>
      <Flex height="fill">
        <Flex direction="column" flex={1} overflow="hidden">
          <PreviewFrame
            ref={iframeRef}
            initialUrl={`${defaultPreviewUrl.origin}${params.preview}`}
            onPathChange={handlePreviewPath}
            params={params}
            pointerEvents={undefined}
          />
        </Flex>
        <Card borderLeft flex={1} overflow="auto">
          <Card borderBottom flex={1} overflow="auto" padding={4}>
            <Code language="json" size={1}>
              {JSON.stringify(params, null, 2)}
            </Code>
          </Card>
          <ContentEditor
            deskParams={deskParams}
            documentId={params.id}
            documentType={params.type}
            onDeskParams={handleDeskParams}
            onFocusPath={handleFocusPath}
          />
        </Card>
      </Flex>
    </ComposerProvider>
  )
}
