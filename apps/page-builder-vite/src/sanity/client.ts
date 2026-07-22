import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from '@sanity/client'

import {previewParams} from './previewParams'

const {projectId, dataset, workspace, tool} = workspaces['page-builder-vite']

const token = import.meta.env.VITE_SANITY_API_READ_TOKEN as string | undefined

export const client = createClient({
  projectId,
  dataset,
  // The `variant` param is only accepted by the experimental API version
  apiVersion: previewParams?.variant ? 'vX' : apiVersion,
  stega: {
    studioUrl: () => ({baseUrl, workspace, tool}),
  },
  // When opened through a Presentation preview link (outside the studio iframe),
  // apply the perspective/variant from the URL. Draft content requires auth:
  // a `VITE_SANITY_API_READ_TOKEN` env var, or the Sanity session cookie of the
  // logged-in user (`withCredentials`).
  ...(previewParams
    ? {
        useCdn: false,
        perspective: previewParams.perspective,
        variant: previewParams.variant,
        ...(token ? {token} : {withCredentials: true}),
      }
    : {
        useCdn: true,
        perspective: 'published' as const,
      }),
})

// Used by `useLiveMode` when the app is previewed inside Presentation.
// Stega must be enabled so overlays can resolve edit intents from the content.
export const stegaClient = client.withConfig({
  stega: true,
})
