import type {SanityClient} from '@sanity/client'
import {SanityEncoder, type Transaction} from '@sanity/mutate'
import {
  documentMutatorMachine,
  type DocumentMutatorMachineParentEvent,
} from '@sanity/mutate/_unstable_machine'
import {enqueueActions, fromPromise} from 'xstate'
import type {VisualEditingNode} from '../../types'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDocumentMutator = (comlink: VisualEditingNode) => {
  const fetchSnapshot = fromPromise(
    async ({input, signal}: {input: {id: string; client: SanityClient}; signal: AbortSignal}) => {
      const {id} = input
      const {snapshot} = await comlink.fetch(
        'visual-editing/fetch-snapshot',
        {documentId: id},
        {
          signal,
        },
      )
      return snapshot
    },
  )

  const submitMutations = fromPromise(
    async ({input}: {input: {client: SanityClient; transactions: Transaction[]}}) => {
      const {transactions} = input
      for (const transaction of transactions) {
        const data = SanityEncoder.encodeTransaction(transaction)
        return comlink.post('visual-editing/mutate', data)
      }
    },
  )

  return documentMutatorMachine.provide({
    actions: {
      'send sync event to parent': enqueueActions(({enqueue}) => {
        // Original action provided by the `documentMutatorMachine`
        enqueue.sendParent(
          ({context}) =>
            ({
              type: 'sync',
              id: context.id,
              document: context.remote!,
            }) satisfies DocumentMutatorMachineParentEvent,
        )
        // Additional action so that we can determine when the snapshot is ready
        enqueue.emit(({context}) => ({type: 'ready', snapshot: context.local}))
      }),
    },
    actors: {
      'fetch remote snapshot': fetchSnapshot,
      'submit mutations as transactions': submitMutations,
    },
  })
}
