import { DocumentLocationResolver } from '@sanity/composer'
import { Observable, map } from 'rxjs'

export const locate: DocumentLocationResolver = (params, context) => {
  const { documentStore } = context

  if (params.type === 'shoe') {
    const queryParams = {
      id: params.id,
      draftId: `drafts.${params.id}`,
    }

    // Listen to the query and fetch the draft and published document
    const doc$ = documentStore
      .listenQuery(
        {
          listen: `*[(_id == $id || _id == $draftId) && defined(slug)]`,
          fetch: `{"draft":*[_id==$draftId]{slug,title}[0],"published":*[_id==$id]{slug,title}[0]}`,
        },
        queryParams,
        {},
      )
      .pipe(map((result) => result.draft || result.published)) as Observable<{
      slug: { current: string }
      title: string | null
    } | null>

    return doc$.pipe(
      map((doc) => {
        return {
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: `/shoes/${doc?.slug?.current}`,
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
