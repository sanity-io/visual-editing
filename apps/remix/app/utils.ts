import { type ContentSourceMap, createClient } from '@sanity/preview-kit/client'
import { workspaces, baseUrl, apiVersion } from 'apps-common/env'
import imageUrlBuilder from '@sanity/image-url'
import { defineDataAttribute as _defineDataAttribute } from 'apps-common/utils'

const { projectId, dataset, tool, workspace } = workspaces['remix']
const studioUrl = `${baseUrl}/${workspace}`

export function getClient() {
  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    logger: console,
    encodeSourceMap: true,
    /*
    // @TODO fix cross dataset reference links
    encodeSourceMapAtPath: (props) => {
      if (
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._projectId &&
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._projectId !== projectId
      ) {
        return false
      }
      if (
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._dataset &&
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._dataset !== dataset
      ) {
        return false
      }

      return props.filterDefault(props)
    },
    // */
    studioUrl,
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
