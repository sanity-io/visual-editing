import type {PreviewSnapshot} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import {memo, useEffect, useMemo, type FC} from 'react'
import {
  combineLatest,
  debounceTime,
  filter,
  map,
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
  perspective: ClientPerspective
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
            const draftRef = {...ref, _id: getDraftId(ref._id)}
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

            return merge(published$.pipe(takeUntil(draft$)), draft$).pipe(
              filter((p) => !!p.snapshot),
              map((p) => {
                const snapshot = p.snapshot as PreviewValue & {
                  _id: string
                }
                return {
                  _id: getPublishedId(snapshot._id),
                  title: snapshot.title,
                  subtitle: snapshot.subtitle,
                  description: snapshot.description,
                  imageUrl: snapshot.imageUrl,
                } as PreviewSnapshot
              }),
            )
          }),
        )
      }),
      debounceTime(0),
    )
  }, [documentPreviewStore, refsSubject, schema, perspective])

  useEffect(() => {
    const sub = previews$.subscribe((snapshots) => {
      comlink.post('presentation/preview-snapshots', {snapshots})
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
