import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {vercelStegaSplit} from '@vercel/stega'

export function formatCurrency(_value: number | string): string {
  let value = typeof _value === 'string' ? undefined : _value
  let encoded = ''
  if (typeof _value === 'string') {
    const split = vercelStegaSplit(_value)
    value = parseInt(split.cleaned, 10)
    encoded = split.encoded
  }
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatter.format(value!)}${encoded}`
}

const {projectId, dataset} = workspaces['nuxt']

export function getClient() {
  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    // stega: {
    //   enabled: true,
    //   studioUrl: (sourceDocument) => {
    //     if (
    //       sourceDocument._projectId === workspaces['cross-dataset-references'].projectId &&
    //       sourceDocument._dataset === workspaces['cross-dataset-references'].dataset
    //     ) {
    //       const {workspace, tool} = workspaces['cross-dataset-references']
    //       return {baseUrl, workspace, tool}
    //     }
    //     const {workspace, tool} = workspaces['nuxt']
    //     return {baseUrl, workspace, tool}
    //   },
    // },
  })
}

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
