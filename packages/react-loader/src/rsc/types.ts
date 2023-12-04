import type { ClientPerspective } from '@sanity/client'

import { QueryStore as BaseQueryStore } from '../types'

export type * from '../types'

export type QueryStore = BaseQueryStore<LoadQueryOptions>

export interface LoadQueryOptions<T = 'next'> {
  /**
   * The perspective used to fetch the data, if not provided it'll assume 'published'
   */
  perspective?: ClientPerspective
  cache?: RequestInit['cache']
  next?: T extends keyof RequestInit ? RequestInit[T] : never
}

export type { BaseQueryStore }
