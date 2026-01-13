'use client'

import {
  type HistoryAdapter,
  type HistoryAdapterNavigate,
  type HistoryRefresh,
  type HistoryUpdate,
  VisualEditing as VisualEditingComponent,
  type VisualEditingOptions,
} from '@sanity/visual-editing/react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useCallback, useEffect, useMemo, useState, useEffectEvent} from 'react'

/**
 * @public
 */
export interface VisualEditingProps extends Omit<VisualEditingOptions, 'history'> {
  /**
   * @deprecated The histoy adapter is already implemented
   */
  history?: never
}

export default function VisualEditing(props: VisualEditingProps): React.JSX.Element | null {
  const {plugins, components, refresh, zIndex, onPerspectiveChange} = props

  const router = useRouter()
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  const handleHistoryUpdate = useEffectEvent((update: HistoryUpdate) => {
    switch (update.type) {
      case 'push':
        return router.push(update.url)
      case 'pop':
        return router.back()
      case 'replace':
        return router.replace(update.url)
      default:
        throw new Error(`Unknown update type`, {cause: update})
    }
  })
  const history = useMemo<HistoryAdapter>(
    () => ({
      subscribe: (_navigate) => {
        setNavigate(() => _navigate)
        return () => setNavigate(undefined)
      },
      update: handleHistoryUpdate,
    }),
    [],
  )

  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
    if (navigate) {
      navigate({
        type: 'push',
        url: `${pathname}${searchParams?.size ? `?${searchParams.toString()}` : ''}`,
      })
    }
  }, [navigate, pathname, searchParams])

  const handleRefresh = useCallback(
    (payload: HistoryRefresh) => {
      if (refresh) return refresh(payload)
      return Promise.resolve(router.refresh())
    },
    [refresh, router],
  )

  return (
    <VisualEditingComponent
      plugins={plugins}
      components={components}
      history={history}
      onPerspectiveChange={onPerspectiveChange}
      portal
      refresh={handleRefresh}
      zIndex={zIndex}
    />
  )
}
