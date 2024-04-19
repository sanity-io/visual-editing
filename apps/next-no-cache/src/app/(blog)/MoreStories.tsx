import Link from 'next/link'
import {Suspense} from 'react'

import {postFields} from '@/lib/queries'
import {AuthorAvatar, AuthorAvatarFallback} from './AuthorAvatar'
import CoverImage from './CoverImage'
import Date from './PostDate'
import {loadQuery} from '@/lib/loadQuery'

const query = /* groq */ `*[_type == "post" && _id != $skip] | order(date desc, _updatedAt desc) [0...$limit] {
  ${postFields}
}`

export default async function MoreStories(params: {skip: string; limit: number}) {
  const data = await loadQuery<any>({
    query,
    params,
  })

  return (
    <>
      <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
        {data.map((post: any) => {
          const {_id, title = 'Untitled', slug, mainImage, excerpt, author} = post
          return (
            <article key={_id}>
              <div className="mb-5">
                <CoverImage slug={slug} title={title} image={mainImage} priority={false} />
              </div>
              <h3 className="mb-3 text-3xl leading-snug">
                {slug ? (
                  <Link href={`/${slug}`} className="hover:underline">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </h3>
              <div className="mb-4 text-lg">
                <Date dateString={post.publishedAt} />
              </div>
              {excerpt && <p className="mb-4 text-lg leading-relaxed">{excerpt}</p>}
              {author?._ref && (
                <Suspense fallback={<AuthorAvatarFallback />}>
                  <AuthorAvatar id={author._ref} />
                </Suspense>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
