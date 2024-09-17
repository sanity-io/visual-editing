import {apiVersion, workspaces} from '@repo/env'
import {createClient} from '@sanity/client'
import {studioUrl} from 'apps-common/env'

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
      studioUrl: () => ({baseUrl: studioUrl, workspace}),
    },
  })
}
