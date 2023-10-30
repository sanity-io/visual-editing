import { ComponentType } from 'react'
import { Observable } from 'rxjs'
import { DocumentStore } from 'sanity'

export interface DocumentLocation {
  title: string
  href: string
}

export interface DocumentLocationsState {
  locations: DocumentLocation[]
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

export interface PagesPluginOptions {
  devMode?: boolean | (() => boolean)
  icon?: ComponentType
  name?: string
  title?: string
  locate?: DocumentLocationResolver
  previewUrl: string
  components?: {
    unstable_navigator?: NavigatorOptions
  }
}

export interface PagesStateParams {
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
}

export interface PagesParams extends PagesStateParams, DeskDocumentPaneParams {
  id?: string
  preview?: string
}

export type SetPagesParams = (prev: PagesParams) => void
