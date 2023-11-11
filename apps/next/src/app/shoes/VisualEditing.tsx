'use client'

import { enableOverlays, HistoryAdapterNavigate } from '@sanity/overlays'
import { studioUrl } from 'apps-common/env'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLiveMode } from './sanity.loader'
import { client } from './sanity.client'

// Always enable stega in Live Mode
const stegaClient = client.withConfig({
  stega: { ...client.config().stega, enabled: true },
})

export default function VisualEditing() {
  const router = useRouter()
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  useEffect(() => {
    const disable = enableOverlays({
      allowStudioOrigin: studioUrl,
      history: {
        subscribe: (navigate) => {
          setNavigate(() => navigate)
          return () => setNavigate(undefined)
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
    if (navigate) {
      navigate({
        type: 'push',
        url: `${pathname}${searchParams?.size ? `?${searchParams}` : ''}`,
      })
    }
  }, [navigate, pathname, searchParams])

  useLiveMode({ allowStudioOrigin: studioUrl, client: stegaClient })
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview' && window === parent) {
      // If not an iframe, turn off Draft Mode
      location.href = '/api/disable-draft'
    }
  }, [])

  return null
}
