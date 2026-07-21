import {workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createDataAttribute} from '@sanity/visual-editing/create-data-attribute'

const {projectId, dataset, workspace, tool} = workspaces['page-builder-vite']

export function dataAttribute(
  node: Omit<
    Parameters<typeof createDataAttribute>[0],
    'baseUrl' | 'workspace' | 'tool' | 'projectId' | 'dataset'
  >,
) {
  return createDataAttribute({
    baseUrl,
    workspace,
    tool,
    projectId,
    dataset,
    ...node,
  })
}
