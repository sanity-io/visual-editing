import type {MoreStoriesQueryResult} from '@/sanity.types'
import {SanityLiveStream} from '@/sanity/lib/live'
import {moreStoriesQuery} from '@/sanity/lib/queries'
import Link from 'next/link'
import Avatar from './avatar'
import CoverImage from './cover-image'
import DateComponent from './date'

export default async function MoreStories(params: {skip: string; limit: number}) {
  // const {data} = await sanityFetch({query: moreStoriesQuery, params})

  return (
    <SanityLiveStream query={moreStoriesQuery} params={params}>
      {async ({data}: {data: MoreStoriesQueryResult}) => {
        'use server'

        return (
          <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
            {data?.map((post) => {
              const {_id, title, slug, coverImage, excerpt, author} = post
              return (
                <article key={_id}>
                  <Link href={`/posts/${slug}`} className="group mb-5 block">
                    <CoverImage image={coverImage} priority={false} />
                  </Link>
                  <h3 className="mb-3 text-balance text-3xl leading-snug">
                    <Link href={`/posts/${slug}`} className="hover:underline">
                      {title}
                    </Link>
                  </h3>
                  <div className="mb-4 text-lg">
                    <DateComponent dateString={post.date} />
                  </div>
                  {excerpt && <p className="mb-4 text-pretty text-lg leading-relaxed">{excerpt}</p>}
                  {author && <Avatar name={author.name} picture={author.picture} />}
                </article>
              )
            })}
          </div>
        )
      }}
    </SanityLiveStream>
  )
}
