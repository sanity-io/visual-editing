'use client'

import { createChannelsNode } from '@sanity/channels'
import {
  type LoaderMsg,
  type VisualEditingConnectionIds,
} from '@sanity/visual-editing-helpers'
import { useEffect, useRef } from 'react'
import { revalidate } from './actions'

export function PostMessageReporter() {
  const revalidateRef = useRef(0)
  useEffect(() => {
    const channel = createChannelsNode<LoaderMsg, LoaderMsg>({
      id: 'loaders' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
      onEvent: (type, data) => {
        if (type === 'loader/revalidate-tags') {
          console.log('revalidate', data, 'calling router refresh')
          clearTimeout(revalidateRef.current)
          revalidate({ tags: data.tags as string[] })
          revalidateRef.current = window.setTimeout(() => {
            revalidate({ tags: data.tags as string[] })
          }, 1000)
        }
      },
    })
    return () => {
      channel.destroy()
    }
  }, [])

  return null
}
