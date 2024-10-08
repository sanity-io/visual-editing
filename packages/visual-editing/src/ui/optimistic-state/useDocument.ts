import type {SanityDocument} from '@sanity/client'
import {useSelector} from '@xstate/react'
import {getDraftId} from '../../util/documents'
import {type MutatorActor} from './context'
import {useOptimisticActor} from './useOptimisticActor'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDocument<T extends Record<string, any> = Record<string, any>>(
  id: string,
): SanityDocument<T> | undefined {
  const actor = useOptimisticActor() as MutatorActor
  const document = useSelector(actor, (snapshot) => snapshot.context?.documents[getDraftId(id)])
  // @ts-expect-error - @todo update typings
  return useSelector(document, (snapshot) => snapshot?.context?.local) || undefined
}
