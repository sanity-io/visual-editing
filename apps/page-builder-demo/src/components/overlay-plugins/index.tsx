'use client'

import {OverlayPluginDefinition} from '@sanity/visual-editing/react'
import {ExampleExclusivePlugin} from './example-exclusive'
import {ExampleHUDPlugin} from './example-hud'
import {ImageResolutionHUD} from './image-res'
import {LEDLifespanHUD} from './led-lifespan'

export const plugins: OverlayPluginDefinition[] = [
  LEDLifespanHUD,
  ImageResolutionHUD,
  ExampleExclusivePlugin,
  ExampleHUDPlugin,
]
