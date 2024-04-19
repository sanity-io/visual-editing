import {urlStringToPath} from '@repo/visual-editing-helpers'
import {studioPath} from '@sanity/client/csm'

import type {PresentationStateParams} from '../types'

export function parseId(rawId: string | undefined): string | undefined {
  if (rawId === undefined) {
    return undefined
  }

  const segments = decodeURIComponent(rawId)?.split('.')

  if (segments[0] === 'drafts') {
    segments.shift()
  }

  return segments.join('.')
}

export function parsePath(rawPath: string | undefined): string | undefined {
  if (rawPath === undefined) {
    return undefined
  }

  return studioPath.toString(urlStringToPath(decodeURIComponent(rawPath)))
}

export function parseRouterState(state: PresentationStateParams): PresentationStateParams {
  return {
    id: parseId(state.id),
    path: parsePath(state.path),
    type: state.type,
  }
}
