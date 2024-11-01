import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, useMemo, type FC} from 'react'
import {
  combineLatest,
  debounceTime,
  merge,
  NEVER,
  share,
  skipWhile,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs'
import {getDraftId, getPublishedId} from 'sanity'
import {useDocumentPreviewStore, useSchema, type PreviewValue} from '../internals'
import type {VisualEditingConnection} from '../types'

type Ref = {
  _id: string
  _type: string
}

export interface PostMessagePreviewsProps {
  comlink: VisualEditingConnection
  perspective: ClientPerspective | `bundle.${string}`
  bundlesPerspective: string[]
  refs: Ref[]
}

const PostMessagePreviews: FC<PostMessagePreviewsProps> = (props) => {
  const {comlink, refs, perspective} = props
  const documentPreviewStore = useDocumentPreviewStore()
  const schema = useSchema()

  const refsSubject = useMemo(() => new Subject<Ref[]>(), [])

  const previews$ = useMemo(() => {
    return refsSubject.asObservable().pipe(
      switchMap((refs) => {
        return combineLatest(
          refs.map((ref) => {
            const draftRef = {
              ...ref,
              _id: ref._id.startsWith('versions.') ? ref._id : getDraftId(ref._id),
            }

            // console.log(draftRef)
            const draft$ =
              perspective === 'previewDrafts'
                ? documentPreviewStore
                    .observeForPreview(draftRef, schema.get(draftRef._type)!)
                    .pipe(
                      // Share to prevent double subscribe in the merge
                      share(),
                      // Don't emit if no snapshot is returned
                      skipWhile((p) => p.snapshot === null),
                    )
                : // Don't emit if not displaying drafts
                  NEVER

            const publishedRef = {...ref, _id: getPublishedId(ref._id)}
            const published$ = documentPreviewStore.observeForPreview(
              publishedRef,
              schema.get(publishedRef._type)!,
            )

            return merge(published$.pipe(takeUntil(draft$)), draft$)
          }),
        )
      }),
      debounceTime(0),
    )
  }, [documentPreviewStore, refsSubject, schema, perspective])

  useEffect(() => {
    const sub = previews$.subscribe((snapshots) => {
      comlink.post({
        type: 'presentation/preview-snapshots',
        data: {
          snapshots: snapshots
            .filter((s) => s.snapshot)
            .map((s) => {
              const snapshot = s.snapshot as PreviewValue & {_id: string}
              // console.log(snapshot._id)

              return {...snapshot, _id: getPublishedId(snapshot._id)}
            }),
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
