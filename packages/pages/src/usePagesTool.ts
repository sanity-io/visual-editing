import { useContext } from 'react'

import { PagesContext, PagesContextValue } from './PagesContext'

export function usePagesTool(): PagesContextValue {
  const pages = useContext(PagesContext)

  if (!pages) {
    throw new Error('Pages context is missing')
  }

  return pages
}
