import {createDataAttribute} from '@sanity/visual-editing-csm'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {createOverlayController} from './controller'
import type {OverlayController, OverlayMsg} from './types'

const sanityAttr = createDataAttribute({
  id: 'project-bravo',
  type: 'project',
  path: 'title',
  baseUrl: '/studio',
}).toString()

const observed = new Set<Element>()
let ioCallback: IntersectionObserverCallback | undefined

function activateObserved() {
  ioCallback?.(
    [...observed].map(
      (target) =>
        ({
          target,
          isIntersecting: true,
        }) as IntersectionObserverEntry,
    ),
    {} as IntersectionObserver,
  )
}

function messagesOfType(messages: OverlayMsg[], type: OverlayMsg['type']) {
  return messages.filter((message) => message.type === type)
}

describe('createOverlayController click interception', () => {
  const mounted: HTMLElement[] = []
  const controllers: OverlayController[] = []
  let messages: OverlayMsg[]

  beforeEach(() => {
    observed.clear()
    ioCallback = undefined
    messages = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = (el: Element) => {
          observed.add(el)
        }
        unobserve = (el: Element) => {
          observed.delete(el)
        }
        disconnect = () => {
          observed.clear()
        }
        constructor(callback: IntersectionObserverCallback) {
          ioCallback = callback
        }
      },
    )
    if (!document.fonts) {
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: {ready: Promise.resolve()},
      })
    }
  })

  afterEach(() => {
    for (const controller of controllers) {
      controller.destroy()
    }
    controllers.length = 0
    for (const el of mounted) {
      el.remove()
    }
    mounted.length = 0
    vi.unstubAllGlobals()
  })

  function mountController(inFrame = true) {
    const overlayElement = document.createElement('div')
    document.body.appendChild(overlayElement)
    mounted.push(overlayElement)

    const controller = createOverlayController({
      handler: (message) => messages.push(message),
      overlayElement,
      inFrame,
      inPopUp: false,
      optimisticActorReady: true,
    })

    activateObserved()
    controllers.push(controller)
    return controller
  }

  function mountLink() {
    const link = document.createElement('a')
    link.href = '/projects/project-bravo'
    link.textContent = 'Project Bravo'
    link.dataset['sanity'] = sanityAttr
    document.body.appendChild(link)
    mounted.push(link)
    return link
  }

  function hover(el: HTMLElement) {
    el.dispatchEvent(new MouseEvent('mousemove', {bubbles: true, cancelable: true}))
  }

  test('hovered iframe click activates the overlay and blocks navigation', () => {
    const link = mountLink()
    mountController(true)
    hover(link)

    const onBubble = vi.fn()
    link.addEventListener('click', onBubble)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0})
    link.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(onBubble).not.toHaveBeenCalled()
    expect(messagesOfType(messages, 'element/click')).toHaveLength(1)
  })

  test.each([
    {altKey: true},
    {metaKey: true},
    {ctrlKey: true},
    {shiftKey: true},
  ] satisfies MouseEventInit[])('does not intercept a hovered click with %o', (init) => {
    const link = mountLink()
    mountController(true)
    hover(link)

    const onBubble = vi.fn()
    link.addEventListener('click', onBubble)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0, ...init})
    link.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(onBubble).toHaveBeenCalledTimes(1)
    expect(messagesOfType(messages, 'element/click')).toHaveLength(0)
  })

  test('does not intercept once overlays are deactivated', () => {
    const link = mountLink()
    const controller = mountController(true)
    hover(link)
    controller.deactivate()

    const onBubble = vi.fn()
    link.addEventListener('click', onBubble)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0})
    link.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(onBubble).toHaveBeenCalledTimes(1)
    expect(messagesOfType(messages, 'element/click')).toHaveLength(0)
  })

  test('does not cancel mousedown on a hovered link', () => {
    const link = mountLink()
    mountController(true)
    hover(link)

    const event = new MouseEvent('mousedown', {bubbles: true, cancelable: true, button: 0})
    link.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  test('does not block navigation when the overlay is not hovered', () => {
    const link = mountLink()
    mountController(true)

    const onBubble = vi.fn()
    link.addEventListener('click', onBubble)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0})
    link.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(onBubble).toHaveBeenCalledTimes(1)
    expect(messagesOfType(messages, 'element/click')).toHaveLength(0)
  })
})
