import { useLocation, useNavigate } from '@remix-run/react'
import { enableOverlays, type HistoryAdapterNavigate } from '@sanity/overlays'
import { studioUrl } from 'apps-common/env'
import { useEffect, useRef, useState } from 'react'
import { useLiveMode } from '@sanity/react-loader'
import { client } from '~/sanity'

export default function VisualEditing() {
  const navigateRemix = useNavigate()
  const navigateRemixRef = useRef(navigateRemix)
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  useEffect(() => {
    navigateRemixRef.current = navigateRemix
  }, [navigateRemix])
  useEffect(() => {
    const disable = enableOverlays({
      allowStudioOrigin: studioUrl,
      history: {
        subscribe: (navigate) => {
          setNavigate(() => navigate)
          return () => setNavigate(undefined)
        },
        update: (update) => {
          if (update.type === 'push' || update.type === 'replace') {
            navigateRemixRef.current(update.url, {
              replace: update.type === 'replace',
            })
          } else if (update.type === 'pop') {
            navigateRemixRef.current(-1)
          }
        },
      },
    })
    return () => disable()
  }, [])
  const location = useLocation()
  useEffect(() => {
    if (navigate) {
      navigate({
        type: 'push',
        url: `${location.pathname}${location.search}${location.hash}`,
      })
    }
  }, [location.hash, location.pathname, location.search, navigate])

  useLiveMode({ allowStudioOrigin: studioUrl, client })

  return null
}
