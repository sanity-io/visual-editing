import {expect, test} from 'vitest'

import type {ElementState} from '../../types'

import {orderSanityNodesByPosition} from '../orderSanityNodesByPosition'

function makeElement(
  overrides: Partial<ElementState> & {
    rect: {x: number; y: number}
    sanity: ElementState['sanity']
  },
): ElementState {
  return {
    id: 'element-id',
    activated: false,
    element: document.createElement('div') as unknown as ElementState['element'],
    focused: false,
    hovered: false,
    dragDisabled: false,
    targets: [],
    elementType: 'element',
    rect: {w: 100, h: 50, ...overrides.rect},
    ...overrides,
  }
}

function makeSanityNode(id: string): ElementState['sanity'] {
  return {
    id,
    baseUrl: '/studio',
    path: 'title',
    type: 'article',
  }
}

function makeStegaNode(): ElementState['sanity'] {
  return {
    origin: 'sanity.io',
    href: '/studio',
  }
}

test('sorts elements by rect.y ascending then rect.x ascending', () => {
  const elements = [
    makeElement({rect: {x: 100, y: 300}, sanity: makeSanityNode('doc-c')}),
    makeElement({rect: {x: 50, y: 100}, sanity: makeSanityNode('doc-a')}),
    makeElement({rect: {x: 200, y: 100}, sanity: makeSanityNode('doc-b')}),
  ]

  const result = orderSanityNodesByPosition(elements)

  expect(result.map((node) => node.id)).toEqual(['doc-a', 'doc-b', 'doc-c'])
})

test('collapses duplicate ids to the topmost occurrence', () => {
  const elements = [
    makeElement({rect: {x: 0, y: 200}, sanity: makeSanityNode('doc-shared')}),
    makeElement({rect: {x: 0, y: 50}, sanity: makeSanityNode('doc-top')}),
    makeElement({rect: {x: 0, y: 100}, sanity: makeSanityNode('doc-shared')}),
  ]

  const result = orderSanityNodesByPosition(elements)

  expect(result.map((node) => node.id)).toEqual(['doc-top', 'doc-shared'])
})

test('filters out elements without a sanity id (stega nodes)', () => {
  const elements = [
    makeElement({rect: {x: 0, y: 200}, sanity: makeSanityNode('doc-b')}),
    makeElement({rect: {x: 0, y: 50}, sanity: makeStegaNode()}),
    makeElement({rect: {x: 0, y: 100}, sanity: makeSanityNode('doc-a')}),
  ]

  const result = orderSanityNodesByPosition(elements)

  expect(result.map((node) => node.id)).toEqual(['doc-a', 'doc-b'])
})

test('does not mutate the original elements array', () => {
  const elements = [
    makeElement({rect: {x: 0, y: 200}, sanity: makeSanityNode('doc-b')}),
    makeElement({rect: {x: 0, y: 100}, sanity: makeSanityNode('doc-a')}),
  ]
  const original = [...elements]

  orderSanityNodesByPosition(elements)

  expect(elements).toEqual(original)
})
