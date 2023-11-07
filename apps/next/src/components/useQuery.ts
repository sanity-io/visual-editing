import { createClient } from '@sanity/client/stega'
import { createQueryStore } from '@sanity/react-loader'
import { apiVersion, studioUrl as baseUrl, workspaces } from 'apps-common/env'

const { projectId, dataset, tool, workspace } = workspaces['next-pages-router']
const studioUrl = `${baseUrl}/${workspace}/${tool}`

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion,
  stega: {
    enabled: true,
    logger: console,
    studioUrl: ({ _dataset }) =>
      _dataset === workspaces['cross-dataset-references'].dataset
        ? `${baseUrl}/${workspaces['cross-dataset-references'].workspace}`
        : studioUrl,
  },
})

export const { query, useQuery, useLiveMode } = createQueryStore({
  client,
  allowStudioOrigin: studioUrl,
})
