import {assertEvent, assign, enqueueActions, setup} from 'xstate'

export const connectionMachine = setup({
  types: {} as {
    context: {
      id: string
      status: 'idle' | 'connecting' | 'connected' | 'disconnected'
      lastTick: Date
      runningCount: number
      perSecond: number
    }

    events: {type: 'message'; event: {to: string; from: string; type: string}}
    input: {
      id: string
    }
  },
  actions: {
    'track activity': enqueueActions(({context, enqueue, event}) => {
      assertEvent(event, 'message')
      const {type} = event.event
      if (type === 'handshake/syn') return
      const now = new Date()
      const diff = now.getTime() - context.lastTick.getTime()
      if (diff > 1000) {
        enqueue.assign({lastTick: now, runningCount: 0, perSecond: context.runningCount})
        context.lastTick = now
      } else {
        enqueue.assign({runningCount: context.runningCount + 1})
      }
    }),
    'update status': assign({
      status: ({context, event}) => {
        assertEvent(event, 'message')
        const {type} = event.event
        if (
          type === 'channel/response' ||
          type === 'channel/heartbeat' ||
          type === 'handshake/ack'
        ) {
          return 'connected'
        }
        if (type === 'handshake/syn') {
          return 'connecting'
        }
        return context.status
      },
    }),
  },
}).createMachine({
  initial: 'listening',
  context: ({input}) => ({
    id: input.id,
    status: 'idle',
    lastTick: new Date(),
    runningCount: 0,
    perSecond: 0,
  }),
  states: {
    listening: {
      on: {
        message: {
          actions: ['update status', 'track activity'],
        },
      },
    },
  },
})
