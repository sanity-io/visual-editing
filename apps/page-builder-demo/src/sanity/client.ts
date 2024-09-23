import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from '@sanity/client'

const {projectId, dataset, workspace, tool} = workspaces['page-builder-demo']

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
  perspective: 'published',
  stega: {
    studioUrl: () => ({baseUrl, workspace, tool}),
  },
})
