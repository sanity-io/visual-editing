import imageUrlBuilder from '@sanity/image-url'
import {workspaces} from 'apps-common/env'

const {projectId, dataset} = workspaces['next-pages-router']

const builder = imageUrlBuilder({projectId, dataset})
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
