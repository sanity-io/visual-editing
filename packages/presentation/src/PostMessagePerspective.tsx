import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, type FC} from 'react'
import type {VisualEditingConnection} from './types'

export interface PostMessagePerspectiveProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective | `bundle.${string}`
  bundlesPerspective: string[]
}

const PostMessagePerspective: FC<PostMessagePerspectiveProps> = (props) => {
  const {comlink, perspective, bundlesPerspective} = props

  // Return the perspective when requested
  useEffect(() => {
    return comlink.on('visual-editing/fetch-perspective', () => ({
      perspective,
      bundlesPerspective,
    }))
  }, [comlink, perspective, bundlesPerspective])

  // Dispatch a perspective message when the perspective changes
  useEffect(() => {
    comlink.post({
      type: 'presentation/perspective',
      data: {perspective, bundlesPerspective},
    })
  }, [comlink, perspective, bundlesPerspective])

  return null
}

export default memo(PostMessagePerspective)
