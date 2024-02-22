/**
 * The code in this file will be ported to `next-sanity`
 */
import { lazy, Suspense } from 'react'

import type { VisualEditingProps } from './VisualEditingComponent'

const VisualEditingComponent = lazy(() => import('./VisualEditingComponent'))

/**
 * @public
 */
export function VisualEditing(props: VisualEditingProps): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <VisualEditingComponent {...props} />
    </Suspense>
  )
}
