import type {SanityNode} from '@repo/visual-editing-helpers'
import {at, createIfNotExists, type Operation, patch} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {useCallback, useContext, useMemo} from 'react'

import {getDraftId} from '../../util/documents'
import {useOptimisticStateStore} from './optimisticState'
import {OptimisticStateContext} from './OptimisticStateContext'

export type OptimisticStateMutate = (
  operation: Operation,
  options: {
    commit?: boolean
    id?: string
    path?: string | string[]
    type?: string
  },
) => void
interface OptimisticState<T = unknown> {
  commit: () => void
  mutate: OptimisticStateMutate
  value: T | undefined
}

export function useOptimisticState<T>(sanity: SanityNode): OptimisticState<T> {
  const context = useContext(OptimisticStateContext)

  const draftId = useMemo(() => getDraftId(sanity.id), [sanity])

  if (context === null) {
    throw new Error('useOptimisticState must be used within an OptimisticStateProvider')
  }

  const {datastore} = context

  const commit = useCallback(() => {
    return datastore.submit()
  }, [datastore])

  const mutate = useCallback<OptimisticState<T>['mutate']>(
    (operation, options) => {
      const {
        commit = false,
        id = draftId,
        type = sanity.type!, // @todo check
        path = sanity.path,
      } = options
      const _path = Array.isArray(path) ? path : [path]
      const mutations = [createIfNotExists({_id: id, _type: type}), patch(id, at(_path, operation))]
      datastore.mutate(mutations)
      if (commit) {
        datastore.submit()
      }
    },
    [datastore, draftId, sanity.path, sanity.type],
  )

  const {documents} = useOptimisticStateStore()

  const value = useMemo(() => {
    const doc = documents.get(draftId)
    return get<T>(doc, sanity.path)
  }, [documents, draftId, sanity.path])

  return {commit, mutate, value}
}
