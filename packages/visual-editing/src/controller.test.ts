import {createDataAttribute} from '@sanity/visual-editing-csm'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {createOverlayController} from './controller'
import {setInterceptClicks} from './interceptClicks'
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
    setInterceptClicks(true)
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
    // Restore the module default (overlays start enabled)
    setInterceptClicks(true)
    vi.unstubAllGlobals()
  })

  function mountController(inFrame = true, shouldHideActions = true) {
    const overlayElement = document.createElement('div')
    document.body.appendChild(overlayElement)
    mounted.push(overlayElement)

    const controller = createOverlayController({
      handler: (message) => messages.push(message),
      overlayElement,
      inFrame,
      inPopUp: false,
      optimisticActorReady: true,
      shouldHideActions,
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

  test('does not intercept once overlays are toggled off', () => {
    // `preventDefault` is gated on `interceptClicks`, not merely `inFrame` or
    // the controller being activated.
    const link = mountLink()
    mountController(true)
    hover(link)
    setInterceptClicks(false)

    const onBubble = vi.fn()
    link.addEventListener('click', onBubble)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0})
    link.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(onBubble).toHaveBeenCalledTimes(1)
    expect(messagesOfType(messages, 'element/click')).toHaveLength(0)
  })

  test('does not cancel clicks when the Open in Studio action is shown', () => {
    const link = mountLink()
    mountController(true, false)
    hover(link)

    const onBubble = vi.fn()
    link.addEventListener('click', onBubble)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0})
    link.dispatchEvent(event)

    // Click-to-edit still reports the click, but navigation is not blocked
    expect(event.defaultPrevented).toBe(false)
    expect(onBubble).toHaveBeenCalledTimes(1)
    expect(messagesOfType(messages, 'element/click')).toHaveLength(1)
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

  test('clicks outside overlay UI blur the overlays', () => {
    mountController(true)

    document.body.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))

    expect(messagesOfType(messages, 'overlay/blur')).toHaveLength(1)
  })

  test('clicks on overlay UI elements do not blur the overlays', () => {
    mountController(true)

    // React renders the boolean JSX attribute as `data-sanity-overlay-element="true"`
    const overlayUi = document.createElement('div')
    overlayUi.setAttribute('data-sanity-overlay-element', 'true')
    document.body.appendChild(overlayUi)
    mounted.push(overlayUi)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true})
    overlayUi.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(messagesOfType(messages, 'overlay/blur')).toHaveLength(0)
  })

  test('userland capture overlay elements swallow the click', () => {
    mountController(true)

    // Userland can mark its own DOM with `data-sanity-overlay-element="capture"`
    const captureUi = document.createElement('div')
    captureUi.setAttribute('data-sanity-overlay-element', 'capture')
    document.body.appendChild(captureUi)
    mounted.push(captureUi)

    const event = new MouseEvent('click', {bubbles: true, cancelable: true})
    captureUi.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(messagesOfType(messages, 'overlay/blur')).toHaveLength(0)
  })
})
