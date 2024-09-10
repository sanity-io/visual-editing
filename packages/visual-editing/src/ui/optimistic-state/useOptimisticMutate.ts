import {type Mutation} from '@sanity/mutate'
import {useCallback, useContext} from 'react'

import {OptimisticStateContext} from './OptimisticStateContext'

export type OptimisticMutate = (mutations: Mutation[], options?: {commit?: boolean}) => void

export function useOptimisticMutate(): OptimisticMutate {
  const context = useContext(OptimisticStateContext)

  if (context === null) {
    throw new Error('useOptimisticMutate must be used within an OptimisticStateProvider')
  }

  const {datastore} = context

  const mutate = useCallback<OptimisticMutate>(
    (mutations, options) => {
      const {commit = true} = options || {}
      datastore.mutate(mutations)
      if (commit) {
        datastore.submit()
      }
    },
    [datastore],
  )

  return mutate
}
