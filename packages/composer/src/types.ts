export interface ComposerPluginOptions {
  name?: string
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
