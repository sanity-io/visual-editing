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

export interface ComposerPluginOptions {
  name?: string
  icon?: ComponentType
  locate?: DocumentLocationResolver
  previewUrl: string
}

export interface ComposerStateParams {
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

export interface ComposerParams
  extends ComposerStateParams,
    DeskDocumentPaneParams {
  id?: string
  preview?: string
}

export type SetComposerParams = (prev: ComposerParams) => void
