import {workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createDataAttribute} from '@sanity/visual-editing/create-data-attribute'

export type DataAttributeNode = Omit<
  Parameters<typeof createDataAttribute>[0],
  'baseUrl' | 'workspace' | 'tool' | 'projectId' | 'dataset'
>

export type DataAttributeFn = (node: DataAttributeNode) => ReturnType<typeof createDataAttribute>

/**
 * Creates a `dataAttribute` helper bound to one of the studio workspaces,
 * so overlay edit intents resolve to the right workspace/tool.
 */
export function createWorkspaceDataAttribute(
  workspaceKey: 'page-builder-demo' | 'page-builder-vite',
): DataAttributeFn {
  const {projectId, dataset, workspace, tool} = workspaces[workspaceKey]

  return (node) =>
    createDataAttribute({
      baseUrl,
      workspace,
      tool,
      projectId,
      dataset,
      ...node,
    })
}
