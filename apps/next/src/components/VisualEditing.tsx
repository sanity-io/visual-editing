import { enableOverlays } from '@sanity/overlays'
import { studioUrl } from 'apps-common/env'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useLiveMode } from './useQuery'
import { client } from './sanity'

export default function VisualEditing() {
  const router = useRouter()
  const routerRef = useRef(router)
  const sentInitialRef = useRef(false)
  const [initialPath] = useState(() => router.asPath)

  useEffect(() => {
    if (!router.isReady) return
    const disable = enableOverlays({
      allowStudioOrigin: studioUrl,
      history: {
        subscribe: (navigate) => {
          // Only necessary because of the initial /api/pages-draft redirect to another route
          if (!sentInitialRef.current) {
            // Set the initial url
            navigate({ type: 'replace', url: initialPath })
            sentInitialRef.current = true
          }
          // Subscribe to history changes
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
              return routerRef.current.push(update.url)
            case 'pop':
              return routerRef.current.back()
            case 'replace':
              return routerRef.current.replace(update.url)
            default:
              throw new Error(`Unknown update type: ${update.type}`)
          }
        },
      },
    })
    return () => disable()
  }, [initialPath, router.events, router.isReady])

  useLiveMode({ allowStudioOrigin: studioUrl, client })
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview' && window === parent) {
      // If not an iframe, turn off Draft Mode
      location.href = '/api/disable-pages-draft'
    }
  }, [])

  return null
}
