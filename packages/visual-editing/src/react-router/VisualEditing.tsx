import {lazy, Suspense, useDeferredValue, useSyncExternalStore} from 'react'

import type {VisualEditingProps} from './VisualEditingComponent'

const VisualEditingComponent = lazy(() => import('./VisualEditingComponent'))

// eslint-disable-next-line @typescript-eslint/no-empty-function
const subcribe = () => () => {}

/**
 * @public
 */
export function VisualEditing(props: VisualEditingProps): React.JSX.Element | null {
  const mounted = useDeferredValue(useSyncExternalStore(
    subcribe,
    () => true,
    () => false,
  ), false)

  // Don't render Suspense while hydration, this enables compatibility with React v17 apps
  // where Suspense where a browser-only API
  if (!mounted) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <VisualEditingComponent {...props} />
    </Suspense>
  )
}
