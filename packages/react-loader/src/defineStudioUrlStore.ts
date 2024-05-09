import type {SanityClient} from '@sanity/client'
import type {ResolveStudioUrl, StudioUrl} from '@sanity/client/csm'
import type {CreateQueryStoreOptions} from '@sanity/core-loader'

type StudioUrlLike = StudioUrl | ResolveStudioUrl | undefined

export function defineStudioUrlStore(client: CreateQueryStoreOptions['client']): {
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => StudioUrlLike
  getServerSnapshot: () => StudioUrlLike
  setStudioUrl: (nextStudioUrl: StudioUrlLike) => void
} {
  let studioUrl: StudioUrlLike =
    typeof client === 'object' ? (client as SanityClient)?.config().stega.studioUrl : undefined
  const serverSnapshot = studioUrl
  const subscribers = new Set<() => void>()
  return {
    subscribe(callback) {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
    getSnapshot() {
      return studioUrl
    },
    getServerSnapshot() {
      return serverSnapshot
    },
    setStudioUrl(nextStudioUrl: StudioUrlLike) {
      studioUrl = nextStudioUrl
      subscribers.forEach((callback) => callback())
    },
  }
}
