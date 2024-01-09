import type { ClientPerspective } from '@sanity/client'
import isEqual from 'fast-deep-equal'
import { useCallback, useMemo, useState } from 'react'

export type DocumentOnPage = {
  _id: string
  _type: string
}

let warnedAboutCrossDatasetReference = false

export function useDocumentsOnPage(
  perspective: ClientPerspective,
): [
  DocumentOnPage[],
  (perspective: ClientPerspective, state: DocumentOnPage[]) => void,
] {
  if (perspective !== 'published' && perspective !== 'previewDrafts') {
    throw new Error(`Invalid perspective: ${perspective}`)
  }

  const [published, setPublished] = useState<Record<string, DocumentOnPage>>({})
  const [previewDrafts, setPreviewDrafts] = useState<
    Record<string, DocumentOnPage>
  >({})

  const setDocumentsOnPage = useCallback(
    (perspective: ClientPerspective, sourceDocuments: DocumentOnPage[]) => {
      const documents = sourceDocuments.filter((sourceDocument) => {
        if ('_projectId' in sourceDocument && sourceDocument._projectId) {
          // @TODO Handle cross dataset references
          if (!warnedAboutCrossDatasetReference) {
            // eslint-disable-next-line no-console
            console.warn(
              'Cross dataset references are not supported yet, ignoring source document',
              sourceDocument,
            )
            warnedAboutCrossDatasetReference = true
          }
          return false
        }
        return sourceDocument
      })

      const setCache =
        perspective === 'published' ? setPublished : setPreviewDrafts

      setCache((prev) => {
        const next: Record<string, DocumentOnPage> = {}
        for (const document of documents) {
          next[document._id] = document
        }
        return isEqual(prev, next) ? prev : next
      })
    },
    [],
  )

  const documentsOnPage = useMemo(() => {
    return perspective === 'published'
      ? [...Object.values(published)]
      : [...Object.values(previewDrafts)]
  }, [perspective, previewDrafts, published])

  return [documentsOnPage, setDocumentsOnPage]
}
