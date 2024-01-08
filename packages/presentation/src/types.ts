import type { ClientPerspective, QueryParams } from '@sanity/client'
import type {
  PreviewUrlResolver,
  PreviewUrlResolverOptions,
} from '@sanity/preview-url-secret/define-preview-url'
import type { ComponentType } from 'react'
import type { Observable } from 'rxjs'
import type { DocumentStore, SanityClient } from 'sanity'

export type { PreviewUrlResolver, PreviewUrlResolverOptions }

export interface DocumentLocation {
  title: string
  href: string
}

export interface DocumentLocationsState {
  locations?: DocumentLocation[]
  message?: string
  tone?: 'positive' | 'caution' | 'critical'
}

export type DocumentLocationResolver = (
  params: { id: string; type: string },
  context: { documentStore: DocumentStore },
) =>
  | DocumentLocationsState
  | null
  | undefined
  | Observable<DocumentLocationsState | null | undefined>

export interface NavigatorOptions {
  minWidth?: number
  maxWidth?: number
  component: ComponentType
}

export type PreviewUrlOption =
  | string
  | PreviewUrlResolver<SanityClient>
  | PreviewUrlResolverOptions

export interface PresentationPluginOptions {
  devMode?: boolean | (() => boolean)
  icon?: ComponentType
  name?: string
  title?: string
  locate?: DocumentLocationResolver
  previewUrl: PreviewUrlOption
  components?: {
    unstable_navigator?: NavigatorOptions
  }
  unstable_showUnsafeShareUrl?: boolean
}

export interface PresentationStateParams {
  type?: string
  id?: string
  path?: string
}

export interface DeskDocumentPaneParams {
  inspect?: string
  path?: string
  rev?: string
  since?: string
  template?: string
  view?: string

  // assist
  pathKey?: string
  instruction?: string

  // comments
  comment?: string
}

export interface PresentationParams
  extends PresentationStateParams,
    DeskDocumentPaneParams {
  id?: string
  preview?: string
  perspective?: string
}

export type SetPresentationParams = (prev: PresentationParams) => void

/** @internal */
export type LiveQueriesState = Record<string, LiveQueriesStateValue>

/** @internal */
export interface LiveQueriesStateValue {
  query: string
  params: QueryParams
  perspective: ClientPerspective
  receivedAt: number
  /**
   * If false it means the query can't safely be garbage collected,
   * as older versions of @sanity/core-loader doesn't fire listen events
   * on an interval.
   */
  heartbeat: number | false
}
