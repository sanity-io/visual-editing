/* eslint-disable no-process-env */
import { createClient } from '@sanity/preview-kit/client'
import { projectId, datasets } from 'apps-common/env'

export const client = createClient({
  projectId,
  dataset: datasets.development,
  apiVersion: '2023-09-14',
  useCdn: false,
  perspective: 'published',
  studioUrl: '/studio',
  // logger: console,
  encodeSourceMap: true,
  encodeSourceMapAtPath: () => true,
})
