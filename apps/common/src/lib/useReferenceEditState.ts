import {useEffect, useState} from 'react'
import {EMPTY, switchMap} from 'rxjs'
import {getPublishedId, useDocumentPreviewStore, useDocumentStore, type EditStateFor} from 'sanity'

export function useReferenceEditState(documentId?: string): EditStateFor | undefined {
  const documentStore = useDocumentStore()
  const previewStore = useDocumentPreviewStore()
  const [editState, setEditState] = useState<EditStateFor | undefined>()

  useEffect(() => {
    setEditState(undefined)

    if (!documentId) return undefined

    const type$ = previewStore.observeDocumentTypeFromId(documentId)
    const editState$ = type$.pipe(
      switchMap((type) => {
        if (!type) return EMPTY

        return documentStore.pair.editState(getPublishedId(documentId), type)
      }),
    )

    const sub = editState$.subscribe({next: setEditState})

    return () => sub.unsubscribe()
  }, [documentId, documentStore, previewStore])

  return editState
}
