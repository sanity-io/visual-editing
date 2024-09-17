import {workspaces} from '@repo/env'
import {encodeSanityNodeData, SanityNode} from '@sanity/react-loader/jsx'
import {studioUrl} from 'apps-common/env'

const workspace = workspaces['page-builder-demo']

export function dataAttribute(node: Omit<SanityNode, 'baseUrl' | 'dataset' | 'projectId'>) {
  return encodeSanityNodeData({
    baseUrl: `${studioUrl}/${workspace.workspace}`,
    projectId: workspaces['page-builder-demo'].projectId,
    dataset: workspaces['page-builder-demo'].dataset,
    ...node,
  })
}
