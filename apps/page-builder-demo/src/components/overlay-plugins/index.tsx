'use client'

import {OverlayPluginDefinition} from '@sanity/visual-editing/react'
import {ExcitingTitlePlugin} from './exciting-title'
import {ImageResolutionHUD} from './image-res'
import {LEDLifespanHUD} from './led-lifespan'
import {Rotate3D} from './rotate-3d'

export const plugins: OverlayPluginDefinition[] = [
  LEDLifespanHUD(),
  ImageResolutionHUD(),
  Rotate3D({guard: ({node}) => node.path.endsWith('rotations')}),
  ExcitingTitlePlugin({
    guard: ({node}) => node.path.endsWith('title'),
    options: {append: '?', buttonText: '🤩'},
  }),
  ExcitingTitlePlugin({
    guard: ({node}) => node.path.endsWith('headline'),
  }),
]
