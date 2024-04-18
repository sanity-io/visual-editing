import {createClient} from '@sanity/client'
import {workspaces, apiVersion, studioUrl} from 'apps-common/env'

const {projectId, dataset, workspace} = workspaces['page-builder-demo']

export function getClient() {
  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    stega: {
      enabled: true,
      studioUrl: () => ({baseUrl: studioUrl, workspace}),
    },
  })
}
