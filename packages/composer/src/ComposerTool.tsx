import { ReactElement, useEffect, useRef, useState } from 'react'
import { isRecord, Tool } from 'sanity'

import { ComposerPluginOptions } from './types'

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
        setLog((l) => l.concat(event.data))
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div>
      ComposerTool
      <iframe ref={iframeRef} src={tool.options?.previewUrl || '/'}></iframe>
      <pre>{JSON.stringify(log, null, 2)}</pre>
    </div>
  )
}
