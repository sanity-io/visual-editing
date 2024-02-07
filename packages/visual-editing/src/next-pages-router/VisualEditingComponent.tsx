import {
  enableVisualEditing,
  type HistoryAdapterNavigate,
  type VisualEditingOptions,
} from '@sanity/visual-editing'
import { useRouter } from 'next/router.js'
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

  const router = useRouter()
  const routerRef = useRef(router)
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  useEffect(() => {
    routerRef.current = router
  }, [router])
  useEffect(() => {
    const disable = enableVisualEditing({
      zIndex,
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
  }, [zIndex])

  const { asPath, basePath, locale, isReady } = useRouter()
  useEffect(() => {
    if (navigate && isReady) {
      const url =
        basePath || locale
          ? `${basePath}${locale ? `/${locale}` : ''}${asPath === '/' ? '' : asPath}`
          : asPath
      navigate({ type: 'push', url })
    }
  }, [asPath, basePath, isReady, locale, navigate])

  return null
}
