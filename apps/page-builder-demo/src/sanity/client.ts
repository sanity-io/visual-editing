import { createClient } from '@sanity/client'
import { workspaces, apiVersion } from 'apps-common/env'

const { projectId, dataset } = workspaces['page-builder-demo']

export function getClient() {
  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    resultSourceMap: true,
    // resultSourceMap: 'withKeyArraySelector',
  })
}
