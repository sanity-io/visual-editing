import type { ChannelsController } from '@sanity/channels'
import type {
  LoaderPayloads,
  VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import { useEffect, useMemo } from 'react'
import { useClient } from 'sanity'

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
          '*',
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
          if (update.type !== 'mutation') {
            return
          }
          console.log('mutation', update)
          const slug: string | undefined = update.result?.slug?.current
          const tags = [
            update.documentId,
            update.result!._type,
            slug!,
          ] satisfies [string, string, string]
          console.log('tags', tags)
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
