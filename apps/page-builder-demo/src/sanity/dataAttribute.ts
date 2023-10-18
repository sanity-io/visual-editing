import { SanityNode, encodeSanityNodeData } from '@sanity/overlays'
import { studioUrl, workspaces } from 'apps-common/env'

const workspace = workspaces['page-builder-demo']

export function dataAttribute(
  node: Omit<SanityNode, 'baseUrl' | 'dataset' | 'projectId'>,
) {
  return encodeSanityNodeData({
    baseUrl: `${studioUrl}/${workspace.workspace}/${workspace.tool}`,
    projectId: workspaces['page-builder-demo'].projectId,
    dataset: workspaces['page-builder-demo'].dataset,
    ...node,
  })
}
