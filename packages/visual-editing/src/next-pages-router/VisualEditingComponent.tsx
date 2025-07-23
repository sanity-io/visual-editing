import {useRouter} from 'next/router.js'
import {useEffect, useState} from 'react'
import {useEffectEvent} from 'use-effect-event'
import type {
  HistoryAdapterNavigate,
  HistoryRefresh,
  HistoryUpdate,
  VisualEditingOptions,
} from '../types'
import {enableVisualEditing} from '../ui/enableVisualEditing'

/**
 * @public
 */
export interface VisualEditingProps extends Omit<VisualEditingOptions, 'history'> {
  /**
   * @deprecated The history adapter is already implemented
   */
  history?: never
}

export default function VisualEditingComponent(props: VisualEditingProps): null {
  const {components, refresh: refreshProp, zIndex} = props

  const router = useRouter()
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  const refresh = useEffectEvent((payload: HistoryRefresh): false | Promise<void> => {
    if (refreshProp) {
      return refreshProp(payload)
    }
    async function routerRefresh() {
      // Using the pattern used in the next.js codebase: https://github.com/vercel/next.js/blob/ac2b8ebfb2068661e91ae0fce5039a2e528eb25e/test/integration/prerender-preview/pages/index.js#L31
      await router.replace(router.asPath, undefined, {scroll: false, shallow: false})
    }
    const skipRefresh = (): false => {
      // eslint-disable-next-line no-console
      console.debug(
        'Live preview is setup, mutation is skipped assuming its handled by the live preview',
      )
      return false
    }
    const mutationRefresh = () => {
      // eslint-disable-next-line no-console
      console.debug('No loaders in live mode detected, reloading server props')
      return routerRefresh()
    }

    switch (payload.source) {
      case 'manual':
        return routerRefresh()
      case 'mutation':
        return payload.livePreviewEnabled ? skipRefresh() : mutationRefresh()
      default:
        throw new Error('Unknown refresh source', {cause: payload})
    }
  })
  const update = useEffectEvent((event: HistoryUpdate) => {
    switch (event.type) {
      case 'push':
        return router.push(event.url)
      case 'pop':
        return router.back()
      case 'replace':
        return router.replace(event.url)
      default:
        throw new Error(`Unknown event type: ${event.type}`)
    }
  })
  useEffect(() => {
    const disable = enableVisualEditing({
      components,
      zIndex,
      refresh,
      history: {
        subscribe: (_navigate) => {
          setNavigate(() => _navigate)
          return () => setNavigate(undefined)
        },
        update,
      },
    })
    return () => disable()
  }, [components, zIndex])

  const {asPath, basePath, locale, isReady} = useRouter()
  useEffect(() => {
    if (navigate && isReady) {
      const url =
        basePath || locale
          ? `${basePath}${locale ? `/${locale}` : ''}${asPath === '/' ? '' : asPath}`
          : asPath
      navigate({type: 'push', url})
    }
  }, [asPath, basePath, isReady, locale, navigate])

  return null
}
