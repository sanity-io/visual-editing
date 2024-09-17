import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from '@sanity/client'

const {projectId, dataset, workspace} = workspaces['page-builder-demo']

export function getClient() {
  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    perspective: 'previewDrafts',
    stega: {
      enabled: true,
      studioUrl: () => ({baseUrl, workspace}),
    },
  })
}
