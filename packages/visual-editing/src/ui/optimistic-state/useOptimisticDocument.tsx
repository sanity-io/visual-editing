import type {SanityDocument} from '@sanity/client'
import {useSelector} from '@xstate/react'
import {getDraftId} from '../../util/documents'
import {type MutatorActor} from './context'
import {useOptimisticActor} from './useOptimisticActor'

// @todo: improve types
export function useOptimisticDocument(id: string): SanityDocument | undefined {
  const actor = useOptimisticActor() as MutatorActor
  const document = useSelector(actor, (snapshot) => snapshot.context?.documents[getDraftId(id)])
  return useSelector(document, (snapshot) => snapshot?.context?.local) || undefined
}
