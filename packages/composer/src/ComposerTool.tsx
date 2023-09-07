import { ReactElement } from 'react'
import { Tool } from 'sanity'

import { ComposerPluginOptions } from './types'

export default function ComposerTool(props: {
  tool: Tool<ComposerPluginOptions>
}): ReactElement {
  const { tool } = props

  return <div>ComposerTool: {tool.options?.previewUrl}</div>
}
