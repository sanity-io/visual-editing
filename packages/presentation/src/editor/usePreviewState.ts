import {type SchemaType} from '@sanity/types'
import {useEffect, useState} from 'react'
import {
  getPreviewStateObservable,
  useDocumentPreviewStore,
  type PreviewValue,
  type SanityDocument,
} from '../internals'

interface PreviewState {
  isLoading?: boolean
  draft?: PreviewValue | Partial<SanityDocument> | null
  published?: PreviewValue | Partial<SanityDocument> | null
}

export default function usePreviewState(documentId: string, schemaType?: SchemaType): PreviewState {
  const documentPreviewStore = useDocumentPreviewStore()
  const [preview, setPreview] = useState<PreviewState>({})

  useEffect(() => {
    if (!schemaType) {
      return undefined
    }
    const subscription = getPreviewStateObservable(
      documentPreviewStore,
      // @ts-expect-error fix later
      schemaType,
      documentId,
      '',
    ).subscribe((state) => {
      setPreview(state)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [documentPreviewStore, schemaType, documentId])

  return preview
}
