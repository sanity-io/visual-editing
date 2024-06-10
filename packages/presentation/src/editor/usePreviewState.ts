import {type SchemaType} from '@sanity/types'
import {useEffect, useState} from 'react'

import {
  getPreviewStateObservable,
  type PreviewValue,
  type SanityDocument,
  useDocumentPreviewStore,
} from '../internals'

interface PreviewState {
  isLoading?: boolean
  draft?: PreviewValue | Partial<SanityDocument> | null
  published?: PreviewValue | Partial<SanityDocument> | null
}

export default function usePreviewState(documentId: string, schemaType?: SchemaType): PreviewState {
  const documentPreviewStore = useDocumentPreviewStore()
  const [paneItemPreview, setPaneItemPreview] = useState<PreviewState>({})

  useEffect(() => {
    if (!schemaType) {
      return undefined
    }
    const subscription = getPreviewStateObservable(
      documentPreviewStore,
      schemaType,
      documentId,
      '',
    ).subscribe((state) => {
      setPaneItemPreview(state)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [documentPreviewStore, schemaType, documentId])

  return paneItemPreview
}
