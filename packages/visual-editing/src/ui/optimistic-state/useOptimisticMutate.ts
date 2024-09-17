import {type Mutation} from '@sanity/mutate'
import {useCallback} from 'react'
import {getDraftId} from '../../util/documents'
import {isEmptyActor} from './context'
import {useOptimisticActor} from './useOptimisticActor'

export type OptimisticMutate = (
  documentId: string,
  mutations: Mutation[],
  options?: {commit?: boolean},
) => void

export function useOptimisticMutate(): OptimisticMutate {
  const actor = useOptimisticActor()

  const mutate = useCallback<OptimisticMutate>(
    (documentId, mutations, options) => {
      if (isEmptyActor(actor)) {
        const inFrame = window.self !== window.top || window.opener
        if (inFrame) {
          // eslint-disable-next-line no-console
          console.warn('useOptimisticMutate called with empty actor')
        }
        return
      }

      const {commit = true} = options || {}

      const doc = actor.getSnapshot().context.documents[getDraftId(documentId)]
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

  return mutate
}
