import {
  DocumentLocationResolver,
  DocumentLocationsState,
} from '../../packages/presentation/src'
import { Observable, combineLatest, map, switchMap } from 'rxjs'

export const locate: DocumentLocationResolver = (params, context) => {
  const { documentStore } = context

  if (params.type === 'shoe') {
    // Listen to the query and fetch the draft and published document
    const doc$ = documentStore.listenQuery(
      `*[_id == $id][0]{slug,title}`,
      params,
      { perspective: 'previewDrafts' },
    ) as Observable<{
      slug: { current: string | null } | null
      title: string | null
    } | null>

    return doc$.pipe(
      map((doc) => {
        if (!doc || !doc.slug?.current) return null

        return {
          locations: [
            {
              title: doc.title || 'Untitled',
              href: `/shoes/${doc.slug.current}`,
            },
            {
              title: 'Shoes',
              href: `/shoes`,
            },
          ],
        }
      }),
    )
  }

  if (params.type === 'siteSettings') {
    return {
      message: 'This document is used on all pages',
      locations: [
        {
          title: 'Home',
          href: '/',
        },
      ],
    } satisfies DocumentLocationsState
  }

  if (params.type === 'product') {
    const doc$ = context.documentStore.listenQuery(
      `*[_id==$id]{slug,title}[0]`,
      params,
      { perspective: 'previewDrafts' },
    ) as Observable<{
      slug: { current: string }
      title: string | null
    } | null>

    return doc$.pipe(
      map((doc) => {
        return {
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: `/product/${doc?.slug?.current}`,
            },
            {
              title: 'Products',
              href: '/products',
            },
          ],
          // message: 'This document is used on multiple pages',
        } satisfies DocumentLocationsState
      }),
    )
  }

  if (params.type === 'project') {
    const doc$ = context.documentStore.listenQuery(
      `*[_id==$id]{slug,title}[0]`,
      params,
      { perspective: 'previewDrafts' },
    ) as Observable<{
      slug: { current: string }
      title: string | null
    } | null>

    return doc$.pipe(
      map((doc) => {
        return {
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: `/product/${doc?.slug?.current}`,
            },
            {
              title: 'Projects',
              href: '/projects',
            },
          ],
          // message: 'This document is used on multiple pages',
        } satisfies DocumentLocationsState
      }),
    )
  }

  return null
}
