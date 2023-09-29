import { getPublishedId } from 'sanity'

/**
 * @internal
 */
export function getIntentState(
  intent: string,
  params: Record<string, string>,
  _routerState: undefined,
  payload: unknown,
):
  | { type: string; path: string }
  | { intent: string; params: Record<string, string>; payload: unknown } {
  if (intent === 'edit' && params.id) {
    return {
      type: params.type || '*',
      path: [getPublishedId(params.id), params.path].filter(Boolean).join('.'),
    }
  }

  return { intent, params, payload }
}
