import { useLocation, useNavigate } from '@remix-run/react'
import { enableVisualEditing, type HistoryUpdate } from '@sanity/overlays'
import { studioUrl } from 'apps-common/env'
import { useEffect, useRef } from 'react'
import { useLiveMode } from './useQuery'

export default function VisualEditing() {
  const navigateRemix = useNavigate()
  const navigatePagesRef = useRef<null | ((update: HistoryUpdate) => void)>(
    null,
  )

  useEffect(() => {
    const disable = enableVisualEditing({
      studioUrl,
      history: {
        subscribe: (navigate) => {
          navigatePagesRef.current = navigate
          return () => {
            navigatePagesRef.current = null
          }
        },
        update: (update) => {
          if (update.type === 'push' || update.type === 'replace') {
            navigateRemix(update.url, { replace: update.type === 'replace' })
          } else if (update.type === 'pop') {
            navigateRemix(-1)
          }
        },
      },
    })
    return () => disable()
  }, [navigateRemix])
  const location = useLocation()
  useEffect(() => {
    if (navigatePagesRef.current) {
      navigatePagesRef.current({
        type: 'push',
        url: `${location.pathname}${location.search}${location.hash}`,
      })
    }
  }, [location.hash, location.pathname, location.search])

  useLiveMode()

  return null
}
