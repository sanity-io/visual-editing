import { ClientPerspective } from '@sanity/client'
import { useCallback, useMemo, useState } from 'react'

export type DocumentOnPage = {
  _id: string
  _type: string
  _projectId?: string
  dataset?: string
}

export function useDocumentsOnPage(
  perspective: ClientPerspective,
): [
  DocumentOnPage[],
  (perspective: ClientPerspective, state: DocumentOnPage[]) => void,
] {
  const [state, setState] = useState<
    Record<ClientPerspective, Map<string, DocumentOnPage>>
  >(() => ({ published: new Map(), previewDrafts: new Map(), raw: new Map() }))

  const setDocumentsOnPage = useCallback(
    (perspective: ClientPerspective, documents: DocumentOnPage[]) => {
      setState((state) => {
        let changed = false
        let map = state[perspective]
        const getKey = (document: DocumentOnPage) => {
          return `${document._projectId}-${document.dataset}-${document._type}-${document._id}`
        }
        const knownKeys = new Set<ReturnType<typeof getKey>>()
        // Add anything new, and track all keys
        for (const document of documents) {
          const key = getKey(document)
          knownKeys.add(key)
          if (!map.has(key)) {
            map.set(key, document)
            changed = true
          }
        }
        // Remove anything that is no longer on the page
        for (const key of map.keys()) {
          if (!knownKeys.has(key)) {
            map.delete(key)
            changed = true
          }
        }

        if (changed) {
          map = new Map(map)
          return { ...state, [perspective]: new Map(map) }
        }

        return state
      })
    },
    [],
  )

  const documentsOnPageMap = useMemo(() => {
    return state[perspective]
  }, [perspective, state])

  const documentsOnPage = useMemo(() => {
    return [...documentsOnPageMap.values()]
  }, [documentsOnPageMap])

  return [documentsOnPage, setDocumentsOnPage]
}
