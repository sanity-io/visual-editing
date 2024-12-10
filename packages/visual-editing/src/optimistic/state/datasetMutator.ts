/**
 * The logic here is intended to live inside a preview iframe, and listen to events from the parent frame.
 * It also supports running in a "detached" mode, where it has to setup authenticated EventSource conenctions and perform data fetching itself.
 */

import {type SanityClient} from '@sanity/client'
import {
  createSharedListener,
  documentMutatorMachine,
  type DocumentMutatorMachineInput,
  type DocumentMutatorMachineParentEvent,
} from '@sanity/mutate/_unstable_machine'
import {assertEvent, assign, emit, setup, stopChild, type ActorRefFrom} from 'xstate'
import type {VisualEditingNode} from '../../types'
import {createDocumentMutator} from './documentMutator'

export interface DatasetMutatorMachineInput extends Omit<DocumentMutatorMachineInput, 'id'> {
  client: SanityClient
  /** A shared listener can be provided, if not it'll be created using `client.listen()` */
  sharedListener?: ReturnType<typeof createSharedListener>
}

export const datasetMutatorMachine = setup({
  types: {} as {
    context: {
      client: SanityClient
      /** A shared listener can be provided, if not it'll be created using `client.listen()` */
      sharedListener?: ReturnType<typeof createSharedListener>
      documents: Record<string, ActorRefFrom<ReturnType<typeof createDocumentMutator>>>
    }
    events:
      | {type: 'observe'; documentId: string}
      | {type: 'unobserve'; documentId: string}
      | {type: 'add document actor'; documentId: string}
      | {type: 'stop document actor'; documentId: string}
      | DocumentMutatorMachineParentEvent
    input: DatasetMutatorMachineInput
    emitted: DocumentMutatorMachineParentEvent
  },
  actions: {
    'emit sync event': emit(({event}) => {
      assertEvent(event, 'sync')
      return event
    }),
    'emit mutation event': emit(({event}) => {
      assertEvent(event, 'mutation')
      return event
    }),
    'emit rebased event': emit(({event}) => {
      assertEvent(event, ['rebased.local', 'rebased.remote'])
      return event
    }),
    'emit pristine event': emit(({event}) => {
      assertEvent(event, ['pristine'])
      return event
    }),
    'add document actor': assign({
      documents: ({context, event, spawn}) => {
        assertEvent(event, 'observe')
        const id = event.documentId
        // Adding the same documentId multiple times is a no-op
        if (context.documents[id]) return context.documents
        return {
          ...context.documents,
          [id]: spawn('documentMutatorMachine', {
            input: {
              id,
              client: context.client,
              sharedListener: context.sharedListener || createSharedListener(context.client),
            },
            id,
          }),
        }
      },
    }),
    'stop remote snapshot': stopChild(({context, event}) => {
      assertEvent(event, 'unobserve')
      return context.documents[event.documentId]!
    }),
    'remove remote snapshot from context': assign({
      documents: ({context, event}) => {
        assertEvent(event, 'unobserve')
        // Removing a non-existing documentId is a no-op
        if (!context.documents[event.documentId]) return context.documents
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {[event.documentId]: _, ...documents} = context.documents
        return documents
      },
    }),
  },
  actors: {
    documentMutatorMachine,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BjAhsgIhgrgLZgB2ALgMTICWsZpA2gAwC6ioADqrNWdaiXYgAHogC0ADgBMAOgkA2ACyKArBICcTdfKXSANCACeiFQHYZpgMxWV800yYqp6gIyn5AXw8G0WXAWJyCnwSGjpGViEuHj4BIVEEKUt5OSlFU1smFwkFW0sDY0T1GRUXRXkXKVN7HSYJJkUvHwxsPHQiUjIZDgAnWj4SMApCfDJMemY2JBBo3n5BaYSXeVlbKRUsiXdFSxcXfKNERSqZTbr1zVMJNyaQX1aAzpkIah6yQwp0VEJCXkmo7hzOKLRDLFwyFxaSzXKTOKQudSKCQFRDOczqCSWJjwjbHCQqRFebwgEioCBwIT3fztQJkAExebxcQuFEIZaWGRIrF7dSXKTyFSNYlUtodcjdPp0aiDelAhagBLpVmWAmc46mNwSZTyLQuFS3EWPcUvN6FTiA2LykSoq6c6wbCqVUzparKioyRFVfkq1zqNSWIkeIA */
  id: 'dataset-mutator',
  context: ({input}) => ({
    documents: {},
    client: input.client,
    sharedListener: input.sharedListener,
  }),

  on: {
    'sync': {actions: ['emit sync event']},
    'mutation': {actions: ['emit mutation event']},
    'rebased.*': {actions: ['emit rebased event']},
    'pristine': {actions: ['emit pristine event']},
    'observe': {
      actions: ['add document actor'],
    },
    'unobserve': {
      actions: ['stop remote snapshot', 'remove remote snapshot from context'],
    },
  },

  initial: 'pristine',

  states: {
    pristine: {},
  },
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDatasetMutator = (comlink: VisualEditingNode) => {
  return datasetMutatorMachine.provide({
    actors: {
      documentMutatorMachine: createDocumentMutator(comlink),
    },
  })
}
