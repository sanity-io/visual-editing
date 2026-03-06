import type {ClientPerspective} from '@sanity/client'
import type {Node} from '@sanity/comlink'
import type {LoaderControllerMsg, LoaderNodeMsg} from '@sanity/presentation-comlink'

/** @internal */
export const comlinkListeners: Set<() => void> = new Set()

/** @internal */
export let comlink: Node<LoaderNodeMsg, LoaderControllerMsg> | null = null
/** @internal */
export let comlinkProjectId: string | null = null
/** @internal */
export let comlinkDataset: string | null = null
/** @internal */
export let comlinkPerspective: ClientPerspective | null = null

/** @internal */
export function setLoaderComlink(
  nextComlink: Node<LoaderNodeMsg, LoaderControllerMsg> | null,
): void {
  comlink = nextComlink
  for (const listener of comlinkListeners) {
    listener()
  }
}

/** @internal */
export function setLoaderClientConfig(
  projectId: string | null,
  dataset: string | null,
): void {
  comlinkProjectId = projectId
  comlinkDataset = dataset
  for (const listener of comlinkListeners) {
    listener()
  }
}

/** @internal */
export function setLoaderPerspective(perspective: ClientPerspective | null): void {
  comlinkPerspective = perspective
  for (const listener of comlinkListeners) {
    listener()
  }
}

/** @internal */
export function subscribe(listener: () => void): () => void {
  comlinkListeners.add(listener)
  return () => comlinkListeners.delete(listener)
}

/**
 * Tracks whether there are any active `usePresentationQuery` consumers.
 * `LoaderComlink` is only mounted when `hasQueryListeners` is true.
 */
const queryListenerStatusListeners: Set<() => void> = new Set()
let hasQueryListeners = false
let queryListenerCount = 0

/** @internal */
export function subscribeQueryListenerStatus(listener: () => void): () => void {
  queryListenerStatusListeners.add(listener)
  return () => queryListenerStatusListeners.delete(listener)
}

/** @internal */
export function getQueryListenerStatus(): boolean {
  return hasQueryListeners
}

/** @internal */
export function addQueryListener(): () => void {
  queryListenerCount++
  if (!hasQueryListeners) {
    hasQueryListeners = true
    for (const listener of queryListenerStatusListeners) {
      listener()
    }
  }
  return () => {
    queryListenerCount--
    if (queryListenerCount === 0 && hasQueryListeners) {
      hasQueryListeners = false
      for (const listener of queryListenerStatusListeners) {
        listener()
      }
    }
  }
}
