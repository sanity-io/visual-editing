import Link from 'next/link'
import {Suspense} from 'react'
import Balancer from 'react-wrap-balancer'

import {AuthorAvatar, AuthorAvatarFallback} from './AuthorAvatar'
import CoverImage from './CoverImage'
import MoreStories from './MoreStories'
import Date from './PostDate'
import {postFields} from '@/lib/queries'
import {loadQuery} from '@/lib/loadQuery'

export default async function BlogIndexPage() {
  const data = await loadQuery<any>({
    query: /* groq */ `
*[_type == "post"] | order(publishedAt desc, _updatedAt desc) [0] {
  ${postFields}
}`,
  })
  const {_id, author, excerpt, mainImage, slug, title, publishedAt} = data ?? {}

  return (
    <>
      {data && (
        <article>
          <div className="mb-8 md:mb-16">
            <CoverImage slug={slug} title={title} image={mainImage} priority />
          </div>
          <div className="mb-20 md:mb-28 md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
            <div>
              <h3 className="mb-4 text-4xl leading-tight lg:text-6xl">
                {slug ? (
                  <Link href={`/${slug}`} className="hover:underline">
                    <Balancer>{title}</Balancer>
                  </Link>
                ) : (
                  <Balancer>{title}</Balancer>
                )}
              </h3>
              <div className="mb-4 text-lg md:mb-0">
                <Date dateString={publishedAt} />
              </div>
            </div>
            <div>
              {excerpt && (
                <p className="mb-4 text-lg leading-relaxed">
                  <Balancer>{excerpt}</Balancer>
                </p>
              )}
              {author?._ref && (
                <Suspense fallback={<AuthorAvatarFallback />}>
                  <AuthorAvatar id={author._ref} />
                </Suspense>
              )}
            </div>
          </div>
        </article>
      )}
      {_id && (
        <aside>
          <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
            More Stories
          </h2>
          <Suspense>
            <MoreStories skip={_id} limit={10} />
          </Suspense>
        </aside>
      )}
    </>
  )
}
