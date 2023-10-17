import { useLocation, useNavigate } from '@remix-run/react'
import { enableVisualEditing, type HistoryUpdate } from '@sanity/overlays'
import { useEffect, useRef } from 'react'
import { useLiveMode } from './useQuery'

export default function VisualEditing() {
  const navigateRemix = useNavigate()
  const navigateComposerRef = useRef<null | ((update: HistoryUpdate) => void)>(
    null,
  )

  useEffect(() => {
    const disable = enableVisualEditing({
      studioUrl: 'http://localhost:3333/',
      history: {
        subscribe: (navigate) => {
          navigateComposerRef.current = navigate
          return () => {
            navigateComposerRef.current = null
          }
        },
        update: (update) => {
          console.log('update', update)
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
    if (navigateComposerRef.current) {
      navigateComposerRef.current({
        type: 'push',
        url: `${location.pathname}${location.search}${location.hash}`,
      })
    }
  }, [location.hash, location.pathname, location.search])

  useLiveMode()

  return null
}
