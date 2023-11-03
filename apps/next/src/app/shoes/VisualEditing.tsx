'use client'

import { enableOverlays, type HistoryUpdate } from '@sanity/overlays'
import { studioUrl } from 'apps-common/env'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useLiveMode } from './useQuery'

export default function VisualEditing() {
  const router = useRouter()
  const navigatePresentationRef = useRef<
    null | ((update: HistoryUpdate) => void)
  >(null)

  useEffect(() => {
    const disable = enableOverlays({
      studioUrl,
      history: {
        subscribe: (navigate) => {
          navigatePresentationRef.current = navigate
          return () => {
            navigatePresentationRef.current = null
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
  }, [router])

  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
    if (navigatePresentationRef.current) {
      navigatePresentationRef.current({
        type: 'push',
        url: `${pathname}${searchParams?.size ? `?${searchParams}` : ''}`,
      })
    }
  }, [pathname, searchParams])

  useLiveMode()

  return null
}
