'use client'

import { createChannelsNode } from '@sanity/channels'
import type {
  LoaderMsg,
  VisualEditingConnectionIds,
} from '@sanity/visual-editing-helpers'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function PostMessageReporter() {
  const router = useRouter()
  const revalidateRef = useRef(0)
  useEffect(() => {
    const channel = createChannelsNode<LoaderMsg, LoaderMsg>({
      id: 'loaders' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
      onEvent: (type, data) => {
        if (type === 'loader/revalidate-tags') {
          console.log('revalidate', data, 'calling router refresh')
          clearTimeout(revalidateRef.current)
          router.refresh()
          revalidateRef.current = window.setTimeout(() => {
            router.refresh()
          }, 1000)
        }
      },
    })
    return () => {
      channel.destroy()
    }
  }, [router])

  return null
}
