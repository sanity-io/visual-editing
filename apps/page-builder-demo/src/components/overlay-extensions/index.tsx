'use client'

import {OverlayExtensionDefinition} from '@sanity/visual-editing/react'
import {ImageResolutionHUD} from './image-res'
import {ImageToolExtension} from './image-tool'
import {LEDLifespanHUD} from './led-lifespan'

export const extensions: OverlayExtensionDefinition[] = [
  LEDLifespanHUD,
  ImageResolutionHUD,
  ImageToolExtension,
]
