import type {SanityNode, SanityStegaNode} from '@sanity/visual-editing'
import {decodeSanityNodeData} from '@sanity/visual-editing-csm'
import {testAndDecodeStega} from '@sanity/visual-editing/utils'
import {useMachine} from '@xstate/react'
import {assertEvent, assign, fromCallback, setup, type ActorRefFrom} from 'xstate'
import {connectionMachine} from './connectionMachine'

// Define mappings of HTML entities to their Unicode representations
const stegaEntityMap: Record<string, string> = {
  '&ZeroWidthSpace;': '\u200B', // Zero Width Space
  '&zwnj;': '\u200C', // Zero Width Non-Joiner
  '&#xFEFF;': '\uFEFF', // Byte Order Mark (BOM)
  '&zwj;': '\u200D', // Zero Width Joiner
}
const stegaEntities = Object.values(stegaEntityMap)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDoctorMachine = () => {
  const doctorMachine = setup({
    types: {} as {
      context: {
        connections: Map<string, ActorRefFrom<typeof connectionMachine>>
        dataAttributes: Map<Element, SanityNode | SanityStegaNode>
        incorrectStegaAttributes: Element[]
        stegaNodes: Map<Node, SanityNode | SanityStegaNode>
        visualEditingElement: Element | null
      }
      events:
        | {type: 'listen'; id: string}
        | {type: 'message'; event: {to: string; from: string; type: string}}
        | {type: 'mutations'; mutations: MutationRecord[]}
        | {type: 'set element'; element: Element | null}
        | {type: 'unlisten'; id: string}
    },
    actors: {
      connectionMachine,
      'monitor visual editing component': fromCallback(({sendBack}) => {
        const observer = new MutationObserver(([{addedNodes, removedNodes}]) => {
          addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as Element).tagName === 'SANITY-VISUAL-EDITING'
            ) {
              sendBack({type: 'set element', element: node as Element})
            }
          })
          removedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as Element).tagName === 'SANITY-VISUAL-EDITING'
            ) {
              sendBack({type: 'set element', element: null})
            }
          })
        })

        observer.observe(document.documentElement, {childList: true})

        return () => {
          observer.disconnect()
        }
      }),
      'listen for messages': fromCallback(({sendBack}) => {
        const handleMessages = (event: MessageEvent) => {
          if (event.data.domain === 'sanity/channels') {
            sendBack({
              type: 'message',
              event: {
                to: event.data.to,
                from: event.data.from,
                type: event.data.type,
              },
            })
          }
        }
        window.addEventListener('message', handleMessages)
        return () => {
          window.removeEventListener('message', handleMessages)
        }
      }),
      'listen for mutations': fromCallback(({sendBack}) => {
        const observer = new MutationObserver((mutations) => {
          sendBack({type: 'mutations', mutations})
        })
        observer.observe(document.body, {
          childList: true,
          attributes: true,
          subtree: true,
        })
        return () => {
          observer.disconnect()
        }
      }),
    },
    actions: {
      'check for data attributes': assign({
        dataAttributes: ({event}) => {
          assertEvent(event, 'mutations')
          const dataAttributes = document.querySelectorAll('[data-sanity]')
          const map = new Map<Element, SanityNode | SanityStegaNode>()
          for (const dataAttribute of dataAttributes) {
            const content = decodeSanityNodeData(dataAttribute.textContent || '')
            if (content) {
              map.set(dataAttribute, content)
            }
          }
          return map
        },
      }),
      'check for stega text nodes': assign({
        stegaNodes: ({event}) => {
          assertEvent(event, 'mutations')

          const map = new Map<Node, SanityNode | SanityStegaNode>()
          const stegaNodes: Node[] = []

          function scanNode(node: Node) {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.nodeValue || ''

              // Check if this text node contains any of the stegaEntities
              if (stegaEntities.some((entity) => text.includes(entity))) {
                stegaNodes.push(node)
                const foo = testAndDecodeStega(node.textContent || '')
                const bar = decodeSanityNodeData(foo || '')
                if (bar) {
                  map.set(node, bar)
                }
              }
            }

            // Traverse child nodes
            node.childNodes.forEach(scanNode)
          }

          // Start scanning from document body
          scanNode(document.body)
          return map
        },
      }),
      'check for incorrect stega attributes': assign({
        incorrectStegaAttributes: ({event}) => {
          assertEvent(event, 'mutations')
          const incorrectStegaAttributes: Element[] = []

          // Check all elements with class or src attributes
          document.body.querySelectorAll('[class], [src], [href]').forEach((element) => {
            const classValue = element.getAttribute('class')

            if (classValue) {
              if (stegaEntities.some((entity) => classValue.includes(entity))) {
                incorrectStegaAttributes.push(element)
                return
              }
            }

            const srcValue = element.getAttribute('src')
            if (srcValue) {
              if (stegaEntities.some((entity) => srcValue.includes(entity))) {
                incorrectStegaAttributes.push(element)
              }
            }

            const hrefValue = element.getAttribute('href')
            if (hrefValue) {
              if (stegaEntities.some((entity) => hrefValue.includes(entity))) {
                incorrectStegaAttributes.push(element)
              }
            }
          })
          return incorrectStegaAttributes
        },
      }),
      'spawn connection': assign({
        connections: ({context, spawn, event}) => {
          assertEvent(event, 'message')
          const {to} = event.event
          if (context.connections.has(to)) {
            return context.connections
          }
          const connections = new Map(context.connections)
          const connection = spawn('connectionMachine', {
            id: to,
            input: {
              id: to,
            },
          })
          connections.set(to, connection)
          return connections
        },
      }),
      'send message to connections': ({context, event}) => {
        assertEvent(event, 'message')
        context.connections.forEach((connection) => {
          const {to, from} = event.event
          if (connection.id === to || connection.id === from) {
            connection.send(event)
          }
        })
      },
      'set visual editing element': assign({
        visualEditingElement: ({event}) => {
          assertEvent(event, 'set element')
          return event.element
        },
      }),
    },
    guards: {},
  }).createMachine({
    id: 'doctor',
    context: () => {
      return {
        connections: new Map(),
        dataAttributes: new Map(),
        incorrectStegaAttributes: [],
        stegaNodes: new Map(),
        visualEditingElement: null,
      }
    },
    initial: 'diagnosing',
    states: {
      diagnosing: {
        invoke: [
          {
            src: 'monitor visual editing component',
          },
          {
            src: 'listen for mutations',
          },
          {
            src: 'listen for messages',
          },
        ],
        on: {
          'set element': {
            actions: 'set visual editing element',
          },
          'message': {
            actions: ['spawn connection', 'send message to connections'],
          },
          'mutations': {
            actions: [
              'check for data attributes',
              'check for stega text nodes',
              'check for incorrect stega attributes',
            ],
          },
        },
      },
    },
  })

  return doctorMachine
}

const doctorMachine = createDoctorMachine()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDoctorMachine = () => {
  const [state, send, actorRef] = useMachine(doctorMachine)
  return {state, send, actorRef}
}
