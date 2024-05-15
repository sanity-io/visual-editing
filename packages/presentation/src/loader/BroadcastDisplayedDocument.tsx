import {memo, useEffect} from 'react'
import type {SanityDocument} from 'sanity'

import {useDocumentPane} from '../internals'
import type {PresentationParams} from '../types'
import {usePresentationParams} from '../usePresentationParams'
import {
  type SetDisplayedDocument,
  useDisplayedDocumentBroadcaster,
} from './DisplayedDocumentBroadcaster'

/**
 * Sanity Form input component that reads the current form state and broadcasts it to
 * the live query store
 */
function BroadcastDisplayedDocument(props: {
  value: Partial<SanityDocument> | null | undefined
}): JSX.Element | null {
  const setDisplayedDocument = useDisplayedDocumentBroadcaster()
  const params = usePresentationParams(false)

  useEffect(() => {
    if (params?.perspective !== 'published') {
      const timeout = setTimeout(() => setDisplayedDocument?.(props.value), 10)
      return () => clearTimeout(timeout)
    }
    return
  }, [params?.perspective, props.value, setDisplayedDocument])

  if (params?.perspective === 'published') {
    return (
      <BroadcastPublishedDocument
        params={params}
        setDisplayedDocument={setDisplayedDocument}
        value={props.value}
      />
    )
  }

  return null
}

export default memo(BroadcastDisplayedDocument)

function BroadcastPublishedDocument(props: {
  params: PresentationParams
  setDisplayedDocument: SetDisplayedDocument | null
  value: Partial<SanityDocument> | null | undefined
}) {
  const {params, setDisplayedDocument, value} = props
  const {editState} = useDocumentPane()

  useEffect(() => {
    if ((editState?.published && !params?.prefersLatestPublished) || !editState?.published) {
      const timeout = setTimeout(() => setDisplayedDocument?.(value), 100)
      return () => clearTimeout(timeout)
    }
    return
  }, [editState?.published, params?.prefersLatestPublished, setDisplayedDocument, value])

  return null
}
