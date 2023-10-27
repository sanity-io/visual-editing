import { createContext } from 'react'

import { PagesParams } from './types'

export const PagesParamsContext = createContext<PagesParams | null>(null)
