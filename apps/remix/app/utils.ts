import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import {
  type SanityNode,
  encodeSanityNodeData as _encodeSanityNodeData,
} from '@sanity/overlays'
import { type ContentSourceMap, createClient } from '@sanity/preview-kit/client'
import {
  resolveMapping,
  encodeJsonPathToUriComponent,
  type PathSegment,
  parseNormalisedJsonPath,
} from '@sanity/preview-kit/csm'
import { workspaces, baseUrl, apiVersion } from 'apps-common/env'
import { shoesList, type ShoesListResult } from 'apps-common/queries'
import imageUrlBuilder from '@sanity/image-url'

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
