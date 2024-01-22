import type { ChannelsController } from '@sanity/channels'
import type {
  LoaderPayloads,
  VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import { useEffect, useMemo } from 'react'
import { getPublishedId, useClient } from 'sanity'

export interface RevalidateTagsProps {
  channel: ChannelsController<VisualEditingMsg> | undefined
}

export default function RevalidateTags(props: RevalidateTagsProps): null {
  const { channel } = props
  const client = useClient({ apiVersion: '2023-10-16' })
  const clientConfig = useMemo(() => client.config(), [client])

  // Use the same listen instance and patch documents as they come in
  useEffect(() => {
    if (channel) {
      const { projectId, dataset } = clientConfig

      const subscription = client
        .listen(
          '*[!(_type in path("system.**"))]',
          {},
          {
            events: ['mutation'],
            includePreviousRevision: false,
            includeResult: true,
            visibility: 'query',
            tag: 'presentation-loader',
          },
        )
        .subscribe((update) => {
          if (update.type !== 'mutation' || update.transition === 'disappear') {
            return
          }
          const type = update.result?._type
          if (!type) {
            // eslint-disable-next-line no-console
            console.warn('Type is missing, skipping revalidation', update)
            return
          }
          const slug: string | undefined = update.result?.slug?.current
            ? `${type}:${update.result.slug.current}`
            : undefined
          const tags = [getPublishedId(update.documentId), type, slug!].filter(
            Boolean,
          ) as [string, string, string]
          channel.send('loaders', 'loader/revalidate-tags', {
            projectId: projectId!,
            dataset: dataset!,
            tags,
          } satisfies LoaderPayloads['revalidate-tags'])
        })
      return () => subscription.unsubscribe()
    }
  }, [channel, client, clientConfig])

  return null
}
