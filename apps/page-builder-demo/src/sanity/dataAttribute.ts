import {workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {encodeSanityNodeData, SanityNode} from '@sanity/react-loader/jsx'

const {projectId, dataset, workspace, tool} = workspaces['page-builder-demo']

export function dataAttribute(node: Omit<SanityNode, 'baseUrl' | 'dataset' | 'projectId'>) {
  return encodeSanityNodeData({
    baseUrl,
    workspace,
    tool,
    projectId,
    dataset,
    ...node,
  })
}
