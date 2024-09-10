import get from 'lodash.get'
import {useMemo} from 'react'

import {useOptimisticStateStore} from './useOptimisticStateStore'

export const useOptimisticStateSelector = <U, V>(
  node: {
    id: string
    path?: string | string[]
  },
  initial: U,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: (initial: U, optimistic: any) => V,
): V => {
  const {id, path = []} = node
  const documentMap = useOptimisticStateStore((state) => state.documents)

  return useMemo(() => {
    const document = documentMap.get(id)
    const optimistic = get(document, path)
    return transform ? transform(initial, optimistic) : optimistic || initial
  }, [documentMap, id, initial, path, transform])
}
