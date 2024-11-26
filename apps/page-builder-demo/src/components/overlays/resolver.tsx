'use client'

import {OverlayComponent, OverlayComponentResolver} from '@sanity/visual-editing'
import {
  defineOverlayComponent,
  PointerEvents,
  UnionInsertMenuOverlay,
} from '@sanity/visual-editing/unstable_overlay-components'
import {ExcitingTitleControl} from './ExcitingTitleControl'
import {OverlayHighlight} from './OverlayHighlight'
import {ProductModelRotationControl} from './ProductModelRotationControl'

export const components: OverlayComponentResolver = (props) => {
  const {element, type, node, parent} = props

  const components: Array<
    | OverlayComponent<Record<string, unknown>, any>
    | {
        component: OverlayComponent<Record<string, unknown>, any>
        props?: Record<string, unknown>
      }
  > = [OverlayHighlight]

  if (type === 'string' && node.path === 'title') {
    return <ExcitingTitleControl node={node} PointerEvents={PointerEvents} />
  }

  if (type === 'object' && node.path.endsWith('rotations')) {
    components.push(ProductModelRotationControl)
  }

  if (parent?.type === 'union') {
    const parentDataset = element.parentElement?.dataset || {}

    const direction = (parentDataset.direction ?? 'vertical') as 'vertical' | 'horizontal'

    const hoverAreaExtent = parentDataset.hoverExtent || 48

    components.push(
      defineOverlayComponent(UnionInsertMenuOverlay, {
        direction,
        hoverAreaExtent,
      }),
    )
  }

  return components
}
