import { DocumentLocationResolver } from '@sanity/composer'
import { Observable, map } from 'rxjs'

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

  return null
}
