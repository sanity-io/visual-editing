// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

/**
 * Return the `exitPreviewQueryParam` and `isPreview` values so that they can be referenced in client-side code.
 */
export const load: LayoutServerLoad = ({ locals: { draftMode } }) => {
  return {
    draftMode,
  }
}
