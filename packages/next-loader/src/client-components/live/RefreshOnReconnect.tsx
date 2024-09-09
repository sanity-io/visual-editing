import {useRouter} from 'next/navigation.js'
import {useEffect} from 'react'

export default function RefreshOnReconnect(): null {
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()
    const {signal} = controller
    window.addEventListener(
      'online',
      () => {
        // eslint-disable-next-line no-console
        console.log('refreshing on reconnect')
        router.refresh()
      },
      {passive: true, signal},
    )
    return () => controller.abort()
  }, [router])

  return null
}
RefreshOnReconnect.displayName = 'RefreshOnReconnect'
