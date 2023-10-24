import { ContentSourceMap } from '@sanity/client'

export type { ContentSourceMap }

export interface LiveModeState {
  enabled: boolean
  connected: boolean
  studioOrigin: string
}

export interface QueryStoreState<Response, Error> {
  loading: boolean
  error: Error | undefined
  data: Response | undefined
  sourceMap: ContentSourceMap | undefined
}
