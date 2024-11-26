import {useEffect, useRef, useState} from 'react'
import {useLocation, useNavigate, useRevalidator} from 'react-router'
import {type HistoryAdapterNavigate, type HistoryRefresh, type VisualEditingOptions} from '../types'
import {enableVisualEditing} from '../ui/enableVisualEditing'

/**
 * @public
 */
export interface VisualEditingProps extends Omit<VisualEditingOptions, 'history' | 'refresh'> {
  /**
   * @deprecated The history adapter is already implemented
   */
  history?: never
  /**
   * The refresh API allows smarter refresh logic than the default `location.reload()` behavior.
   * You can call the refreshDefault argument to trigger the default refresh behavior so you don't have to reimplement it.
   */
  refresh?: (
    payload: HistoryRefresh,
    refreshDefault: () => false | Promise<void>,
  ) => false | Promise<void>
}

export default function VisualEditingComponent(props: VisualEditingProps): null {
  const {components, refresh, zIndex} = props

  const navigateRemix = useNavigate()
  const navigateRemixRef = useRef(navigateRemix)
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()
  const revalidator = useRevalidator()
  const [revalidatorPromise, setRevalidatorPromise] = useState<(() => void) | null>(null)
  const [revalidatorLoading, setRevalidatorLoading] = useState(false)

  useEffect(() => {
    navigateRemixRef.current = navigateRemix
  }, [navigateRemix])
  useEffect(() => {
    if (revalidatorPromise && revalidator.state === 'loading') {
      setRevalidatorLoading(true)
    } else if (revalidatorPromise && revalidatorLoading && revalidator.state === 'idle') {
      revalidatorPromise()
      setRevalidatorPromise(null)
      setRevalidatorLoading(false)
    }
  }, [revalidatorLoading, revalidator.state, revalidatorPromise])
  useEffect(() => {
    const disable = enableVisualEditing({
      components,
      zIndex,
      refresh: (payload) => {
        function refreshDefault() {
          if (payload.source === 'mutation' && payload.livePreviewEnabled) {
            return false
          }
          return new Promise<void>((resolve) => {
            revalidator.revalidate()
            setRevalidatorPromise(() => resolve)
          })
        }
        return refresh ? refresh(payload, refreshDefault) : refreshDefault()
      },
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
  }, [components, refresh, revalidator, zIndex])

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
