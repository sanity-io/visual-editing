import {v4 as uuid} from 'uuid'
import type {
  ElementNode,
  EventHandlers,
  OverlayController,
  OverlayElement,
  OverlayOptions,
  ResolvedElement,
} from './types'
import {handleOverlayDrag} from './util/dragAndDrop'
import {findOverlayElement, isElementNode} from './util/elements'
import {
  findSanityNodes,
  isSanityArrayPath,
  isSanityNode,
  resolveDragAndDropGroup,
} from './util/findSanityNodes'
import {getRect} from './util/geometry'

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
  inFrame,
  inPopUp,
  optimisticActorReady,
}: OverlayOptions): OverlayController {
  let activated = false
  // Map for getting element by ID
  const elementIdMap = new Map<string, ElementNode>()
  // WeakMap for getting data by element
  const elementsMap = new WeakMap<ElementNode, OverlayElement>()
  // Set for iterating over elements
  const elementSet = new Set<ElementNode>()
  // Weakmap keyed by measureElement to find associated element
  const measureElements = new WeakMap<ElementNode, ElementNode>()
  // Weakmap for storing user set cursor styles per element
  const cursorMap = new WeakMap<ElementNode, string | undefined>()

  let ro: ResizeObserver
  let io: IntersectionObserver | undefined
  let mo: MutationObserver

  let activeDragSequence = false

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
  let hoverStack: Array<ElementNode> = []
  const getHoveredElement = () => hoverStack[hoverStack.length - 1] as ElementNode | undefined

  function addEventHandlers(el: ElementNode, handlers: EventHandlers) {
    el.addEventListener('click', handlers.click as EventListener, {
      capture: true,
    })
    el.addEventListener('contextmenu', handlers.contextmenu as EventListener, {
      capture: true,
    })
    // We listen for the initial mousemove event, in case the overlay is enabled whilst the cursor is already over an element
    // mouseenter and mouseleave listeners are attached within this handler
    el.addEventListener('mousemove', handlers.mousemove as EventListener, {
      once: true,
      capture: true,
    })
    // Listen for mousedown in case we need to prevent default behavior
    el.addEventListener('mousedown', handlers.mousedown as EventListener, {
      capture: true,
    })
  }

  function removeEventHandlers(el: ElementNode, handlers: EventHandlers) {
    el.removeEventListener('click', handlers.click as EventListener, {
      capture: true,
    })
    el.removeEventListener('contextmenu', handlers.contextmenu as EventListener, {
      capture: true,
    })
    el.removeEventListener('mousemove', handlers.mousemove as EventListener, {
      capture: true,
    })
    el.removeEventListener('mousedown', handlers.mousedown as EventListener, {
      capture: true,
    })
    el.removeEventListener('mouseenter', handlers.mouseenter as EventListener)
    el.removeEventListener('mouseleave', handlers.mouseleave as EventListener)
  }

  /**
   * Executed when element enters the viewport
   * Enables an element’s event handlers
   */
  function activateElement({id, elements, handlers}: OverlayElement) {
    const {element, measureElement} = elements
    addEventHandlers(element, handlers)
    ro.observe(measureElement)
    handler({
      type: 'element/activate',
      id,
    })
  }

  /**
   * Executed when element leaves the viewport
   * Disables an element’s event handlers
   */
  function deactivateElement({id, elements, handlers}: OverlayElement) {
    const {element, measureElement} = elements
    removeEventHandlers(element, handlers)
    ro.unobserve(measureElement)
    // Scrolling from a hovered element will not trigger mouseleave event, so filter the stack
    hoverStack = hoverStack.filter((el) => el !== element)
    handler({
      type: 'element/deactivate',
      id,
    })
  }

  function setOverlayCursor(element: ElementNode) {
    // Don't set the cursor if mutations are unavailable
    if ((!inFrame && !inPopUp) || !optimisticActorReady) return

    // Loops through the entire hoverStack, trying to set the cursor if the
    // stack element matches the element passed to the function, otherwise
    // restoring the cursor
    for (const hoverstackElement of hoverStack) {
      if (element === hoverstackElement) {
        const targetSanityData = elementsMap.get(element)?.sanity
        if (!targetSanityData || !isSanityNode(targetSanityData)) return

        const dragGroup = resolveDragAndDropGroup(
          element,
          targetSanityData,
          elementSet,
          elementsMap,
        )

        if (dragGroup) {
          // Store any existing cursor so it can be restored later
          const existingCursor = element.style.cursor
          if (existingCursor) {
            cursorMap.set(element, existingCursor)
          }

          handler({
            type: 'overlay/setCursor',
            element,
            cursor: 'move',
          })

          continue
        }
      }

      restoreOverlayCursor(hoverstackElement)
    }
  }

  function restoreOverlayCursor(element: ElementNode) {
    // Restore any previously stored cursor (if it exists)
    const previousCursor = cursorMap.get(element)

    handler({
      type: 'overlay/setCursor',
      element,
      cursor: previousCursor,
    })
  }

  /**
   * Stores an element’s DOM node and decoded sanity data in state and sets up event handlers
   */
  function registerElement({elements, sanity}: ResolvedElement) {
    const {element, measureElement} = elements

    const eventHandlers: EventHandlers = {
      click(event) {
        const target = event.target as ElementNode | null

        if (element === getHoveredElement() && element.contains(target)) {
          // Click events are only supported supported in iframes, not well supported in popups
          // @TODO presentation tool should report wether it's visible or not, so we can adapt properly and allow multi-window preview workflows
          if (inFrame) {
            event.preventDefault()
            event.stopPropagation()
          }

          const sanity = elementsMap.get(element)?.sanity
          if (sanity && !activeDragSequence) {
            handler({
              type: 'element/click',
              id,
              sanity,
            })
          }
        }
      },
      contextmenu(event) {
        if (!('path' in sanity) || (!inFrame && !inPopUp) || !optimisticActorReady) return

        // This is a temporary check as the context menu only supports array
        // items (for now). We split the path into segments, if a `_key` exists
        // in last path segment, we assume it's an array item, and so return
        // early if it is some other type.
        if (!sanity.path.split('.').pop()?.includes('[_key==')) return

        const target = event.target as ElementNode | null
        if (element === getHoveredElement() && element.contains(target)) {
          // Context menus are supported on both iframes and popups
          if (inFrame || inPopUp) {
            event.preventDefault()
            event.stopPropagation()
          }
          handler({
            type: 'element/contextmenu',
            id,
            position: {
              x: event.clientX,
              y: event.clientY,
            },
            sanity,
          })
        }
      },
      mousedown(event) {
        // prevent iframe from taking focus
        event.preventDefault()

        if (event.currentTarget !== hoverStack.at(-1)) return

        if (element.getAttribute('data-sanity-drag-disable')) return

        // disable dnd in non-studio contexts
        if ((!inFrame && !inPopUp) || !optimisticActorReady) return

        const targetSanityData = elementsMap.get(element)?.sanity

        if (
          !targetSanityData ||
          !isSanityNode(targetSanityData) ||
          !isSanityArrayPath(targetSanityData.path)
        )
          return

        const dragGroup = resolveDragAndDropGroup(element, sanity, elementSet, elementsMap)

        if (!dragGroup) return

        handleOverlayDrag({
          element,
          handler,
          mouseEvent: event as MouseEvent,
          overlayGroup: dragGroup,
          target: targetSanityData,
          onSequenceStart: () => {
            activeDragSequence = true
          },
          onSequenceEnd: () => {
            // delay drag sequence end to prevent click events from firing just after drag sequences
            setTimeout(() => {
              activeDragSequence = false
            }, 250)
          },
        })
      },
      mousemove(event) {
        eventHandlers.mouseenter(event)
        const el = event.currentTarget as ElementNode | null
        if (el) {
          el.addEventListener('mouseenter', eventHandlers.mouseenter as EventListener)
          el.addEventListener('mouseleave', eventHandlers.mouseleave as EventListener)
        }
      },
      mouseenter() {
        // If the Vercel Visual Editing provided by Vercel Toolbar is active, do not overlap overlays
        if (
          (document.querySelector('vercel-live-feedback') &&
            element.closest('[data-vercel-edit-info]')) ||
          element.closest('[data-vercel-edit-target]')
        ) {
          return
        }
        hoverStack.push(element)

        handler({
          type: 'element/mouseenter',
          id,
          rect: getRect(element),
        })

        setOverlayCursor(element)
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
            setOverlayCursor(hoveredElement)
            const overlayElement = elementsMap.get(hoveredElement)
            if (overlayElement) {
              handler({
                type: 'element/mouseenter',
                id: overlayElement.id,
                rect: getRect(hoveredElement),
              })
            }
          }

          restoreOverlayCursor(element)
        }

        /**
         * If moving to an element within the overlay which handles pointer events, attach a new
         * event handler to that element and defer the original leave event
         */
        function addDeferredLeave(el: ElementNode) {
          const deferredLeave = (e: MouseEvent) => {
            const {relatedTarget} = e
            const deferredContainer = findOverlayElement(relatedTarget)
            if (!deferredContainer) {
              el.removeEventListener('mouseleave', deferredLeave as EventListener)
              leave()
            } else if (relatedTarget && isElementNode(relatedTarget)) {
              el.removeEventListener('mouseleave', deferredLeave as EventListener)
              addDeferredLeave(relatedTarget)
            }
          }
          el.addEventListener('mouseleave', deferredLeave as EventListener)
        }

        const {relatedTarget} = e as MouseEvent
        const container = findOverlayElement(relatedTarget)
        const isInteractiveOverlayElement = overlayElement.contains(container)

        if (isElementNode(container) && isInteractiveOverlayElement) {
          return addDeferredLeave(container)
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

    io?.observe(element)

    handler({
      type: 'element/register',
      id,
      element,
      rect: getRect(element),
      sanity,
      dragDisabled: !!element.getAttribute('data-sanity-drag-disable'),
    })

    if (activated) {
      activateElement(sanityNode)
    }
  }

  function updateElement({elements, sanity}: ResolvedElement) {
    const {element} = elements
    const overlayElement = elementsMap.get(element)
    if (overlayElement) {
      elementsMap.set(element, {...overlayElement, sanity})
      handler({
        type: 'element/update',
        id: overlayElement.id,
        rect: getRect(element),
        sanity: sanity,
      })
    }
  }

  function parseElements(node: ElementNode | {childNodes: ElementNode[]}) {
    const sanityNodes = findSanityNodes(node)
    for (const sanityNode of sanityNodes) {
      const {element} = sanityNode.elements
      if (elementsMap.has(element)) {
        updateElement(sanityNode)
      } else {
        registerElement(sanityNode)
      }
    }
  }

  function unregisterElement(element: ElementNode) {
    const overlayElement = elementsMap.get(element)
    if (overlayElement) {
      const {id, handlers} = overlayElement
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

  function handleMutation(mutations: MutationRecord[]) {
    let mutationWasInScope = false
    // For each DOM mutation, we find the relevant element node and register or
    // update it. This function doesn't handle checking if the node actually
    // contains any relevant Sanity data, it just detects new or changed DOM
    // elements and hands them off to `parseElements` to and determine if we
    // have Sanity nodes
    for (const mutation of mutations) {
      const {target, type} = mutation
      // We need to target an element, so if the mutated node was just a text
      // change, we look at that node's parent instead
      const node: Node | null = type === 'characterData' ? target.parentElement : target
      // We ignore any nodes related to the overlay container element
      if (node === overlayElement || overlayElement.contains(node)) {
        continue
      }

      mutationWasInScope = true
      if (isElementNode(node)) {
        parseElements({childNodes: [node]})
      }
    }

    // If the mutation is "in scope" (i.e. happened outside of the overlay
    // container) we need to check if it removed any of the elements we are
    // currently tracking
    if (mutationWasInScope) {
      for (const element of elementSet) {
        if (!element.isConnected) {
          unregisterElement(element)
        }
      }
    }
  }

  function updateRect(el: ElementNode) {
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

      if (isElementNode(target)) {
        const element = measureElements.get(target)
        if (!element) return
        updateRect(element)
      }
    }
  }

  function handleIntersection(entries: IntersectionObserverEntry[]) {
    if (!activated) return
    for (const entry of entries) {
      const {target} = entry
      const match = isElementNode(target) && elementsMap.get(target)
      if (!match) continue
      if (entry.isIntersecting) {
        activateElement(match)
      } else {
        deactivateElement(match)
      }
    }
  }

  function handleBlur(event: MouseEvent) {
    const element = findOverlayElement(event.target)

    if (element) {
      if (element.dataset['sanityOverlayElement'] === 'capture') {
        event.preventDefault()
        event.stopPropagation()
      }
      return
    }

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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      hoverStack = []
      handler({
        type: 'overlay/blur',
      })
    }
  }

  function handleWindowScroll(event: Event) {
    const {target} = event

    if (target === window.document || !isElementNode(target)) {
      return
    }

    for (const element of elementSet) {
      if (target.contains(element)) {
        updateRect(element)
      }
    }
  }

  function activate() {
    if (activated) return
    io = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    })
    elementSet.forEach((element) => io!.observe(element))
    handler({
      type: 'overlay/activate',
    })
    activated = true
  }

  function deactivate() {
    if (!activated) return
    io?.disconnect()
    elementSet.forEach((element) => {
      const overlayElement = elementsMap.get(element)
      if (overlayElement) {
        deactivateElement(overlayElement)
      }
    })
    handler({
      type: 'overlay/deactivate',
    })
    activated = false
  }

  function destroy() {
    window.removeEventListener('click', handleBlur)
    window.removeEventListener('contextmenu', handleBlur)
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', handleWindowResize)
    window.removeEventListener('scroll', handleWindowScroll)
    mo.disconnect()
    ro.disconnect()

    elementSet.forEach((element) => {
      unregisterElement(element)
    })

    elementIdMap.clear()
    elementSet.clear()

    hoverStack = []
    deactivate()
  }

  function create() {
    window.addEventListener('click', handleBlur)
    window.addEventListener('contextmenu', handleBlur)
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', handleWindowResize)
    window.addEventListener('scroll', handleWindowScroll, {
      capture: true,
      passive: true,
    })
    ro = new ResizeObserver(handleResize)
    mo = new MutationObserver(handleMutation)
    mo.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    parseElements(document.body)
    activate()
  }

  window.document.fonts.ready.then(() => {
    for (const element of elementSet) {
      updateRect(element)
    }
  })

  create()

  return {
    activate,
    deactivate,
    destroy,
  }
}
