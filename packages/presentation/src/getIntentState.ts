import { getPublishedId } from 'sanity'
import { SearchParam } from 'sanity/router'

/**
 * @internal
 */
export function getIntentState(
  intent: string,
  params: Record<string, string>,
  _routerState: undefined,
  payload: unknown,
):
  | { type: string; path: string; _searchParams: SearchParam[] }
  | { intent: string; params: Record<string, string>; payload: unknown } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, mode, path, presentation, type, ...searchParams } = params

  if (intent === 'edit' && id) {
    return {
      type: type || '*',
      path: [getPublishedId(id), path].filter(Boolean).join('.'),
      _searchParams: Object.entries(searchParams),
    }
  }

  return { intent, params, payload }
}
