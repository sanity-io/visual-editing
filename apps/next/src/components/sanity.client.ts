import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from '@sanity/client'

const {projectId, dataset} = workspaces['next-pages-router']

export const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion,
  stega: {
    studioUrl: (sourceDocument) => {
      if (
        sourceDocument._projectId === workspaces['cross-dataset-references'].projectId &&
        sourceDocument._dataset === workspaces['cross-dataset-references'].dataset
      ) {
        const {workspace, tool} = workspaces['cross-dataset-references']
        return {baseUrl, workspace, tool}
      }
      const {workspace, tool} = workspaces['next-pages-router']
      return {baseUrl, workspace, tool}
    },
  },
})
