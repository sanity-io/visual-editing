import type { ComponentType } from 'react'
import type { Observable } from 'rxjs'
import type { DocumentStore, SanityClient } from 'sanity'

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

export interface PreviewUrlResolverContext {
  client: SanityClient
  /**
   * A generated secret, used by `@sanity/preview-url-secret` to verify
   * that the application can securily preview draft content server side.
   * https://nextjs.org/docs/app/building-your-application/configuring/draft-mode
   */
  previewUrlSecret: string
}

/**
 * Resolve a preview URL asynchronously, it's only called on first render.
 * It receives the current `presentationParams` and a `previewUrlSecret`, but it won't be called
 * again if this context changes.
 */
export type PreviewUrlResolver = (
  context: PreviewUrlResolverContext,
) => Promise<string>

export interface PresentationPluginOptions {
  devMode?: boolean | (() => boolean)
  icon?: ComponentType
  name?: string
  title?: string
  locate?: DocumentLocationResolver
  previewUrl: string | PreviewUrlResolver
  components?: {
    unstable_navigator?: NavigatorOptions
  }
}

export interface PresentationStateParams {
  type?: string
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
