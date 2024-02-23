'use client'
/**
 * The code in this file will be updated once `next-sanity` ships with `refresh` support
 */
import {
  enableVisualEditing,
  type HistoryAdapterNavigate,
  type VisualEditingOptions,
} from '@sanity/visual-editing'
import { usePathname, useRouter, useSearchParams } from 'next/navigation.js'
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

export default function VisualEditing(props: VisualEditingProps): null {
  const { refresh, zIndex } = props

  const router = useRouter()
  const routerRef = useRef(router)
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  useEffect(() => {
    routerRef.current = router
  }, [router])
  useEffect(() => {
    const disable = enableVisualEditing({
      zIndex,
      refresh,
      history: {
        subscribe: (_navigate) => {
          setNavigate(() => _navigate)
          return () => setNavigate(undefined)
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
  }, [refresh, zIndex])

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

  return null
}
