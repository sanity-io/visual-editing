import {workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createDataAttribute} from 'next-sanity'

const {projectId, dataset, workspace, tool} = workspaces['page-builder-demo']

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
