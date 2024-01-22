'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

function useRefresh() {
  const router = useRouter()
  const [loading, startTransition] = useTransition()
  const [again, setAgain] = useState(false)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.sanity && event.data.type === 'reload') {
        startTransition(() => {
          router.refresh()
          setAgain(true)
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  useEffect(() => {
    if (!again) return
    const timeout = setTimeout(
      () =>
        startTransition(() => {
          setAgain(false)
          router.refresh()
        }),
      1000,
    )
    return () => clearTimeout(timeout)
  }, [again])

  return loading || again
}

export default function PreviewBanner() {
  const loading = useRefresh()

  return (
    <div
      className={`bg-black p-3 text-center text-white ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      {'Previewing drafts. '}
      <a
        className="underline transition hover:opacity-50"
        href="/api/disable-draft"
      >
        Back to published
      </a>
    </div>
  )
}
