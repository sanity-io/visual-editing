import {workspaces} from '@repo/env'
import {createImageUrlBuilder} from '@sanity/image-url'

const {projectId, dataset} = workspaces['astro']

const builder = createImageUrlBuilder({projectId, dataset})
export function urlFor(source: any) {
  return builder.image(source).auto('format').fit('max')
}

const crossDatasetBuilder = createImageUrlBuilder({
  projectId: workspaces['cross-dataset-references'].projectId,
  dataset: workspaces['cross-dataset-references'].dataset,
})
export function urlForCrossDatasetReference(source: any) {
  return crossDatasetBuilder.image(source).auto('format').fit('max')
}
