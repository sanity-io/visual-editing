'use client'

import {OverlayExtensionDefinition} from '@sanity/visual-editing/react'
import {ExampleExclusiveExtension} from './example-exclusive'
import {ExampleHUDExtension} from './example-hud'
import {ImageResolutionHUD} from './image-res'
import {LEDLifespanHUD} from './led-lifespan'

export const extensions: OverlayExtensionDefinition[] = [
  LEDLifespanHUD,
  ImageResolutionHUD,
  ExampleExclusiveExtension,
  ExampleHUDExtension,
]
