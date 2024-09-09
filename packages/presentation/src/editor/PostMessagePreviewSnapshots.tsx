import type {VisualEditingControllerMsg, VisualEditingNodeMsg} from '@repo/visual-editing-helpers'
import type {ConnectionInstance} from '@sanity/comlink'
import {type FC, memo, useEffect, useMemo} from 'react'
import {combineLatest, debounceTime, Subject, switchMap} from 'rxjs'

import {type PreviewValue, useDocumentPreviewStore, useSchema} from '../internals'

type Ref = {
  _id: string
  _type: string
}

export interface PostMessagePreviewsProps {
  comlink: ConnectionInstance<VisualEditingNodeMsg, VisualEditingControllerMsg>
  refs: Ref[]
}

const PostMessagePreviews: FC<PostMessagePreviewsProps> = (props) => {
  const {comlink, refs} = props
  const documentPreviewStore = useDocumentPreviewStore()
  const schema = useSchema()

  const refsSubject = useMemo(() => new Subject<Ref[]>(), [])

  const previews$ = useMemo(() => {
    return refsSubject.asObservable().pipe(
      switchMap((refs) => {
        return combineLatest(
          refs.map((ref) => documentPreviewStore.observeForPreview(ref, schema.get(ref._type)!)),
        )
      }),
      debounceTime(0),
    )
  }, [documentPreviewStore, refsSubject, schema])

  useEffect(() => {
    const sub = previews$.subscribe((snapshots) => {
      comlink.post({
        type: 'presentation/previewSnapshots',
        data: {
          snapshots: snapshots
            .filter((s) => s.snapshot)
            .map((s) => s.snapshot as PreviewValue & {_id: string}),
        },
      })
    })

    return () => {
      sub.unsubscribe()
    }
  }, [comlink, previews$])

  useEffect(() => {
    refsSubject.next(refs)
  }, [refs, refsSubject])

  return null
}

export default memo(PostMessagePreviews)
