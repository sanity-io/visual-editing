'use client'

import {OverlayComponentResolver} from '@sanity/visual-editing'
import {ExcitingTitleControl} from './ExcitingTitleControl'
import {ProductModelRotationControl} from './ProductModelRotationControl'
import {Resize} from './Resize'

export const components: OverlayComponentResolver = (props) => {
  const {type, node} = props

  if (type === 'string' && node.path === 'title') {
    return ExcitingTitleControl
  }

  if (type === 'object' && node.path.endsWith('rotations')) {
    return ProductModelRotationControl
  }

  if (
    (type === 'number' && node.path.endsWith('imageMaxWidth')) ||
    node.path.endsWith('headingFontSize')
  ) {
    return Resize
  }

  return undefined
}
