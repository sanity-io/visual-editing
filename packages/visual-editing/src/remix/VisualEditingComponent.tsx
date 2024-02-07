import { useLocation, useNavigate } from '@remix-run/react'
import {
  enableVisualEditing,
  type HistoryAdapterNavigate,
  type VisualEditingOptions,
} from '@sanity/visual-editing'
import { useEffect, useRef, useState } from 'react'

/**
 * @public
 */
export interface VisualEditingProps
  extends Omit<VisualEditingOptions, 'history'> {
  /**
   * @deprecated The histoy adapter is already implemented
   */
  history?: never
}

export default function VisualEditingComponent(
  props: VisualEditingProps,
): null {
  const { zIndex } = props

  const navigateRemix = useNavigate()
  const navigateRemixRef = useRef(navigateRemix)
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  useEffect(() => {
    navigateRemixRef.current = navigateRemix
  }, [navigateRemix])
  useEffect(() => {
    const disable = enableVisualEditing({
      zIndex,
      history: {
        subscribe: (_navigate) => {
          setNavigate(() => _navigate)
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
  }, [zIndex])

  const location = useLocation()
  useEffect(() => {
    if (navigate) {
      navigate({
        type: 'push',
        url: `${location.pathname}${location.search}${location.hash}`,
      })
    }
  }, [location.hash, location.pathname, location.search, navigate])

  return null
}
