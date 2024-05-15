import {
  type Dispatch,
  type FunctionComponent,
  type PropsWithChildren,
  type SetStateAction,
} from 'react'
import type {Path, SanityDocument} from 'sanity'

import {ContentEditor} from './editor/ContentEditor'
import {type CommentIntentGetter, CommentsIntentProvider} from './internals'
import {DisplayedDocumentBroadcasterProvider} from './loader/DisplayedDocumentBroadcaster'
import {Panel} from './panels/Panel'
import {PanelResizer} from './panels/PanelResizer'
import type {MainDocumentState, PresentationParams, StructureDocumentPaneParams} from './types'

export interface PresentationContentProps {
  mainDocumentState: MainDocumentState | undefined
  params: PresentationParams
  documentsOnPage: {_id: string; _type: string}[]
  getCommentIntent: CommentIntentGetter
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  setDisplayedDocument: Dispatch<SetStateAction<Partial<SanityDocument> | null | undefined>>
  structureParams: StructureDocumentPaneParams
}

const PresentationContentWrapper: FunctionComponent<
  PropsWithChildren<{
    documentId?: string
    getCommentIntent: CommentIntentGetter
    setDisplayedDocument: Dispatch<SetStateAction<Partial<SanityDocument> | null | undefined>>
  }>
> = (props) => {
  const {documentId, setDisplayedDocument, getCommentIntent} = props
  return (
    <>
      <PanelResizer order={4} />
      <Panel id="content" minWidth={325} order={5}>
        <DisplayedDocumentBroadcasterProvider
          documentId={documentId}
          setDisplayedDocument={setDisplayedDocument}
        >
          <CommentsIntentProvider getIntent={getCommentIntent}>
            {props.children}
          </CommentsIntentProvider>
        </DisplayedDocumentBroadcasterProvider>
      </Panel>
    </>
  )
}

export const PresentationContent: FunctionComponent<PresentationContentProps> = (props) => {
  const {
    documentsOnPage,
    getCommentIntent,
    mainDocumentState,
    onFocusPath,
    onStructureParams,
    params,
    setDisplayedDocument,
    structureParams,
  } = props

  return (
    <PresentationContentWrapper
      documentId={params.id}
      getCommentIntent={getCommentIntent}
      setDisplayedDocument={setDisplayedDocument}
    >
      <ContentEditor
        documentId={params.id}
        documentType={params.type}
        mainDocumentState={mainDocumentState}
        onFocusPath={onFocusPath}
        onStructureParams={onStructureParams}
        previewUrl={params.preview}
        refs={documentsOnPage}
        structureParams={structureParams}
      />
    </PresentationContentWrapper>
  )
}
