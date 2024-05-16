import {uuid} from '@sanity/uuid'
import {type SearchParam} from 'sanity/router'

import {encodeJsonParams, getPublishedId} from './internals'
import type {PresentationStateParams} from './types'

/**
 * @internal
 */
export function getIntentState(
  intent: string,
  params: Record<string, string>,
  _routerState: undefined,
  payload: unknown,
):
  | (PresentationStateParams & {_searchParams: SearchParam[]})
  | {intent: string; params: Record<string, string>; payload: unknown} {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {id, mode, path, presentation, type, ...searchParams} = params

  if (intent === 'edit' && id) {
    return {
      type: type || '*',
      id: getPublishedId(id),
      path,
      _searchParams: Object.entries(searchParams),
    }
  }

  if (intent === 'create') {
    searchParams['preview'] =
      searchParams['preview'] || new URLSearchParams(window.location.search).get('preview') || '/'

    if (payload && typeof payload === 'object') {
      searchParams['templateParams'] = encodeJsonParams(payload as Record<string, unknown>)
    }

    return {
      type: type || '*',
      id: id || uuid(),
      _searchParams: Object.entries(searchParams),
    }
  }
  return {intent, params, payload}
}
