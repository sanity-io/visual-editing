import {apiVersion, workspaces} from '@repo/env'
import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import {studioUrl} from 'apps-common/env'

const {projectId, dataset} = workspaces['svelte-basic']

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
  stega: {
    enabled: true,
    studioUrl,
  },
})

const builder = imageUrlBuilder({projectId, dataset})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source).auto('format').fit('max')
}

const crossDatasetBuilder = imageUrlBuilder({
  projectId: workspaces['cross-dataset-references'].projectId,
  dataset: workspaces['cross-dataset-references'].dataset,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlForCrossDatasetReference(source: any) {
  return crossDatasetBuilder.image(source).auto('format').fit('max')
}
