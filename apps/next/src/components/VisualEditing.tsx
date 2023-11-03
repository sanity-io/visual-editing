import { enableOverlays } from '@sanity/overlays'
import { studioUrl } from 'apps-common/env'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useLiveMode } from './useQuery'

export default function VisualEditing() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const disable = enableOverlays({
      studioUrl,
      history: {
        subscribe: (navigate) => {
          const handleHistoryChange = (url: string) => {
            navigate({ type: 'push', url })
          }
          router.events.on('beforeHistoryChange', handleHistoryChange)
          return () => {
            router.events.off('beforeHistoryChange', handleHistoryChange)
          }
        },
        update: (update) => {
          switch (update.type) {
            case 'push':
              return router.push(update.url)
            case 'pop':
              return router.back()
            case 'replace':
              return router.replace(update.url)
            default:
              throw new Error(`Unknown update type: ${update.type}`)
          }
        },
      },
    })
    return () => disable()
  }, [
    router.isReady,
    router?.events?.on,
    router?.events?.off,
    router?.push,
    router?.back,
    router?.replace,
  ])

  useLiveMode()

  return null
}
