/* eslint-disable no-process-env */
import { createClient } from '@sanity/preview-kit/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-09-14',
  useCdn: false,
  perspective: 'published',
  studioUrl: '/studio',
  // logger: console,
  encodeSourceMap: true,
  encodeSourceMapAtPath: () => true,
})
