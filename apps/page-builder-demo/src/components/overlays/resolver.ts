'use client'

import {OverlayComponent, OverlayComponentResolver} from '@sanity/visual-editing'
import {UnionInsertMenuOverlay} from '@sanity/visual-editing/overlay-components'
import {ExcitingTitleControl} from './ExcitingTitleControl'
import {ProductModelRotationControl} from './ProductModelRotationControl'

export const components: OverlayComponentResolver = (props) => {
  const {type, node, parent} = props

  if (type === 'string' && node.path === 'title') {
    return ExcitingTitleControl
  }

  if (type === 'object' && node.path.endsWith('rotations')) {
    return ProductModelRotationControl
  }

  if (parent?.type === 'union') {
    return UnionInsertMenuOverlay as OverlayComponent
  }

  return undefined
}
