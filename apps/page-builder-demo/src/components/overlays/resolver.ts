'use client'

import {OverlayComponentResolver} from '@sanity/visual-editing'
import {
  defineOverlayComponent,
  UnionInsertMenuOverlay,
} from '@sanity/visual-editing/unstable_overlay-components'
import {ExcitingTitleControl} from './ExcitingTitleControl'
import {ProductModelRotationControl} from './ProductModelRotationControl'

export const components: OverlayComponentResolver = (props) => {
  const {type, node, parent} = props

  if (type === 'string' && node.path === 'title') {
    return ExcitingTitleControl
  }

  if (type === 'object' && node.path.endsWith('rotations')) {
    return defineOverlayComponent(ProductModelRotationControl)
  }

  if (parent?.type === 'union') {
    return defineOverlayComponent(UnionInsertMenuOverlay, {
      direction: 'vertical',
    })
  }

  return undefined
}
