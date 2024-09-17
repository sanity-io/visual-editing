import {workspaces} from '@repo/env'
import createImageUrlBuilder from '@sanity/image-url'

const {projectId, dataset} = workspaces['page-builder-demo']

export const imageUrlBuilder = createImageUrlBuilder({projectId, dataset})

export function urlFor(source: any) {
  return imageUrlBuilder.image(source).auto('format').fit('max')
}

export const crossDatasetImageUrlBuilder = createImageUrlBuilder({
  projectId: workspaces['cross-dataset-references'].projectId,
  dataset: workspaces['cross-dataset-references'].dataset,
})

export function urlForCrossDatasetImage(source: any) {
  return crossDatasetImageUrlBuilder.image(source).auto('format').fit('max')
}
