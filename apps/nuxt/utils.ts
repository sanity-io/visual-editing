import { type ContentSourceMap, createClient } from '@sanity/client/stega'
import { workspaces, studioUrl as baseUrl, apiVersion } from 'apps-common/env'
import imageUrlBuilder from '@sanity/image-url'
import { defineDataAttribute as _defineDataAttribute } from 'apps-common/utils'

const { projectId, dataset, tool, workspace } = workspaces['nuxt']
const studioUrl = `${baseUrl}/${workspace}`

export function getClient() {
  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    resultSourceMap: 'withKeyArraySelector',
    stega: {
      enabled: true,
      studioUrl,
      logger: console,
    },
  })
}

const builder = imageUrlBuilder({ projectId, dataset })
export function urlFor(source: any) {
  return builder.image(source).auto('format').fit('max')
}

const crossDatasetBuilder = imageUrlBuilder({
  projectId: workspaces['cross-dataset-references'].projectId,
  dataset: workspaces['cross-dataset-references'].dataset,
})
export function urlForCrossDatasetReference(source: any) {
  return crossDatasetBuilder.image(source).auto('format').fit('max')
}

export function defineDataAttribute(csm?: ContentSourceMap) {
  return _defineDataAttribute(
    { baseUrl, projectId, dataset, tool, workspace },
    csm,
  )
}
