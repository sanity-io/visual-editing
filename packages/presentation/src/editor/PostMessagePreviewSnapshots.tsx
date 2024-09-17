import {memo, useEffect, useMemo, type FC} from 'react'
import {combineLatest, debounceTime, Subject, switchMap} from 'rxjs'
import {useDocumentPreviewStore, useSchema, type PreviewValue} from '../internals'
import type {VisualEditingConnection} from '../types'

type Ref = {
  _id: string
  _type: string
}

export interface PostMessagePreviewsProps {
  comlink: VisualEditingConnection
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
        type: 'presentation/preview-snapshots',
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
