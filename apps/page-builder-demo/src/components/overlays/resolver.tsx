'use client'

import {OverlayComponent, OverlayComponentResolver} from '@sanity/visual-editing'
import {
  defineOverlayComponent,
  UnionInsertMenuOverlay,
} from '@sanity/visual-editing/unstable_overlay-components'
import {OverlayHighlight} from './OverlayHighlight'

export const components: OverlayComponentResolver = (props) => {
  const {element, parent} = props

  const components: Array<
    | OverlayComponent<Record<string, unknown>, any>
    | {
        component: OverlayComponent<Record<string, unknown>, any>
        props?: Record<string, unknown>
      }
  > = [OverlayHighlight]

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
