import {lazy, Suspense, useSyncExternalStore} from 'react'
import type {VisualEditingProps} from './VisualEditingComponent'

const VisualEditingComponent = lazy(() => import('./VisualEditingComponent'))

const subcribe = () => () => {}

/**
 * @public
 */
export function VisualEditing(props: VisualEditingProps): React.JSX.Element | null {
  const mounted = useSyncExternalStore(
    subcribe,
    () => true,
    () => false,
  )

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
