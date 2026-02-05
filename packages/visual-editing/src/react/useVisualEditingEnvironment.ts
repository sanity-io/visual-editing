import {useDeferredValue, useSyncExternalStore} from 'react'

import {type VisualEditingEnvironment, subscribe, getSnapshot} from '../ui/environment/context'

/**
 * @alpha - unstable API, may have breaking changes in a minor release
 */
export function useVisualEditingEnvironment(): VisualEditingEnvironment {
  const environment = useSyncExternalStore(subscribe, getSnapshot, () => null)
  return useDeferredValue(environment, null)
}
