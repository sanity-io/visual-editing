import { pathToString } from 'sanity'
import { urlStringToPath } from 'visual-editing-helpers'

export function parsePath(rawPath: string | undefined): {
  id: string | undefined
  path: string | undefined
} {
  if (rawPath === undefined) {
    return { id: undefined, path: undefined }
  }

  const segments = rawPath?.split('.')

  if (segments[0] === 'drafts') {
    return {
      id: segments[1],
      path:
        segments.length > 2
          ? pathToString(urlStringToPath(segments.slice(2).join('.')))
          : undefined,
    }
  }

  return {
    id: segments[0],
    path:
      segments.length > 1
        ? pathToString(urlStringToPath(segments.slice(1).join('.')))
        : undefined,
  }
}
