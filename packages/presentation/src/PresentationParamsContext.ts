import {createContext} from 'react'

import type {PresentationParams} from './types'

export const PresentationParamsContext = createContext<PresentationParams | null>(null)
