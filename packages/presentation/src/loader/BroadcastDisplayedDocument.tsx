import { memo, useEffect } from 'react'
import type { SanityDocument } from 'sanity'

import { useDisplayedDocumentBroadcaster } from './DisplayedDocumentBroadcaster'

/**
 * Sanity Form input component that reads the current form state and broadcasts it to
 * the live query store
 */
function BroadcastDisplayedDocument(props: {
  value: Partial<SanityDocument> | null | undefined
}): null {
  const setDisplayedDocument = useDisplayedDocumentBroadcaster()

  useEffect(
    () => setDisplayedDocument?.(props.value),
    [props.value, setDisplayedDocument],
  )

  return null
}

export default memo(BroadcastDisplayedDocument)
