/**
 * Handle interactions with related `@sanity/${framework}-loader` packages.
 */

import type { ClientPerspective } from '@sanity/client'
import { ChannelReturns } from 'channels'
import { useEffect } from 'react'
import { useClient } from 'sanity'
import { VisualEditingMsg } from 'visual-editing-helpers'

export function useLoaders(props: {
  channel: ChannelReturns<VisualEditingMsg> | undefined
  perspective: ClientPerspective
}): void {
  const { channel, perspective } = props
  const client = useClient({ apiVersion: '2023-10-16' })

  // Set the preview perspective, and send over the token needed to preview drafts
  useEffect(() => {
    // @TODO handle this in a better way in https://linear.app/sanity/issue/ECO-174/handle-tokens-auth-in-a-consistent-way
    const { token, projectId, dataset } = client.config()
    if (!token) {
      throw new Error(
        'No token found in client config, try logging out and back in again',
      )
    }
    if (!projectId) {
      throw new Error('No projectId found in client config')
    }
    if (!dataset) {
      throw new Error('No dataset found in client config')
    }

    console.log('loader/perspective', {
      projectId,
      dataset,
      perspective,
      token,
    })
    channel?.send('loader/perspective', {
      projectId,
      dataset,
      perspective,
      token,
    })
  }, [channel, client, perspective])
}
