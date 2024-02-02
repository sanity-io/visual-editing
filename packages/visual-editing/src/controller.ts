import { v4 as uuid } from 'uuid'

import type {
  _EventHandlers,
  _OverlayElement,
  _ResolvedElement,
  OverlayController,
  OverlayOptions,
} from './types'
import { findSanityNodes } from './util/findSanityNodes'
import { getRect } from './util/getRect'

/**
 * Creates a controller which dispatches overlay related events
 *
 * @param handler - Dispatched event handler
 * @param overlayElement - Parent element containing rendered overlay elements
 * @public
 */
export function createOverlayController({
  handler,
  overlayElement,
  preventDefault,
}: OverlayOptions): OverlayController {
  let activated = false
  // Map for getting element by ID
  const elementIdMap = new Map<string, HTMLElement>()
  // WeakMap for getting data by element
  const elementsMap = new WeakMap<HTMLElement, _OverlayElement>()
  // Set for iterating over elements
  const elementSet = new Set<HTMLElement>()
  // Weakmap keyed by measureElement to find associated element
  const measureElements = new WeakMap<HTMLElement, HTMLElement>()

  let ro: ResizeObserver
  let io: IntersectionObserver
  let mo: MutationObserver

  // The `hoverStack` is used as a container for tracking which elements are hovered at any time.
  // The browser supports hovering multiple nested elements simultanously, but we only want to
  // highlight the "outer most" element.
  //
  // This is how it works:
  // - Whenever the mouse enters an element, we add it to the stack.
  // - Whenever the mouse leaves an element, we remove it from the stack.
  //
  // When we want to know which element is currently hovered, we take the element at the top of the
  // stack. Since JavaScript does not have a Stack type, we use an array and take the last element.
  let hoverStack: HTMLElement[] = []
  const getHoveredElement = () =>
    hoverStack[hoverStack.length - 1] as HTMLElement | undefined

  function addEventHandlers(el: HTMLElement, handlers: _EventHandlers) {
    el.addEventListener('click', handlers.click, {
      capture: true,
    })
    // We listen for the initial mousemove event, in case the overlay is enabled whilst the cursor is already over an element
    // mouseenter and mouseleave listeners are attached within this handler
    el.addEventListener('mousemove', handlers.mousemove, {
      once: true,
      capture: true,
    })
    // Listen for mousedown in case we need to prevent default behavior
    el.addEventListener('mousedown', handlers.mousedown, {
      capture: true,
    })
  }

  function removeEventHandlers(el: HTMLElement, handlers: _EventHandlers) {
    el.removeEventListener('click', handlers.click, {
      capture: true,
    })
    el.removeEventListener('mousemove', handlers.mousemove, {
      capture: true,
    })
    el.removeEventListener('mousedown', handlers.mousedown, {
      capture: true,
    })
    el.removeEventListener('mouseenter', handlers.mouseenter)
    el.removeEventListener('mouseleave', handlers.mouseleave)
  }

  /**
   * Executed when element enters the viewport
   * Enables an element’s event handlers
   */
  function activateElement({
    id,
    elements,
    handlers,
    sanity,
  }: _OverlayElement) {
    const { element, measureElement } = elements
    addEventHandlers(element, handlers)
    ro.observe(measureElement)
    handler({
      type: 'element/activate',
      id,
      rect: getRect(element),
      sanity,
    })
  }

  /**
   * Executed when element leaves the viewport
   * Disables an element’s event handlers
   */
  function deactivateElement({ id, elements, handlers }: _OverlayElement) {
    const { element, measureElement } = elements
    removeEventHandlers(element, handlers)
    ro.unobserve(measureElement)
    // Scrolling from a hovered element will not trigger mouseleave event, so filter the stack
    hoverStack = hoverStack.filter((el) => el !== element)
    handler({
      type: 'element/deactivate',
      id,
    })
  }

  /**
   * Stores an element’s DOM node and decoded sanity data in state and sets up event handlers
   */
  function registerElement({ elements, sanity }: _ResolvedElement) {
    const { element, measureElement } = elements

    const eventHandlers: _EventHandlers = {
      click(event) {
        const target = event.target as HTMLElement | null
        if (element === getHoveredElement() && element.contains(target)) {
          if (preventDefault) {
            event.preventDefault()
            event.stopPropagation()
          }
          handler({
            type: 'element/click',
            id,
            sanity,
          })
        }
      },
      mousedown(event) {
        // prevent iframe from taking focus
        event.preventDefault()
      },
      mousemove(event) {
        eventHandlers.mouseenter(event)
        const el = event.currentTarget as HTMLElement | null
        if (el) {
          el.addEventListener('mouseenter', eventHandlers.mouseenter)
          el.addEventListener('mouseleave', eventHandlers.mouseleave)
        }
      },
      mouseenter() {
        hoverStack.push(element)
        handler({
          type: 'element/mouseenter',
          id,
          rect: getRect(element),
        })
      },
      mouseleave(e) {
        function leave() {
          hoverStack.pop()
          const hoveredElement = getHoveredElement()

          handler({
            type: 'element/mouseleave',
            id,
          })

          if (hoveredElement) {
            const overlayElement = elementsMap.get(hoveredElement)
            if (overlayElement) {
              handler({
                type: 'element/mouseenter',
                id: overlayElement.id,
                rect: getRect(hoveredElement),
              })
            }
          }
        }

        /**
         * If moving to an element within the overlay which handles pointer events, attach a new
         * event handler to that element and defer the original leave event
         */
        const { relatedTarget } = e
        const isInteractiveOverlayElement =
          relatedTarget instanceof HTMLElement &&
          overlayElement.contains(relatedTarget)

        if (isInteractiveOverlayElement) {
          const deferredLeave = () => {
            leave()
            relatedTarget.removeEventListener('mouseleave', deferredLeave)
          }
          relatedTarget.addEventListener('mouseleave', deferredLeave)
          return
        }

        leave()
      },
    }

    const id = uuid()
    const sanityNode = {
      id,
      elements,
      sanity,
      handlers: eventHandlers,
    }
    elementSet.add(element)
    measureElements.set(measureElement, element)
    elementIdMap.set(id, element)
    elementsMap.set(element, sanityNode)

    io.observe(element)
    ro.observe(measureElement)

    handler({
      type: 'element/register',
      id,
      rect: getRect(element),
      sanity,
    })

    activateElement(sanityNode)
  }

  function registerElements(node: HTMLElement | { childNodes: HTMLElement[] }) {
    const sanityNodes = findSanityNodes(node)
    for (const sanityNode of sanityNodes) {
      if (
        sanityNode.elements.element instanceof HTMLElement &&
        !elementsMap.has(sanityNode.elements.element)
      ) {
        registerElement(sanityNode)
      }
    }
  }

  function unregisterElement(element: HTMLElement) {
    const overlayElement = elementsMap.get(element)
    if (overlayElement) {
      const { id, handlers } = overlayElement
      removeEventHandlers(element, handlers)
      ro.unobserve(element)
      elementsMap.delete(element)
      elementSet.delete(element)
      elementIdMap.delete(id)
      handler({
        type: 'element/unregister',
        id,
      })
    }
  }

  // Mutations
  function handleMutation(mutations: MutationRecord[]) {
    const needsUpdate = !!mutations.filter((mutation) => {
      const node: Node | null = mutation.target

      // Ignore overlay elements and container
      if (node === overlayElement || overlayElement.contains(node)) {
        return false
      }

      if (node instanceof HTMLElement) {
        if (elementsMap.has(node)) {
          const sanityNodes = findSanityNodes({ childNodes: [node] })
          // Check existing nodes are still valid
          if (!sanityNodes.length) {
            unregisterElement(node)
          }
        } else {
          registerElements({ childNodes: [node] })
        }
      }

      return true
    }).length

    if (needsUpdate) {
      for (const element of elementSet) {
        if (element.isConnected) {
          updateRect(element)
        } else {
          unregisterElement(element)
        }
      }
    }
  }

  /**

   * Dispatches an event containing the size and position (rect) of an element
   * @param el - Element to dispatch rect information for
   */
  function updateRect(el: HTMLElement) {
    const overlayElement = elementsMap.get(el)
    if (overlayElement) {
      handler({
        type: 'element/updateRect',
        id: overlayElement.id,
        rect: getRect(el),
      })
    }
  }

  function handleResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const target = entry.target

      if (target instanceof HTMLElement) {
        const element = measureElements.get(target)
        if (!element) return
        updateRect(element)
      }
    }
  }

  function handleIntersection(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const { target } = entry
      const match = target instanceof HTMLElement && elementsMap.get(target)
      if (!match) continue
      if (entry.isIntersecting) {
        activateElement(match)
      } else {
        deactivateElement(match)
      }
    }
  }

  function handleBlur() {
    hoverStack = []
    handler({
      type: 'overlay/blur',
    })
  }

  function handleWindowResize() {
    for (const element of elementSet) {
      updateRect(element)
    }
  }

  function handleWindowScroll(event: Event) {
    const { target } = event

    if (target === window.document || !(target instanceof HTMLElement)) {
      return
    }

    for (const element of elementSet) {
      if (target.contains(element)) {
        updateRect(element)
      }
    }
  }

  function deactivate() {
    if (!activated) return
    window.removeEventListener('click', handleBlur)
    window.removeEventListener('resize', handleWindowResize)
    window.removeEventListener('scroll', handleWindowScroll)
    io.disconnect()
    mo.disconnect()
    ro.disconnect()

    elementSet.forEach((element) => {
      unregisterElement(element)
    })

    elementIdMap.clear()
    elementSet.clear()

    hoverStack = []
    activated = false
    handler({
      type: 'overlay/deactivate',
    })
  }

  function activate() {
    if (activated) return
    window.addEventListener('click', handleBlur)
    window.addEventListener('resize', handleWindowResize)
    window.addEventListener('scroll', handleWindowScroll, {
      capture: true,
      passive: true,
    })
    io = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    })
    ro = new ResizeObserver(handleResize)
    mo = new MutationObserver(handleMutation)
    mo.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    registerElements(document.body)
    activated = true
    handler({
      type: 'overlay/activate',
    })
  }

  window.document.fonts.ready.then(() => {
    for (const element of elementSet) {
      updateRect(element)
    }
  })

  activate()

  return {
    activate,
    deactivate,
  }
}
