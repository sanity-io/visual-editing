import type {SanityClient} from '@sanity/client'
import {SanityEncoder, type Transaction} from '@sanity/mutate'
import {documentMutatorMachine} from '@sanity/mutate/_unstable_machine'
import {fromPromise} from 'xstate'
import type {VisualEditingNode} from '../../types'
import {datasetMutatorMachine} from '../optimistic-state/machines/datasetMutatorMachine'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDatasetMutator = (comlink: VisualEditingNode) => {
  const fetchSnapshot = fromPromise(
    async ({input, signal}: {input: {id: string; client: SanityClient}; signal: AbortSignal}) => {
      const {id} = input
      const {snapshot} = await comlink.fetch(
        {
          type: 'visual-editing/fetch-snapshot',
          data: {documentId: id},
        },
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
        return comlink.post({type: 'visual-editing/mutate', data})
      }
    },
  )

  const datasetMutatorMachineWithComlink = datasetMutatorMachine.provide({
    actors: {
      documentMutatorMachine: documentMutatorMachine.provide({
        actors: {
          'fetch remote snapshot': fetchSnapshot,
          'submit mutations as transactions': submitMutations,
        },
      }),
    },
  })

  return datasetMutatorMachineWithComlink
}
