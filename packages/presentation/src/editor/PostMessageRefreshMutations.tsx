import type {ChannelsController, ChannelStatus} from '@repo/channels'
import type {PresentationMsg, VisualEditingConnectionIds} from '@repo/visual-editing-helpers'
import {memo, startTransition, useEffect, useMemo, useState} from 'react'
import {type SanityDocument} from 'sanity'

import {getPublishedId, useEditState} from '../internals'

export interface PostMessageRefreshMutationsProps {
  id: string
  type: string
  channel: ChannelsController<VisualEditingConnectionIds, PresentationMsg>
  previewKitConnection: ChannelStatus
  loadersConnection: ChannelStatus
}

function PostMessageRefreshMutations(props: PostMessageRefreshMutationsProps): React.ReactNode {
  const {channel, type, previewKitConnection, loadersConnection} = props
  const id = useMemo(() => getPublishedId(props.id), [props.id])
  const {draft, published, ready} = useEditState(id, type, 'low')
  const livePreviewEnabled =
    previewKitConnection === 'connected' || loadersConnection === 'connected'

  if ((ready && draft) || published) {
    return (
      <PostMessageRefreshMutationsInner
        key={id}
        channel={channel}
        draft={draft}
        livePreviewEnabled={livePreviewEnabled}
        published={published}
      />
    )
  }

  return null
}

interface PostMessageRefreshMutationsInnerProps
  extends Pick<PostMessageRefreshMutationsProps, 'channel'> {
  livePreviewEnabled: boolean
  draft: SanityDocument | null
  published: SanityDocument | null
}
function PostMessageRefreshMutationsInner(props: PostMessageRefreshMutationsInnerProps) {
  const {channel, draft, published, livePreviewEnabled} = props
  const [prevDraft, setPrevDraft] = useState(draft)
  const [prevPublished, setPrevPublished] = useState(published)

  useEffect(() => {
    if (prevDraft?._rev !== draft?._rev) {
      startTransition(() => setPrevDraft(draft))
      if (draft) {
        channel?.send('overlays', 'presentation/refresh', {
          source: 'mutation',
          livePreviewEnabled,
          document: parseDocument(draft),
        })
      }
    }
    if (prevPublished?._rev !== published?._rev) {
      startTransition(() => setPrevPublished(published))
      if (published) {
        channel?.send('overlays', 'presentation/refresh', {
          source: 'mutation',
          livePreviewEnabled,
          document: parseDocument(published),
        })
      }
    }
  }, [channel, draft, livePreviewEnabled, prevDraft?._rev, prevPublished?._rev, published])

  return null
}

function parseDocument(document: SanityDocument & {slug?: {current?: string | null}}): {
  _id: string
  _type: string
  _rev: string
  slug?: {current?: string | null}
} {
  const {_id, _type, _rev, slug} = document
  return {_id, _type, _rev, slug}
}

export default memo(PostMessageRefreshMutations)
