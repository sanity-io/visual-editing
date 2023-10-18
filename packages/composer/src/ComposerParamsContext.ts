import { createContext } from 'react'

import { ComposerParams } from './types'

export const ComposerParamsContext = createContext<ComposerParams | null>(null)
