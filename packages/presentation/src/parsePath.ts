import { studioPath } from '@sanity/client/csm'
import { urlStringToPath } from '@sanity/visual-editing-helpers'

export function parsePath(rawPath: string | undefined): {
  id: string | undefined
  path: string | undefined
} {
  if (rawPath === undefined) {
    return { id: undefined, path: undefined }
  }

  const segments = rawPath?.split('.')

  if (segments[0] === 'drafts') {
    segments.shift()
  }

  return {
    id: segments[0],
    path:
      segments.length > 1
        ? studioPath.toString(urlStringToPath(segments.slice(1).join('.')))
        : undefined,
  }
}
