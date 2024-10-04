import type {SanityDocument} from '@sanity/client'
import type {StudioPathLike} from '@sanity/client/csm'
import {type Mutation} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {useCallback} from 'react'
import {getDraftId} from '../../util/documents'
import type {MutatorActor} from './context'
import {isEmptyActor} from './context'
import {useOptimisticActor} from './useOptimisticActor'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocumentGet = <T extends Record<string, any>>(
  id: string,
  path?: StudioPathLike,
) => {id: string; snapshot: SanityDocument<T>}

export type DocumentMutate = (
  documentId: string,
  mutations: Mutation[],
  options?: {commit?: boolean},
) => void

export function useDocuments(): {
  get: DocumentGet
  mutate: DocumentMutate
} {
  const actor = useOptimisticActor() as MutatorActor

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDocument = <T extends Record<string, any> = Record<string, any>>(
    id: string,
    path?: StudioPathLike,
  ) => {
    const _id = getDraftId(id)
    const doc = actor.getSnapshot().context.documents[_id]
    const snapshot = doc?.getSnapshot().context.local

    if (!doc || !snapshot) {
      throw new Error(`Document with id "${id}" not found`)
    }

    return {id: _id, snapshot: path ? get(snapshot, path) : snapshot} as {
      id: string
      snapshot: SanityDocument<T>
    }
  }

  const mutateDocument = useCallback<DocumentMutate>(
    (documentId, mutations, options) => {
      const {commit = true} = options || {}

      if (isEmptyActor(actor)) {
        const inFrame = window.self !== window.top || window.opener
        if (inFrame) {
          throw new Error('Cannot mutate in this context')
        }
        return
      }

      const doc = actor.getSnapshot().context.documents[getDraftId(documentId)]

      if (!doc) {
        throw new Error(`Document with id "${documentId}" not found`)
      }

      doc?.send({
        type: 'mutate',
        mutations: mutations,
      })

      if (commit) {
        doc?.send({type: 'submit'})
      }
    },
    [actor],
  )

  return {get: getDocument, mutate: mutateDocument}
}
