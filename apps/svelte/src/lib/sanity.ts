import { createClient } from '@sanity/client/stega'
import { apiVersion, workspaces } from 'apps-common/env'
import imageUrlBuilder from '@sanity/image-url'
const { projectId, dataset } = workspaces['svelte']

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
  // stega: {
  //   enabled: true,
  //   studioUrl: (sourceDocument) => {
  //     if (
  //       sourceDocument._projectId ===
  //         workspaces['cross-dataset-references'].projectId &&
  //       sourceDocument._dataset ===
  //         workspaces['cross-dataset-references'].dataset
  //     ) {
  //       const { workspace, tool } = workspaces['cross-dataset-references']
  //       return { baseUrl, workspace, tool }
  //     }
  //     const { workspace, tool } = workspaces['svelte']
  //     return { baseUrl, workspace, tool }
  //   },
  // },
})

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
