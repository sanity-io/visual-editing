import { createClient } from '@sanity/client/stega'
import { workspaces, studioUrl as baseUrl, apiVersion } from 'apps-common/env'

const { projectId, dataset, workspace } = workspaces['next-app-router']
const studioUrl = `${baseUrl}/${workspace}`

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
  stega: {
    studioUrl: ({ _dataset }) =>
      _dataset === workspaces['cross-dataset-references'].dataset
        ? `${baseUrl}/${workspaces['cross-dataset-references'].workspace}`
        : studioUrl,
  },
})
