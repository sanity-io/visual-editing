import type {ClientPerspective, QueryParams} from '@sanity/client'
import type {
  PreviewUrlResolver,
  PreviewUrlResolverOptions,
} from '@sanity/preview-url-secret/define-preview-url'
import type {ComponentType} from 'react'
import type {Observable} from 'rxjs'
import type {DocumentStore, SanityClient} from 'sanity'

export type {PreviewUrlResolver, PreviewUrlResolverOptions}

export interface DocumentLocation {
  title: string
  href: string
}

export interface DocumentLocationsState {
  locations?: DocumentLocation[]
  message?: string
  tone?: 'positive' | 'caution' | 'critical'
}

export type DocumentLocationsStatus = 'empty' | 'resolving' | 'resolved'

export type DocumentLocationResolver = (
  params: {id: string; type: string},
  context: {documentStore: DocumentStore},
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

export type PreviewUrlOption = string | PreviewUrlResolver<SanityClient> | PreviewUrlResolverOptions

export type DocumentLocationResolvers = Record<
  string,
  DocumentLocationResolverObject | DocumentLocationsState
>

export type DocumentLocationResolverObject<K extends string = string> = {
  select: Record<K, string>
  resolve: (value: Record<K, any> | null) => DocumentLocationsState | null | undefined | void
}

export interface PathResolverParams {
  url: URL
  groups: string[]
}
export interface DocumentResolverContext {
  origin: string | undefined
  params: Record<string, string>
  path: string
}

export type ContextFn<T> = (context: DocumentResolverContext) => T

export type DocumentResolver =
  | {
      route: string | Array<string>
      type: string
      filter?: never
      params?: never
      resolve?: never
    }
  | {
      route: string | Array<string>
      type?: never
      filter: ContextFn<string> | string
      params?: ContextFn<Record<string, string>> | Record<string, string>
      resolve?: never
    }
  | {
      route: string | Array<string>
      type?: never
      filter?: never
      params?: never
      resolve: ContextFn<
        | {
            filter: string
            params?: Record<string, string>
          }
        | undefined
      >
    }

export interface PresentationPluginOptions {
  devMode?: boolean | (() => boolean)
  icon?: ComponentType
  name?: string
  title?: string
  /**
   * @deprecated use `resolve.locations` instead
   */
  locate?: DocumentLocationResolver
  resolve?: {
    mainDocuments?: DocumentResolver[]
    locations?: DocumentLocationResolvers | DocumentLocationResolver
  }
  previewUrl: PreviewUrlOption
  components?: {
    unstable_navigator?: NavigatorOptions
  }
  /**
   * @deprecated this feature flag is no longer needed
   */
  unstable_showUnsafeShareUrl?: boolean
}

export interface PresentationStateParams {
  type?: string
  id?: string
  path?: string
}

export interface StructureDocumentPaneParams {
  inspect?: string
  path?: string
  rev?: string
  since?: string
  template?: string
  templateParams?: string
  view?: string

  // assist
  pathKey?: string
  instruction?: string

  // comments
  comment?: string
}

export interface PresentationParams extends PresentationStateParams, StructureDocumentPaneParams {
  id?: string
  preview?: string
  perspective?: string
  viewport?: string
}

export interface PresentationSearchParams extends StructureDocumentPaneParams {
  preview?: string
  perspective?: string
  viewport?: string
}

export type PresentationNavigate = (
  nextState: PresentationStateParams,
  nextSearchState?: PresentationSearchParams,
  forceReplace?: boolean,
) => void

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

/** @internal */
export interface FrameState {
  title: string | undefined
  url: string | undefined
}

export interface MainDocument {
  _id: string
  _type: string
}

export interface MainDocumentState {
  path: string
  document: MainDocument | undefined
}
