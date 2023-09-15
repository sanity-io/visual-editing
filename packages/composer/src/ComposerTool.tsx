import { Card, Code, Flex } from '@sanity/ui'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { isRecord, Tool } from 'sanity'
import styled from 'styled-components'

import { ComposerPluginOptions } from './types'

const IFrame = styled.iframe`
  border: 0;
  height: 100%;
  width: 100%;
  display: block;
`

export default function ComposerTool(props: {
  tool: Tool<ComposerPluginOptions>
}): ReactElement {
  const { tool } = props

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const iframe = iframeRef.current

    if (!iframe) return

    function handleMessage(event: MessageEvent) {
      if (event.origin !== location.origin) return

      if (isRecord(event.data) && event.data.sanity === true) {
        setLog((l) => [{ logId: l.length, ...event.data }, ...l])
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <Flex height="fill">
      <Card flex={1}>
        <IFrame ref={iframeRef} src={tool.options?.previewUrl || '/'} />
      </Card>
      <Card borderLeft flex={1} overflow="auto" padding={4}>
        <Code language="json" size={1}>
          {JSON.stringify(log, null, 2)}
        </Code>
      </Card>
    </Flex>
  )
}
