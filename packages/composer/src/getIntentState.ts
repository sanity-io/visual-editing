import { getPublishedId } from 'sanity'

/**
 * @internal
 */
export function getIntentState(
  intent: string,
  params: Record<string, string>,
  routerState: undefined,
  payload: unknown,
):
  | { path: string }
  | { intent: string; params: Record<string, string>; payload: unknown } {
  if (intent === 'focus' && params.id && params.path) {
    return {
      path: [getPublishedId(params.id), params.path].filter(Boolean).join('.'),
    }
  }

  return { intent, params, payload }
}
