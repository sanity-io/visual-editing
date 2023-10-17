/**
 * Handle interactions with related `@sanity/${framework}-loader` packages.
 */

import type { ClientPerspective } from '@sanity/client'
import { ChannelReturns } from 'channels'
import { useClient } from 'sanity'
import { VisualEditingMsg } from 'visual-editing-helpers'

export function useLoaders(props: {
  channel: ChannelReturns<VisualEditingMsg> | undefined
  perspective: ClientPerspective
}): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { channel, perspective } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const client = useClient({ apiVersion: '2023-10-16' })

  // @TODO
}
