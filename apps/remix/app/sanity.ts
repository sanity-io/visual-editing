import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const {projectId, dataset} = workspaces['remix']

export const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion,
  stega: {
    enabled: true,
    studioUrl: (sourceDocument) => {
      if (
        sourceDocument._projectId === workspaces['cross-dataset-references'].projectId &&
        sourceDocument._dataset === workspaces['cross-dataset-references'].dataset
      ) {
        const {workspace, tool} = workspaces['cross-dataset-references']
        return {baseUrl, workspace, tool}
      }
      const {workspace, tool} = workspaces['remix']
      return {baseUrl, workspace, tool}
    },
  },
})

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
